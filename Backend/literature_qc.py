import httpx
import asyncio
import re

SEMANTIC_SCHOLAR_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
ARXIV_URL = "http://export.arxiv.org/api/query"

async def search_semantic_scholar(query: str, limit: int = 8) -> list[dict]:
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,abstract,year,authors,url,paperId,citationCount"
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(SEMANTIC_SCHOLAR_URL, params=params)
            if resp.status_code == 200:
                return resp.json().get("data", [])
    except Exception as e:
        print(f"Semantic Scholar error: {e}")
    return []

async def search_arxiv(query: str, max_results: int = 5) -> list[dict]:
    params = {"search_query": f"all:{query}", "start": 0, "max_results": max_results}
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(ARXIV_URL, params=params)
            if resp.status_code == 200:
                return parse_arxiv(resp.text)
    except Exception as e:
        print(f"arXiv error: {e}")
    return []

def parse_arxiv(xml_text: str) -> list[dict]:
    papers = []
    for entry in re.findall(r'<entry>(.*?)</entry>', xml_text, re.DOTALL):
        title  = re.search(r'<title>(.*?)</title>', entry, re.DOTALL)
        summ   = re.search(r'<summary>(.*?)</summary>', entry, re.DOTALL)
        id_    = re.search(r'<id>(.*?)</id>', entry)
        pub    = re.search(r'<published>(.*?)</published>', entry)
        if title:
            papers.append({
                "title":    title.group(1).strip().replace('\n', ' '),
                "abstract": (summ.group(1).strip().replace('\n', ' ')[:400] if summ else ""),
                "url":      (id_.group(1).strip() if id_ else ""),
                "year":     (pub.group(1)[:4] if pub else "N/A"),
                "source":   "arXiv",
                "authors":  []
            })
    return papers

def tokenize(text: str) -> set[str]:
    """Extract meaningful scientific tokens (length > 4, non-stopword)."""
    STOP = {"will","have","this","that","than","with","from","into","also","been","they",
            "their","which","where","when","were","there","using","used","based","study",
            "show","showed","shows","increase","decrease","higher","lower","compared",
            "least","points","percent","percentage","effect","effects","result","results"}
    tokens = re.findall(r'[a-zA-Z0-9_\-]{4,}', text.lower())
    return {t for t in tokens if t not in STOP}

def score_paper(paper: dict, hyp_tokens: set[str]) -> int:
    """Score a paper by token overlap with hypothesis."""
    combined = (paper.get("title","") + " " + paper.get("abstract","")).lower()
    paper_tokens = tokenize(combined)
    return len(hyp_tokens & paper_tokens)

def compute_novelty_signal(papers: list[dict], hypothesis: str) -> tuple[str, list[dict]]:
    """
    Returns (signal, top_papers_sorted_by_score).
    Thresholds tuned so most well-studied topics get 'similar_work_exists'.
    """
    if not papers:
        return "not_found", []

    hyp_tokens = tokenize(hypothesis)
    if not hyp_tokens:
        return "not_found", []

    scored = sorted(
        [(score_paper(p, hyp_tokens), p) for p in papers],
        key=lambda x: x[0],
        reverse=True
    )

    top_score = scored[0][0]
    hyp_size  = len(hyp_tokens)

    # Fraction of hypothesis tokens matched in best paper
    overlap = top_score / hyp_size if hyp_size else 0

    # How many papers have decent overlap
    decent_count = sum(1 for s, _ in scored if s >= 3)

    if overlap >= 0.35 or top_score >= 14:
        signal = "exact_match_found"
    elif overlap >= 0.15 or top_score >= 6 or decent_count >= 3:
        signal = "similar_work_exists"
    else:
        signal = "not_found"

    top_papers = [p for _, p in scored[:5]]
    return signal, top_papers

def extract_query(hypothesis: str) -> str:
    """Extract concise search query — keep scientific nouns & named entities."""
    STOP = {"will","the","a","an","of","in","at","by","for","with","and","or","to",
            "that","this","is","are","be","as","due","from","into","its","can","we"}
    words = hypothesis.replace('−','').replace('₂','2').split()
    key   = [w.strip('.,;:()') for w in words
             if w.lower().strip('.,;:()') not in STOP and len(w) > 3]
    return " ".join(key[:12])

def format_references(papers: list[dict], max_refs: int = 3) -> list[dict]:
    refs = []
    for p in papers[:max_refs]:
        if not p.get("title"):
            continue
        authors = p.get("authors", [])
        if authors and isinstance(authors[0], dict):
            author_str = authors[0].get("name", "Unknown")
            if len(authors) > 1:
                author_str += " et al."
        else:
            author_str = "See source"

        url = p.get("url") or ""
        if not url and p.get("paperId"):
            url = f"https://www.semanticscholar.org/paper/{p['paperId']}"

        refs.append({
            "title":     p.get("title", ""),
            "authors":   author_str,
            "year":      str(p.get("year", "N/A")),
            "url":       url,
            "source":    p.get("source", "Semantic Scholar"),
            "relevance": "Related methodology or subject matter"
        })
    return refs

async def run_literature_qc(hypothesis: str) -> dict:
    query = extract_query(hypothesis)

    # Run both searches in parallel
    ss_papers, arxiv_papers = await asyncio.gather(
        search_semantic_scholar(query, limit=8),
        search_arxiv(query, max_results=5)
    )

    # Tag sources
    for p in ss_papers:
        p.setdefault("source", "Semantic Scholar")
    for p in arxiv_papers:
        p.setdefault("source", "arXiv")

    all_papers = ss_papers + arxiv_papers
    signal, top_papers = compute_novelty_signal(all_papers, hypothesis)
    references = format_references(top_papers)

    LABELS = {
        "not_found":         "Novel — No prior work found",
        "similar_work_exists": "Similar work exists",
        "exact_match_found": "Exact or near-exact match found"
    }
    COLORS = {
        "not_found": "green",
        "similar_work_exists": "yellow",
        "exact_match_found": "red"
    }

    return {
        "signal":             signal,
        "signal_label":       LABELS[signal],
        "signal_color":       COLORS[signal],
        "references":         references,
        "search_query_used":  query,
        "total_results_found": len(all_papers)
    }
