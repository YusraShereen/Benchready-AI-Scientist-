import os
import json
import uuid
import httpx
from feedback_store import get_feedback_for_domain, detect_domain

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

JSON_SCHEMA = """
{
  "plan_id": "unique string id",
  "title": "Short descriptive experiment title",
  "hypothesis_rephrased": "Clean one-sentence restatement of the hypothesis",
  "domain": "one of: diagnostics | cell_biology | gut_health | climate | pharmacology | genomics | materials | other",
  "experiment_type": "e.g. ELISA, PCR, cell culture, biosensor fabrication, etc.",
  "overview": "2-3 sentence plain-English summary of what the experiment does and why",
  "protocol": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed step description with concentrations, temperatures, durations",
      "duration": "e.g. 2 hours",
      "equipment": ["list of equipment needed"],
      "critical_notes": "Safety or quality-critical information"
    }
  ],
  "materials": [
    {
      "name": "Reagent or material name",
      "catalog_number": "e.g. Sigma-Aldrich #A9418",
      "supplier": "Sigma-Aldrich | Thermo Fisher | VWR | etc.",
      "quantity": "e.g. 100 mg",
      "unit_cost_usd": 45.00,
      "total_cost_usd": 90.00,
      "notes": "Storage conditions or alternatives"
    }
  ],
  "budget": {
    "total_usd": 0,
    "breakdown": [
      {"category": "Reagents & Consumables", "amount_usd": 0},
      {"category": "Equipment (rental/depreciation)", "amount_usd": 0},
      {"category": "Cell lines / biological materials", "amount_usd": 0},
      {"category": "Labor (technician hours)", "amount_usd": 0},
      {"category": "Contingency (10%)", "amount_usd": 0}
    ]
  },
  "timeline": [
    {
      "phase": "Phase 1: Setup & Procurement",
      "week": "Week 1-2",
      "tasks": ["Task 1", "Task 2"],
      "dependencies": [],
      "milestone": "All materials received and equipment calibrated"
    }
  ],
  "team": {
    "minimum_headcount": 2,
    "roles": [
      {"role": "Principal Investigator", "fte": 0.1, "responsibilities": "Oversight and QC"},
      {"role": "Lab Technician", "fte": 0.5, "responsibilities": "Protocol execution"}
    ]
  },
  "validation": {
    "primary_endpoint": "Main measurable outcome",
    "success_criteria": "Specific quantitative threshold for success",
    "failure_criteria": "What would indicate the hypothesis is false",
    "controls": [
      {"type": "Positive control", "description": "What and why"},
      {"type": "Negative control", "description": "What and why"}
    ],
    "statistical_analysis": "e.g. Student's t-test, ANOVA, n=6 per group, p<0.05",
    "expected_challenges": ["Challenge 1", "Challenge 2"]
  },
  "safety": {
    "hazard_classification": "e.g. BSL-1, chemical hazards",
    "ppe_required": ["Lab coat", "Gloves", "Safety goggles"],
    "waste_disposal": "Disposal instructions"
  },
  "references": [
    {"citation": "Author et al. (Year). Title. Journal.", "relevance": "Protocol basis"}
  ]
}
"""

SYSTEM_PROMPT = """You are a world-class experimental scientist and CRO project manager with 20 years of experience across diagnostics, cell biology, pharmacology, genomics, and materials science.

Your job is to generate COMPLETE, OPERATIONALLY REALISTIC experiment plans. These plans will be used by real scientists to order materials and run experiments on Monday. Every detail must be accurate.

Rules:
1. Use REAL catalog numbers from Sigma-Aldrich, Thermo Fisher, VWR, ATCC, Addgene
2. Use REALISTIC costs in USD (check typical market prices)
3. Ground every protocol step in published methodology (cite the basis)
4. Include specific concentrations, temperatures, durations — no vague instructions
5. The validation section must include specific quantitative thresholds
6. Return ONLY valid JSON matching the schema exactly — no preamble, no markdown fences

Schema to follow:
""" + JSON_SCHEMA

def build_few_shot_context(domain: str, experiment_type: str) -> str:
    """Pull prior scientist corrections as few-shot examples."""
    corrections = get_feedback_for_domain(domain, limit=5)
    if not corrections:
        return ""

    examples = []
    for c in corrections:
        if c.get("corrected_text") and c.get("original_text") != c.get("corrected_text"):
            examples.append(
                f"[SCIENTIST CORRECTION — {c['section'].upper()}]\n"
                f"Original: {c['original_text'][:200]}\n"
                f"Expert correction: {c['corrected_text'][:200]}\n"
                f"Note: {c.get('annotation', '')}"
            )

    if not examples:
        return ""

    return "\n\nPRIOR SCIENTIST FEEDBACK FOR THIS DOMAIN (incorporate these learnings):\n" + "\n---\n".join(examples[:3])

async def call_groq(messages: list[dict]) -> str:
    """Call Groq API."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in environment")

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 4000,
                "response_format": {"type": "json_object"}
            }
        )
        if resp.status_code != 200:
            raise ValueError(f"Groq API error {resp.status_code}: {resp.text}")

        data = resp.json()
        return data["choices"][0]["message"]["content"]

async def generate_experiment_plan(hypothesis: str) -> dict:
    """Generate a full experiment plan for a given hypothesis."""
    domain = detect_domain(hypothesis)
    few_shot = build_few_shot_context(domain, "")

    user_message = f"""Generate a complete experiment plan for the following hypothesis:

{hypothesis}

Domain detected: {domain}
{few_shot}

Return the full JSON plan. Be specific, realistic, and operationally complete."""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]

    raw = await call_groq(messages)

    try:
        plan = json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            plan = json.loads(match.group())
        else:
            raise ValueError("Failed to parse JSON from LLM response")

    # Ensure plan_id exists
    if "plan_id" not in plan:
        plan["plan_id"] = str(uuid.uuid4())

    # Calculate total budget if not set
    if plan.get("materials"):
        total = sum(m.get("total_cost_usd", 0) for m in plan["materials"])
        if plan.get("budget"):
            plan["budget"]["total_usd"] = plan["budget"].get("total_usd") or total

    return plan
