import React, { useState } from 'react';

const SECTIONS = ['protocol', 'materials', 'budget', 'timeline', 'validation'];
const API_BASE = process.env.REACT_APP_API_URL || '';

export default function FeedbackPanel({ plan }) {
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState('protocol');
  const [rating, setRating] = useState(0);
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating || !originalText) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.plan_id,
          experiment_type: plan.experiment_type || '',
          domain: plan.domain || 'other',
          section,
          rating,
          original_text: originalText,
          corrected_text: correctedText || null,
          annotation: annotation || null
        })
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="feedback-panel" style={{marginTop:'2.5rem'}}>
      <div className="feedback-header">
        <div>
          <div className="feedback-title">🔬 Scientist Review</div>
          <div className="feedback-subtitle">
            Your corrections train future plan generation · Stretch Goal Feature
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close ▲' : 'Leave Feedback ▼'}
        </button>
      </div>

      {isOpen && !submitted && (
        <div className="feedback-form">
          <div className="feedback-info">
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--accent-purple)'}}>
              ◈ Every correction you make is stored and injected as a few-shot example for future plans in the {plan.domain} domain.
            </span>
          </div>

          <div className="feedback-row">
            <div className="form-group">
              <label className="form-label">Section to review</label>
              <select className="form-select" value={section} onChange={e => setSection(e.target.value)}>
                {SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quality rating</label>
              <div className="star-rating">
                {[1,2,3,4,5].map(n => (
                  <span
                    key={n}
                    className={`star ${n <= rating ? 'active' : ''}`}
                    onClick={() => setRating(n)}
                  >★</span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paste the original section text (for context)</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the protocol step, reagent entry, or budget line you're reviewing..."
              value={originalText}
              onChange={e => setOriginalText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your corrected version (optional but valuable)</label>
            <textarea
              className="form-textarea"
              placeholder="Write what the corrected text should say — e.g. correct concentration, better reagent, more realistic timeline..."
              value={correctedText}
              onChange={e => setCorrectedText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annotation / explanation (optional)</label>
            <textarea
              className="form-textarea"
              style={{minHeight:'60px'}}
              placeholder="Why is this correction important? What did the AI get wrong?"
              value={annotation}
              onChange={e => setAnnotation(e.target.value)}
            />
          </div>

          {error && (
            <div style={{color:'var(--accent-red)',fontFamily:'var(--font-mono)',fontSize:'0.78rem'}}>⚠ {error}</div>
          )}

          <button
            className="btn-feedback"
            onClick={handleSubmit}
            disabled={submitting || !rating || !originalText}
          >
            {submitting ? 'Saving...' : '◈ Submit Correction — Improve Future Plans'}
          </button>
        </div>
      )}

      {submitted && (
        <div className="feedback-success">
          ✓ Correction saved. Future experiment plans in the <strong>{plan.domain}</strong> domain will reflect your expertise.
          <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'var(--text-muted)'}}>
            This feedback is stored locally and injected as a few-shot example when similar hypotheses are processed.
          </div>
        </div>
      )}
    </div>
  );
}
