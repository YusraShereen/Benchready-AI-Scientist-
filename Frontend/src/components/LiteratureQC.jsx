import React from 'react';

const SIGNAL_CONFIG = {
  not_found: {
    icon: '◆',
    color: 'green',
    title: 'Novel Research',
    description: 'No prior work found matching this hypothesis. You may be breaking new ground.'
  },
  similar_work_exists: {
    icon: '◈',
    color: 'yellow',
    title: 'Similar Work Exists',
    description: 'Related experiments have been published. Review the references before proceeding.'
  },
  exact_match_found: {
    icon: '◉',
    color: 'red',
    title: 'Exact or Near-Exact Match',
    description: 'This experiment has been done before. Consider differentiating your approach.'
  }
};

export default function LiteratureQC({ result, hypothesis, onGenerate, isGenerating, planReady }) {
  const config = SIGNAL_CONFIG[result.signal] || SIGNAL_CONFIG.not_found;

  return (
    <div className="qc-page">
      <div className="qc-header">
        <div className="card-label">STEP 2 OF 3 — LITERATURE QC</div>
        <div className="qc-hypothesis-preview">"{hypothesis.slice(0, 150)}{hypothesis.length > 150 ? '...' : ''}"</div>
      </div>

      <div className={`qc-signal-card signal-${config.color}`}>
        <div className="signal-icon">{config.icon}</div>
        <div className="signal-body">
          <div className="signal-title">{config.title}</div>
          <div className="signal-desc">{config.description}</div>
        </div>
        <div className={`badge ${config.color}`}>
          {result.signal_label}
        </div>
      </div>

      {result.references && result.references.length > 0 && (
        <div className="references-section">
          <div className="section-heading">
            <span className="section-title">Relevant References</span>
            <span className="section-count">{result.references.length} found</span>
          </div>
          <div className="refs-list">
            {result.references.map((ref, i) => (
              <div key={i} className="ref-card">
                <div className="ref-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="ref-content">
                  <div className="ref-title">{ref.title}</div>
                  <div className="ref-meta">
                    <span>{ref.authors}</span>
                    <span className="ref-year">{ref.year}</span>
                    <span className="ref-source">{ref.source}</span>
                  </div>
                  <div className="ref-relevance">{ref.relevance}</div>
                  {ref.url && (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="ref-link">
                      View paper →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.references?.length === 0 && (
        <div className="no-refs">
          <span className="card-label">No specific references retrieved — search returned no close matches</span>
        </div>
      )}

      <div className="qc-actions">
        <div className="qc-action-info">
          <div className="action-title">Ready to generate the full experiment plan?</div>
          <div className="action-sub">
            Protocol · Materials & Catalog Numbers · Budget · Timeline · Validation
          </div>
        </div>
        {!planReady && (
          <button
            className="btn-primary"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Experiment Plan →'}
          </button>
        )}
        {planReady && (
          <div className="plan-ready-badge">✓ Plan Generated — scroll down</div>
        )}
      </div>

      <style>{`
        .qc-page { max-width: 800px; margin: 0 auto; }
        .qc-header { margin-bottom: 1.5rem; }
        .qc-hypothesis-preview {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border-left: 2px solid var(--text-muted);
          margin-top: 0.5rem;
          line-height: 1.5;
        }
        .qc-signal-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border: 1px solid;
          margin-bottom: 2rem;
        }
        .signal-green { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.04); }
        .signal-yellow { border-color: rgba(255,214,10,0.3); background: rgba(255,214,10,0.04); }
        .signal-red { border-color: rgba(255,71,87,0.3); background: rgba(255,71,87,0.04); }
        .signal-icon {
          font-size: 2rem;
          line-height: 1;
        }
        .signal-green .signal-icon { color: var(--accent-green); }
        .signal-yellow .signal-icon { color: var(--accent-yellow); }
        .signal-red .signal-icon { color: var(--accent-red); }
        .signal-body { flex: 1; }
        .signal-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .signal-desc { font-size: 0.85rem; color: var(--text-secondary); }
        .references-section { margin-bottom: 2rem; }
        .refs-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .ref-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
        }
        .ref-number {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--accent-cyan);
          min-width: 24px;
          padding-top: 0.1rem;
        }
        .ref-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.35rem; }
        .ref-meta {
          display: flex;
          gap: 1rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.3rem;
        }
        .ref-year { color: var(--accent-cyan); }
        .ref-source { color: var(--text-muted); }
        .ref-relevance { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .ref-link {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--accent-cyan);
          text-decoration: none;
        }
        .ref-link:hover { text-decoration: underline; }
        .no-refs {
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }
        .qc-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
        }
        .action-title { font-weight: 700; margin-bottom: 0.25rem; }
        .action-sub {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .plan-ready-badge {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--accent-green);
          padding: 0.5rem 1rem;
          border: 1px solid rgba(0,255,136,0.3);
          background: rgba(0,255,136,0.06);
        }
      `}</style>
    </div>
  );
}
