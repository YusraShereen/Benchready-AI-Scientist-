import { useState } from 'react'

const SAMPLE_HYPOTHESES = [
  {
    label: "🩸 Diagnostics",
    color: "#00d4ff",
    short: "Point-of-care CRP biosensor",
    text: "A paper-based electrochemical biosensor functionalized with anti-CRP antibodies will detect C-reactive protein in whole blood at concentrations below 0.5 mg/L within 10 minutes, matching laboratory ELISA sensitivity without requiring sample preprocessing."
  },
  {
    label: "🦠 Gut Health",
    color: "#00ff88",
    short: "Probiotic gut barrier study",
    text: "Supplementing C57BL/6 mice with Lactobacillus rhamnosus GG for 4 weeks will reduce intestinal permeability by at least 30% compared to controls, measured by FITC-dextran assay, due to upregulation of tight junction proteins claudin-1 and occludin."
  },
  {
    label: "🧫 Cell Biology",
    color: "#a855f7",
    short: "Trehalose cryoprotection",
    text: "Replacing sucrose with trehalose as a cryoprotectant in the freezing medium will increase post-thaw viability of HeLa cells by at least 15 percentage points compared to the standard DMSO protocol, due to trehalose's superior membrane stabilization at low temperatures."
  },
  {
    label: "🌍 Climate",
    color: "#ffd60a",
    short: "Microbial CO₂ fixation",
    text: "Introducing Sporomusa ovata into a bioelectrochemical system at a cathode potential of −400mV vs SHE will fix CO₂ into acetate at a rate of at least 150 mmol/L/day, outperforming current biocatalytic carbon capture benchmarks by at least 20%."
  }
]

