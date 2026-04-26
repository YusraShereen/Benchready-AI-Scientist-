import { useState } from 'react'
import './App.css'
import HypothesisInput from './components/HypothesisInput'
import LiteratureQC from './components/LiteratureQC'
import PlanViewer from './components/PlanViewer'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [stage, setStage] = useState('input')
  const [hypothesis, setHypothesis] = useState('')
  const [qcResult, setQcResult] = useState(null)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const handleHypothesisSubmit = async (hyp) => {
    setHypothesis(hyp)
    setError('')
    setStage('qc_loading')
    try {
      const res = await fetch(`${API_BASE}/api/literature-qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: hyp })
      })
      if (!res.ok) throw new Error(`QC failed: ${res.statusText}`)
      const data = await res.json()
      setQcResult(data)
      setStage('qc_done')
    } catch (e) {
      setError(e.message)
      setStage('input')
    }
  }

  const handleGeneratePlan = async () => {
    setError('')
    setStage('plan_loading')
    try {
      const res = await fetch(`${API_BASE}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis })
      })
      if (!res.ok) throw new Error(`Plan generation failed: ${res.statusText}`)
      const data = await res.json()
      setPlan(data)
      setStage('plan_done')
    } catch (e) {
      setError(e.message)
      setStage('qc_done')
    }
  }

  const handleReset = () => {
    setStage('input')
    setHypothesis('')
    setQcResult(null)
    setPlan(null)
    setError('')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-icon">⚗</div>
            <div>
              <div className="logo-title">AI Scientist</div>
              <div className="logo-sub">Hypothesis → Runnable Experiment Plan</div>
            </div>
          </div>
          {stage !== 'input' && (
            <button className="btn-ghost" onClick={handleReset}>← New Hypothesis</button>
          )}
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {stage === 'input' && (
          <HypothesisInput onSubmit={handleHypothesisSubmit} />
        )}

        {stage === 'qc_loading' && (
          <div className="loading-screen">
            <div className="spinner" />
            <h2>Scanning Literature</h2>
            <p>Checking Semantic Scholar &amp; arXiv for prior work…</p>
            <div className="loading-hypothesis">"{hypothesis.slice(0, 130)}{hypothesis.length > 130 ? '…' : ''}"</div>
          </div>
        )}

        {(stage === 'qc_done' || stage === 'plan_loading' || stage === 'plan_done') && qcResult && (
          <LiteratureQC
            result={qcResult}
            hypothesis={hypothesis}
            onGenerate={handleGeneratePlan}
            isGenerating={stage === 'plan_loading'}
            planReady={stage === 'plan_done'}
          />
        )}

        {stage === 'plan_loading' && (
          <div className="loading-screen plan-loading" style={{marginTop:'2rem'}}>
            <div className="spinner large" />
            <h2>Generating Experiment Plan</h2>
            <div className="loading-steps">
              {[
                'Analyzing hypothesis structure…',
                'Retrieving relevant protocols…',
                'Sourcing reagents & catalog numbers…',
                'Estimating budget & timeline…',
                'Defining validation criteria…',
              ].map((s, i) => (
                <div key={i} className="loading-step active">{s}</div>
              ))}
            </div>
          </div>
        )}

        {stage === 'plan_done' && plan && (
          <PlanViewer plan={plan} hypothesis={hypothesis} />
        )}
      </main>

      <footer className="app-footer">
        <span>Powered by Groq · Semantic Scholar · arXiv</span>
        <span>Global AI Hackathon 2026 · Challenge 04</span>
      </footer>
    </div>
  )
}
