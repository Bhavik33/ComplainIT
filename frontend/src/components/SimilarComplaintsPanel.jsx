import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SimilarComplaintsPanel = ({ complaintId, isAdmin, isMaster, onLink, onUnlink }) => {
  const [similar, setSimilar] = useState([]);
  const [linked, setLinked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState(null);
  const [showLinked, setShowLinked] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [simRes, linkedRes] = await Promise.all([
        api.get(`/complaints/${complaintId}/similar`),
        api.get(`/complaints/${complaintId}/linked-duplicates`)
      ]);
      setSimilar(simRes.data.data || []);
      setLinked(linkedRes.data.data || []);
    } catch {
      // Swallow errors
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLink = async (targetId) => {
    setLinkingId(targetId);
    try {
      await api.put(`/complaints/${targetId}/link-master`, { masterComplaintId: complaintId });
      await fetchData();
      if (onLink) onLink();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to link complaint');
    } finally {
      setLinkingId(null);
    }
  };

  const handleUnlink = async (targetId) => {
    setLinkingId(targetId);
    try {
      await api.put(`/complaints/${targetId}/unlink-master`);
      await fetchData();
      if (onUnlink) onUnlink();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unlink complaint');
    } finally {
      setLinkingId(null);
    }
  };

  const getSimilarityColor = (pct) => {
    if (pct >= 70) return '#ef4444';
    if (pct >= 50) return '#f97316';
    return '#eab308';
  };

  if (loading) {
    return (
      <div className="similar-panel-loading">
        <div className="loading-spinner-sm"></div>
        <span>Scanning for similar complaints…</span>
      </div>
    );
  }

  if (similar.length === 0 && linked.length === 0) return null;

  return (
    <div className="similar-panel">
      {/* Banner alert */}
      {similar.length > 0 && (
        <div className="duplicate-alert-banner">
          <span className="duplicate-alert-icon">⚠️</span>
          <div>
            <strong>{similar.length} similar complaint{similar.length > 1 ? 's' : ''} detected</strong>
            <p>These complaints may describe the same issue. {isAdmin ? 'Link them to a master incident below.' : 'Your complaint has been flagged for admin review.'}</p>
          </div>
        </div>
      )}

      {/* Similar candidates (admin view) */}
      {isAdmin && similar.length > 0 && (
        <div className="similar-list-section">
          <h4 className="similar-list-heading">
            <span>🔗</span> Possible Duplicates
          </h4>
          <div className="similar-list">
            {similar.map(c => (
              <div key={c._id} className="similar-card">
                <div className="similar-card-left">
                  <div className="similar-score-badge" style={{ background: getSimilarityColor(c.similarityPercent) }}>
                    {c.similarityPercent}% match
                  </div>
                  <div className="similar-card-info">
                    <span className="similar-complaint-id">#{c.complaintId}</span>
                    <span className="similar-complaint-title">{c.title}</span>
                    <span className="similar-complaint-meta">
                      {c.createdBy?.name} · {c.category?.name} · <em>{c.status}</em>
                    </span>
                  </div>
                </div>
                {isAdmin && !c.masterComplaint && (
                  <button
                    className="btn-link-master"
                    onClick={() => handleLink(c._id)}
                    disabled={linkingId === c._id}
                  >
                    {linkingId === c._id ? '…' : '🔗 Link as Duplicate'}
                  </button>
                )}
                {isAdmin && c.masterComplaint?.toString() === complaintId && (
                  <button
                    className="btn-unlink-master"
                    onClick={() => handleUnlink(c._id)}
                    disabled={linkingId === c._id}
                  >
                    {linkingId === c._id ? '…' : '✂️ Unlink'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked duplicates (master view) */}
      {linked.length > 0 && (
        <div className="linked-section">
          <button className="linked-toggle" onClick={() => setShowLinked(v => !v)}>
            📋 {linked.length} linked duplicate{linked.length > 1 ? 's' : ''} {showLinked ? '▲' : '▼'}
          </button>
          {showLinked && (
            <div className="linked-list">
              {linked.map(c => (
                <div key={c._id} className="linked-card">
                  <div className="linked-card-info">
                    <span className="similar-complaint-id">#{c.complaintId}</span>
                    <span className="similar-complaint-title">{c.title}</span>
                    <span className="similar-complaint-meta">{c.createdBy?.name} · {c.status}</span>
                  </div>
                  {isAdmin && (
                    <button
                      className="btn-unlink-master"
                      onClick={() => handleUnlink(c._id)}
                      disabled={linkingId === c._id}
                    >
                      {linkingId === c._id ? '…' : '✂️ Unlink'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimilarComplaintsPanel;
