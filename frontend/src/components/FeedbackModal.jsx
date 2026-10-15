import React, { useState } from 'react';
import api from '../services/api';

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        className={`star-btn ${star <= value ? 'star-filled' : 'star-empty'}`}
        onClick={() => !readOnly && onChange && onChange(star)}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
    {value > 0 && (
      <span className="star-label">
        {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
      </span>
    )}
  </div>
);

const FeedbackModal = ({ complaint, onClose, onSuccess }) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSatisfied, setIsSatisfied] = useState(true);
  const [requestReopen, setRequestReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (score === 0) {
      setError('Please select a star rating');
      return;
    }
    if (requestReopen && reopenReason.trim().length < 10) {
      setError('Please provide a detailed reopen reason (minimum 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/complaints/${complaint._id}/rate`, {
        score,
        feedback: feedback.trim(),
        isResolutionSatisfactory: isSatisfied,
        reopenRequested: requestReopen,
        reopenReason: requestReopen ? reopenReason.trim() : ''
      });
      if (onSuccess) onSuccess(requestReopen);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" id="feedback-modal-overlay" onClick={onClose}>
      <div className="modal-container feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">💬</div>
          <div>
            <h2>Rate Your Experience</h2>
            <p className="modal-sub">Complaint #{complaint.complaintId} · {complaint.title?.substring(0, 40)}{complaint.title?.length > 40 ? '…' : ''}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">Overall Rating <span className="required">*</span></label>
            <StarRating value={score} onChange={setScore} />
          </div>

          {/* Resolution Satisfaction */}
          <div className="form-group">
            <label className="form-label">Was your issue fully resolved?</label>
            <div className="satisfaction-toggles">
              <button
                type="button"
                className={`satisfaction-btn ${isSatisfied ? 'satisfied-active' : ''}`}
                onClick={() => { setIsSatisfied(true); setRequestReopen(false); }}
              >
                ✅ Yes, fully resolved
              </button>
              <button
                type="button"
                className={`satisfaction-btn ${!isSatisfied ? 'unsatisfied-active' : ''}`}
                onClick={() => setIsSatisfied(false)}
              >
                ❌ No, issue persists
              </button>
            </div>
          </div>

          {/* Feedback text */}
          <div className="form-group">
            <label className="form-label" htmlFor="feedback-text">Additional Comments</label>
            <textarea
              id="feedback-text"
              className="form-textarea"
              rows={3}
              placeholder="Tell us more about your experience or how we can improve…"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>

          {/* Reopen request (only shown if not satisfied) */}
          {!isSatisfied && (
            <div className="reopen-request-section">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  id="reopen-checkbox"
                  checked={requestReopen}
                  onChange={e => setRequestReopen(e.target.checked)}
                />
                <span>Request complaint to be reopened</span>
              </label>

              {requestReopen && (
                <div className="reopen-reason-group">
                  <label className="form-label" htmlFor="reopen-reason">Why should this be reopened? <span className="required">*</span></label>
                  <textarea
                    id="reopen-reason"
                    className="form-textarea reopen-reason-textarea"
                    rows={3}
                    placeholder="Describe in detail why the issue was not resolved and needs further attention (min 10 characters)…"
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    required={requestReopen}
                  />
                  <span className="char-count">{reopenReason.length} / 500</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="feedback-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || score === 0}>
              {submitting ? (
                <span className="btn-loading"><span className="loading-spinner-sm"></span> Submitting…</span>
              ) : (
                requestReopen ? '📤 Submit & Request Reopen' : '⭐ Submit Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
