import sqlite3
import json
import os
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "feedback.db")

DOMAIN_KEYWORDS = {
    "diagnostics": ["biosensor", "elisa", "crp", "antibody", "detection", "assay", "blood", "diagnostic", "immunoassay"],
    "cell_biology": ["cell", "hela", "viability", "cryoprotectant", "dmso", "trehalose", "culture", "transfection", "apoptosis"],
    "gut_health": ["microbiome", "lactobacillus", "probiotic", "intestinal", "permeability", "fitc-dextran", "claudin", "gut", "mice"],
    "climate": ["co2", "carbon", "sporomusa", "bioelectrochemical", "acetate", "cathode", "biocatalytic", "capture"],
    "pharmacology": ["drug", "ic50", "dose", "toxicity", "inhibitor", "compound", "pharmacokinetics", "therapeutic"],
    "genomics": ["pcr", "sequencing", "rna", "dna", "mrna", "gene", "expression", "crispr", "primer", "amplification"],
    "materials": ["synthesis", "nanoparticle", "coating", "polymer", "material", "substrate", "fabrication", "solar"]
}

def detect_domain(hypothesis: str) -> str:
    """Detect the scientific domain from hypothesis text."""
    hyp_lower = hypothesis.lower()
    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        scores[domain] = sum(1 for kw in keywords if kw in hyp_lower)
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "other"

@dataclass
class FeedbackEntry:
    plan_id: str
    experiment_type: str
    domain: str
    section: str
    rating: int
    original_text: str
    corrected_text: Optional[str] = None
    annotation: Optional[str] = None
    timestamp: Optional[str] = None

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.utcnow().isoformat()

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id TEXT NOT NULL,
            experiment_type TEXT,
            domain TEXT,
            section TEXT,
            rating INTEGER,
            original_text TEXT,
            corrected_text TEXT,
            annotation TEXT,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_feedback(entry: FeedbackEntry):
    init_db()
    conn = get_connection()
    conn.execute("""
        INSERT INTO feedback 
        (plan_id, experiment_type, domain, section, rating, original_text, corrected_text, annotation, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry.plan_id, entry.experiment_type, entry.domain, entry.section,
        entry.rating, entry.original_text, entry.corrected_text,
        entry.annotation, entry.timestamp
    ))
    conn.commit()
    conn.close()

def get_feedback_for_domain(domain: str, limit: int = 10) -> list[dict]:
    """Get recent feedback entries for a domain, ordered by rating desc."""
    init_db()
    conn = get_connection()
    rows = conn.execute("""
        SELECT * FROM feedback 
        WHERE domain = ? AND corrected_text IS NOT NULL AND corrected_text != original_text
        ORDER BY rating DESC, timestamp DESC
        LIMIT ?
    """, (domain, limit)).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_all_feedback(limit: int = 50) -> list[dict]:
    init_db()
    conn = get_connection()
    rows = conn.execute("""
        SELECT * FROM feedback ORDER BY timestamp DESC LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Initialize on import
init_db()