export default function HypothesisInput({ onSubmit }) {
  const [value, setValue] = useState('')
  const [activeCard, setActiveCard] = useState(null)

  const handleSubmit = () => {
    if (value.trim().length < 20) return
    onSubmit(value.trim())
  }

  const handleSample = (sample, idx) => {
    setValue(sample.text)
    setActiveCard(idx)
  }

  return (
    <div className="input-page">

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          FULCRUM SCIENCE × GLOBAL AI HACKATHON
        </div>
        <h1 className="hero-title">
          The <em>AI Scientist</em>
        </h1>
        <p className="hero-sub">
          Write a hypothesis. Get a complete lab-ready experiment plan —
          protocol, reagents, budget, timeline &amp; validation in 30 seconds.
        </p>
      </div>

      {/* INPUT BOX */}
      <div className="input-box">
        <div className="input-box-top">
          <span className="input-box-label">SCIENTIFIC HYPOTHESIS</span>
          <span className="input-box-hint">⌘ + Enter to submit</span>
        </div>
        <textarea
          className="hyp-textarea"
          placeholder="Describe your hypothesis with a specific intervention, measurable outcome, and mechanism. The more precise, the better the plan."
          value={value}
          onChange={e => { setValue(e.target.value); setActiveCard(null) }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          rows={4}
        />
        <div className="input-box-footer">
          <span className="char-count">
            {value.length} chars
            {value.length > 0 && value.length < 60 && <span className="char-warn"> — add more detail for best results</span>}
          </span>
          <button className="btn-run" onClick={handleSubmit} disabled={value.trim().length < 20}>
            Run Literature QC →
          </button>
        </div>
      </div>

      {/* SAMPLE CARDS */}
      <div className="samples-wrap">
        <div className="samples-header">
          <span className="samples-label">SAMPLE HYPOTHESES</span>
          <span className="samples-sub">click to load</span>
        </div>
        <div className="samples-grid">
          {SAMPLE_HYPOTHESES.map((s, i) => (
            <button
              key={i}
              className={`sample-card ${activeCard === i ? 'active' : ''}`}
              style={{ '--card-color': s.color }}
              onClick={() => handleSample(s, i)}
            >
              <div className="sample-top">
                <span className="sample-label">{s.label}</span>
                {activeCard === i && <span className="sample-loaded">✓ Loaded</span>}
              </div>
              <div className="sample-short">{s.short}</div>
              <div className="sample-preview">{s.text.slice(0, 88)}…</div>
            </button>
          ))}
        </div>
      </div>

      {/* WHAT YOU GET */}
      <div className="deliverables">
        <div className="deliverables-label">WHAT YOU RECEIVE</div>
        <div className="deliverables-grid">
          {[
            ['🔍', 'Literature QC', 'Novel / Similar / Exact match with references'],
            ['🧪', 'Protocol', 'Step-by-step methodology from real published protocols'],
            ['🧬', 'Materials', 'Reagents with catalog numbers & suppliers'],
            ['💰', 'Budget', 'Realistic line-item cost estimate in USD'],
            ['📅', 'Timeline', 'Phased breakdown with dependencies & milestones'],
            ['✓', 'Validation', 'Success criteria, controls & statistical analysis'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="deliverable-item">
              <span className="deliverable-icon">{icon}</span>
              <div>
                <div className="deliverable-title">{title}</div>
                <div className="deliverable-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .input-page {
          max-width: 820px;
          margin: 0 auto;
          padding: 2.5rem 0 4rem;
        }
        .hero {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          color: var(--accent-cyan);
          margin-bottom: 1.25rem;
          text-transform: uppercase;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          background: var(--accent-cyan);
          border-radius: 50%;
          animation: blink 2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .hero-title {
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .hero-title em {
          font-style: normal;
          color: var(--accent-cyan);
        }
        .hero-sub {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }
        .input-box {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          margin-bottom: 1.25rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-box:focus-within {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 1px rgba(0,212,255,0.12);
        }
        .input-box-top {
          display: flex;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .hyp-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 1rem;
          font-family: var(--font-display);
          font-size: 0.9rem;
          line-height: 1.65;
          outline: none;
          resize: none;
        }
        .hyp-textarea::placeholder { color: var(--text-muted); }
        .input-box-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 1rem;
          border-top: 1px solid var(--border);
        }
        .char-count {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .char-warn { color: var(--accent-yellow); }
        .btn-run {
          background: var(--accent-cyan);
          color: #060a0f;
          border: none;
          padding: 0.6rem 1.5rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
          clip-path: polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%);
        }
        .btn-run:hover { background: #33ddff; box-shadow: 0 0 20px rgba(0,212,255,0.35); }
        .btn-run:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .samples-wrap { margin-bottom: 1.5rem; }
        .samples-header {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 0.6rem;
        }
        .samples-label {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .samples-sub {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          color: var(--text-muted);
          opacity: 0.5;
        }
        .samples-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .sample-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 0.85rem 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          overflow: hidden;
        }
        .sample-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--card-color);
          opacity: 0;
          transition: opacity 0.15s;
        }
        .sample-card:hover, .sample-card.active {
          border-color: var(--card-color);
          background: var(--bg-card-hover);
        }
        .sample-card:hover::before, .sample-card.active::before { opacity: 1; }
        .sample-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .sample-label {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          color: var(--card-color);
          text-transform: uppercase;
        }
        .sample-loaded {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          color: var(--accent-green);
        }
        .sample-short {
          font-weight: 700;
          font-size: 0.82rem;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }
        .sample-preview {
          font-size: 0.74rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .deliverables {
          border: 1px solid var(--border);
          padding: 1.1rem 1.25rem;
          background: var(--bg-secondary);
        }
        .deliverables-label {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          margin-bottom: 0.9rem;
          text-transform: uppercase;
        }
        .deliverables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.7rem;
        }
        .deliverable-item {
          display: flex;
          gap: 0.55rem;
          align-items: flex-start;
        }
        .deliverable-icon { font-size: 0.95rem; line-height: 1.5; }
        .deliverable-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.1rem;
        }
        .deliverable-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}
