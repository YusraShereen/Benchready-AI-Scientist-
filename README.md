# 🔬 AI Scientist
### Hypothesis → Runnable Experiment Plan
Built for the 5th Global AI Hackathon · Powered by Fulcrum Science

---

## What It Does

Enter a scientific hypothesis → get a complete, lab-ready experiment plan in ~30 seconds.

1. **Literature QC** — checks Semantic Scholar + arXiv for prior work (novel / similar / exact match)
2. **Experiment Plan** — protocol steps, materials with catalog numbers, budget, timeline, validation criteria
3. **Scientist Feedback Loop** — corrections improve future plans (stretch goal ✓)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + CSS Variables |
| Backend | FastAPI + Python |
| LLM | Groq (LLaMA 3.3 70B) — free |
| Literature | Semantic Scholar API + arXiv — no key needed |
| Feedback store | SQLite |

---

## Setup (5 minutes)

### 1. Get your Groq API key (free)
→ https://console.groq.com
→ Create account → API Keys → Create key → Copy it

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/literature-qc` | Run novelty check on hypothesis |
| POST | `/api/generate-plan` | Generate full experiment plan |
| POST | `/api/feedback` | Submit scientist correction |
| GET | `/api/feedback/{domain}` | Retrieve corrections for domain |

### Example request

```bash
curl -X POST http://localhost:8000/api/literature-qc \
  -H "Content-Type: application/json" \
  -d '{"hypothesis": "Replacing sucrose with trehalose as a cryoprotectant will increase post-thaw HeLa cell viability by 15%"}'
```

---

## Sample Hypotheses to Test

**Diagnostics:**
> A paper-based electrochemical biosensor functionalized with anti-CRP antibodies will detect C-reactive protein in whole blood at concentrations below 0.5 mg/L within 10 minutes, matching laboratory ELISA sensitivity without requiring sample preprocessing.

**Gut Health:**
> Supplementing C57BL/6 mice with Lactobacillus rhamnosus GG for 4 weeks will reduce intestinal permeability by at least 30% compared to controls, measured by FITC-dextran assay.

**Cell Biology:**
> Replacing sucrose with trehalose as a cryoprotectant in the freezing medium will increase post-thaw viability of HeLa cells by at least 15 percentage points compared to the standard DMSO protocol.

**Climate:**
> Introducing Sporomusa ovata into a bioelectrochemical system at a cathode potential of −400mV vs SHE will fix CO₂ into acetate at a rate of at least 150 mmol/L/day.

---

## How the Feedback Loop Works (Stretch Goal)

1. Generate a plan → click "Scientist Review"
2. Select a section (protocol / materials / budget / timeline / validation)
3. Paste original text + corrected version + explanation
4. Correction saved to SQLite with domain tag
5. Next plan for same domain: corrections injected as few-shot examples into prompt
6. Demo it live: generate → correct → generate similar → show improvement ✓

---

## Project Structure

```
ai-scientist/
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── literature_qc.py     # Semantic Scholar + arXiv search
│   ├── plan_generator.py    # Groq LLM + structured JSON output
│   ├── feedback_store.py    # SQLite feedback + domain detection
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app + routing
│   │   ├── App.css          # Dark scientific design system
│   │   └── components/
│   │       ├── HypothesisInput.jsx  # Step 1: input + samples
│   │       ├── LiteratureQC.jsx     # Step 2: novelty signal + refs
│   │       ├── PlanViewer.jsx       # Step 3: tabbed plan viewer
│   │       └── FeedbackPanel.jsx    # Stretch: scientist corrections
└── README.md
```

---

## Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Push to GitHub → connect Vercel → auto-deploy
# Set REACT_APP_API_URL=https://your-backend.railway.app
```

**Backend → Railway**
```bash
# Push to GitHub → connect Railway
# Set GROQ_API_KEY in Railway environment variables
```

---
