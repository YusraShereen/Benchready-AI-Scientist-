from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from literature_qc import run_literature_qc
from plan_generator import generate_experiment_plan
from feedback_store import save_feedback, get_feedback_for_domain, FeedbackEntry

load_dotenv()

app = FastAPI(title="AI Scientist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HypothesisRequest(BaseModel):
    hypothesis: str

class FeedbackRequest(BaseModel):
    plan_id: str
    experiment_type: str
    domain: str
    section: str  # protocol | materials | budget | timeline | validation
    rating: int   # 1-5
    original_text: str
    corrected_text: Optional[str] = None
    annotation: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/literature-qc")
async def literature_qc(req: HypothesisRequest):
    try:
        result = await run_literature_qc(req.hypothesis)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-plan")
async def generate_plan(req: HypothesisRequest):
    try:
        plan = await generate_experiment_plan(req.hypothesis)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    try:
        entry = FeedbackEntry(**req.dict())
        save_feedback(entry)
        return {"status": "saved", "message": "Feedback recorded. Future plans in this domain will improve."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/feedback/{domain}")
async def get_feedback(domain: str):
    try:
        entries = get_feedback_for_domain(domain)
        return {"domain": domain, "count": len(entries), "entries": entries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
