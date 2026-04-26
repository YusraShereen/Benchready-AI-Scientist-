import React, { useState } from 'react';
import FeedbackPanel from './FeedbackPanel';

const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'protocol', label: '🧪 Protocol' },
  { id: 'materials', label: '🧬 Materials' },
  { id: 'budget', label: '💰 Budget' },
  { id: 'timeline', label: '📅 Timeline' },
  { id: 'validation', label: '✓ Validation' },
  { id: 'safety', label: '⚠ Safety' },
];

export default function PlanViewer({ plan, hypothesis }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSteps, setExpandedSteps] = useState(new Set([1]));

  const toggleStep = (n) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const budgetTotal = plan.budget?.total_usd || 0;

  return (
    <div className="plan-viewer">
      {/* Plan Header */}
      <div className="plan-header">
        <div className="plan-meta-row">
          <span className="badge green">{plan.domain?.replace('_', ' ')}</span>
          <span className="plan-id">ID: {plan.plan_id?.slice(0, 8)}</span>
        </div>
        <h2 className="plan-title">{plan.title}</h2>
        <p className="plan-overview-text">{plan.overview}</p>
      </div>

      {/* Stat Strip */}
      <div className="stat-strip">
        <div className="stat">
          <div className="stat-value">{plan.protocol?.length || 0}</div>
          <div className="stat-label">PROTOCOL STEPS</div>
        </div>
        <div className="stat">
          <div className="stat-value">{plan.materials?.length || 0}</div>
          <div className="stat-label">MATERIALS</div>
        </div>
        <div className="stat">
          <div className="stat-value">${budgetTotal.toLocaleString()}</div>
          <div className="stat-label">TOTAL BUDGET</div>
        </div>
        <div className="stat">
          <div className="stat-value">{plan.timeline?.length || 0}</div>
          <div className="stat-label">PHASES</div>
        </div>
        <div className="stat">
          <div className="stat-value">{plan.team?.minimum_headcount || '—'}</div>
          <div className="stat-label">MIN HEADCOUNT</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="card">
                <div className="card-label">Hypothesis (Rephrased)</div>
                <p style={{color:'var(--text-secondary)',lineHeight:1.7,fontSize:'0.92rem'}}>{plan.hypothesis_rephrased}</p>
              </div>
              <div className="card">
                <div className="card-label">Experiment Type</div>
                <p style={{color:'var(--accent-cyan)',fontFamily:'var(--font-mono)',fontSize:'0.9rem'}}>{plan.experiment_type}</p>
              </div>
            </div>
            {plan.team?.roles && (
              <div className="card" style={{marginTop:'1rem'}}>
                <div className="card-label">Team Structure</div>
                <table className="data-table" style={{marginTop:'0.5rem'}}>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>FTE</th>
                      <th>Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.team.roles.map((r, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:600,color:'var(--text-primary)'}}>{r.role}</td>
                        <td className="mono">{r.fte}</td>
                        <td>{r.responsibilities}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {plan.references?.length > 0 && (
              <div className="card" style={{marginTop:'1rem'}}>
                <div className="card-label">Key References</div>
                {plan.references.map((r, i) => (
                  <div key={i} style={{borderBottom:'1px solid var(--border)',padding:'0.6rem 0'}}>
                    <div style={{fontSize:'0.85rem',color:'var(--text-secondary)'}}>{r.citation}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)',marginTop:'0.2rem'}}>{r.relevance}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROTOCOL */}
        {activeTab === 'protocol' && (
          <div>
            <div className="section-heading">
              <span className="section-title">Step-by-Step Protocol</span>
              <span className="section-count">{plan.protocol?.length} steps</span>
            </div>
            {plan.protocol?.map((step) => (
              <div key={step.step} className="protocol-step">
                <div className="step-header" onClick={() => toggleStep(step.step)}>
                  <div className="step-number">{step.step}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-meta">⏱ {step.duration}</div>
                  <div style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>
                    {expandedSteps.has(step.step) ? '▲' : '▼'}
                  </div>
                </div>
                {expandedSteps.has(step.step) && (
                  <div className="step-body">
                    <p className="step-description">{step.description}</p>
                    {step.equipment?.length > 0 && (
                      <div style={{marginBottom:'0.75rem'}}>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'var(--text-muted)',letterSpacing:'0.1em'}}>EQUIPMENT: </span>
                        <span style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>{step.equipment.join(', ')}</span>
                      </div>
                    )}
                    {step.critical_notes && (
                      <div className="step-note">⚠ {step.critical_notes}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MATERIALS */}
        {activeTab === 'materials' && (
          <div>
            <div className="section-heading">
              <span className="section-title">Materials & Supply Chain</span>
              <span className="section-count">{plan.materials?.length} items</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Catalog #</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Unit Cost</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {plan.materials?.map((m, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:'0.2rem'}}>{m.name}</div>
                      {m.notes && <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{m.notes}</div>}
                    </td>
                    <td><span className="mono">{m.catalog_number || '—'}</span></td>
                    <td style={{fontSize:'0.82rem'}}>{m.supplier}</td>
                    <td className="mono" style={{fontSize:'0.8rem'}}>{m.quantity}</td>
                    <td className="cost">${(m.unit_cost_usd || 0).toFixed(2)}</td>
                    <td className="cost" style={{fontWeight:700}}>${(m.total_cost_usd || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{textAlign:'right',padding:'0.75rem 1rem',fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--text-muted)',letterSpacing:'0.1em'}}>MATERIALS SUBTOTAL</td>
                  <td className="cost" style={{fontWeight:800,fontSize:'1rem',padding:'0.75rem 1rem'}}>
                    ${plan.materials?.reduce((s, m) => s + (m.total_cost_usd || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div>
            <div className="budget-overview">
              <div className="budget-total">
                <div className="budget-amount">${budgetTotal.toLocaleString()}</div>
                <div className="budget-label">Total Estimated Budget (USD)</div>
              </div>
              <div style={{flex:1}}>
                {plan.budget?.breakdown?.map((line, i) => {
                  const pct = budgetTotal > 0 ? (line.amount_usd / budgetTotal) * 100 : 0;
                  return (
                    <div key={i} className="budget-bar-item">
                      <div>
                        <div className="budget-bar-label">{line.category}</div>
                        <div className="budget-bar-track">
                          <div className="budget-bar-fill" style={{width:`${pct}%`}} />
                        </div>
                      </div>
                      <div className="budget-bar-amount">${line.amount_usd?.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card" style={{background:'rgba(0,255,136,0.04)',border:'1px solid rgba(0,255,136,0.2)'}}>
              <div className="card-label">Budget Note</div>
              <p style={{fontSize:'0.85rem',color:'var(--text-secondary)',lineHeight:1.6}}>
                Estimates based on current Sigma-Aldrich and Thermo Fisher list prices. 
                Academic discounts (typically 15–30%) may apply. Equipment costs assume access via shared core facility.
              </p>
            </div>
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div>
            <div className="section-heading">
              <span className="section-title">Phased Timeline</span>
              <span className="section-count">{plan.timeline?.length} phases</span>
            </div>
            {plan.timeline?.map((phase, i) => (
              <div key={i} className="timeline-phase">
                <div className="timeline-week">{phase.week}</div>
                <div className="timeline-content">
                  <div className="timeline-phase-title">{phase.phase}</div>
                  <ul className="task-list">
                    {phase.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                  </ul>
                  {phase.dependencies?.length > 0 && (
                    <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>
                      Depends on: {phase.dependencies.join(', ')}
                    </div>
                  )}
                  {phase.milestone && (
                    <div className="timeline-milestone">✓ {phase.milestone}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VALIDATION */}
        {activeTab === 'validation' && plan.validation && (
          <div>
            <div className="validation-grid">
              <div className="validation-card">
                <div className="validation-card-title">Primary Endpoint</div>
                <div className="validation-card-text">{plan.validation.primary_endpoint}</div>
              </div>
              <div className="validation-card" style={{borderColor:'rgba(0,255,136,0.3)',background:'rgba(0,255,136,0.04)'}}>
                <div className="validation-card-title" style={{color:'var(--accent-green)'}}>Success Criteria</div>
                <div className="validation-card-text">{plan.validation.success_criteria}</div>
              </div>
              <div className="validation-card" style={{borderColor:'rgba(255,71,87,0.3)',background:'rgba(255,71,87,0.04)'}}>
                <div className="validation-card-title" style={{color:'var(--accent-red)'}}>Failure Criteria</div>
                <div className="validation-card-text">{plan.validation.failure_criteria}</div>
              </div>
              <div className="validation-card">
                <div className="validation-card-title">Statistical Analysis</div>
                <div className="validation-card-text" style={{fontFamily:'var(--font-mono)',fontSize:'0.82rem'}}>{plan.validation.statistical_analysis}</div>
              </div>
            </div>

            {plan.validation.controls?.length > 0 && (
              <div className="card" style={{marginBottom:'1rem'}}>
                <div className="card-label">Experimental Controls</div>
                {plan.validation.controls.map((c, i) => (
                  <div key={i} style={{padding:'0.75rem 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--accent-cyan)',marginBottom:'0.25rem'}}>{c.type?.toUpperCase()}</div>
                    <div style={{fontSize:'0.87rem',color:'var(--text-secondary)'}}>{c.description}</div>
                  </div>
                ))}
              </div>
            )}

            {plan.validation.expected_challenges?.length > 0 && (
              <div className="card" style={{border:'1px solid rgba(255,214,10,0.3)',background:'rgba(255,214,10,0.03)'}}>
                <div className="card-label" style={{color:'var(--accent-yellow)'}}>Expected Challenges</div>
                <ul className="task-list" style={{marginTop:'0.5rem'}}>
                  {plan.validation.expected_challenges.map((ch, i) => (
                    <li key={i} style={{color:'var(--text-secondary)'}}>{ch}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* SAFETY */}
        {activeTab === 'safety' && plan.safety && (
          <div>
            <div className="validation-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
              <div className="validation-card" style={{borderColor:'rgba(255,71,87,0.3)'}}>
                <div className="validation-card-title" style={{color:'var(--accent-red)'}}>Hazard Classification</div>
                <div className="validation-card-text" style={{fontFamily:'var(--font-mono)'}}>{plan.safety.hazard_classification}</div>
              </div>
              <div className="validation-card">
                <div className="validation-card-title">PPE Required</div>
                <ul className="task-list" style={{marginTop:'0.25rem'}}>
                  {plan.safety.ppe_required?.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div className="validation-card">
                <div className="validation-card-title">Waste Disposal</div>
                <div className="validation-card-text">{plan.safety.waste_disposal}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Feedback Panel (Stretch Goal) */}
      <FeedbackPanel plan={plan} />

      <style>{`
        .plan-viewer { max-width: 1000px; margin: 0 auto; }
        .plan-header {
          padding: 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }
        .plan-meta-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .plan-id {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }
        .plan-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .plan-overview-text {
          color: var(--text-secondary);
          line-height: 1.65;
          font-size: 0.92rem;
        }
        .stat-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }
        .stat {
          padding: 1rem;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .stat:last-child { border-right: none; }
        .stat-value {
          font-family: var(--font-mono);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent-cyan);
          margin-bottom: 0.25rem;
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .tab-content { padding-top: 1rem; }
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
