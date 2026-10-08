import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  MessageSquare,
  Clock,
  User,
  Shield,
  FileText,
  Send,
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Paperclip,
  UserCheck,
  Tag
} from 'lucide-react';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Assign Staff State
  const [selectedStaff, setSelectedStaff] = useState('');

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [starScore, setStarScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      const [compRes, commRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/comments`)
      ]);
      if (compRes.data.success) {
        setComplaint(compRes.data.data);
        setSelectedStatus(compRes.data.data.status);
        if (compRes.data.data.assignedStaff) {
          setSelectedStaff(compRes.data.data.assignedStaff._id);
        }
      }
      if (commRes.data.success) setComments(commRes.data.data);
    } catch (err) {
      console.error('Failed to load complaint detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();

    if (user?.role === 'ADMIN') {
      api.get('/users?role=STAFF').then(res => {
        if (res.data.success) setStaffList(res.data.data);
      });
    }
  }, [id, user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        text: commentText,
        isInternal: isInternalComment
      });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setCommentText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await api.put(`/complaints/${id}/status`, {
        status: selectedStatus,
        note: statusNote
      });
      if (res.data.success) {
        setStatusModalOpen(false);
        setStatusNote('');
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;
    try {
      const res = await api.put(`/complaints/${id}/assign`, {
        staffId: selectedStaff
      });
      if (res.data.success) {
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign staff');
    }
  };

  const handleReopen = async () => {
    if (!window.confirm('Are you sure you want to reopen this complaint?')) return;
    try {
      const res = await api.put(`/complaints/${id}/status`, {
        status: 'REOPENED',
        note: 'Reopened by user'
      });
      if (res.data.success) fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen complaint');
    }
  };

  const handleSubmitRating = async () => {
    try {
      const res = await api.post(`/complaints/${id}/rate`, {
        score: starScore,
        feedback: ratingFeedback
      });
      if (res.data.success) {
        setRatingModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return <LoadingSpinner label="Loading complaint details..." />;
  if (!complaint) return <div className="p-8 text-white">Complaint not found</div>;

  const isOwner = user?.id === complaint.createdBy?._id;
  const isStaff = user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-mono text-xl font-bold text-cyan-400">{complaint.complaintId}</span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{complaint.title}</h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {(isStaff || isAdmin) && (
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-500/20 transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Status</span>
                </button>
              )}

              {isOwner && complaint.status === 'RESOLVED' && (
                <button
                  onClick={handleReopen}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-all flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reopen Complaint</span>
                </button>
              )}

              {isOwner && ['RESOLVED', 'CLOSED'].includes(complaint.status) && (
                <button
                  onClick={() => setRatingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all flex items-center space-x-1"
                >
                  <Star className="w-4 h-4 fill-emerald-400" />
                  <span>{complaint.rating ? 'Edit Rating' : 'Rate Resolution'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Workflow Timeline Component */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Resolution Process Timeline</h3>
            <Timeline currentStatus={complaint.status} statusHistory={complaint.statusHistory} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Detailed Description</h3>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

                {/* Attachments list */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1">
                      <Paperclip className="w-4 h-4" />
                      <span>Uploaded Supporting Evidence ({complaint.attachments.length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {complaint.attachments.map((att) => (
                        <a
                          key={att._id}
                          href={att.path}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:border-cyan-500 flex items-center space-x-2 transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{att.originalName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments & Discussion Thread */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Communication Thread</span>
                </h3>

                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">No comments yet. Start the conversation below.</div>
                  ) : (
                    comments.map((comm) => (
                      <div
                        key={comm._id}
                        className={`p-4 rounded-xl border ${
                          comm.isInternal
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{comm.user?.name || 'User'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">{comm.user?.role}</span>
                            {comm.isInternal && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                                INTERNAL NOTE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{new Date(comm.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{comm.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a message or response..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                  />
                  <div className="flex items-center justify-between">
                    {(isStaff || isAdmin) ? (
                      <label className="flex items-center space-x-2 text-xs text-amber-400 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Post as Internal Staff Note</span>
                      </label>
                    ) : <div />}

                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingComment ? 'Sending...' : 'Post Message'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Meta Info & Admin Controls */}
            <div className="space-y-6">
              {/* Meta Info Card */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">Complaint Metadata</h3>

                <div>
                  <span className="text-xs text-slate-500 block">Submitted By</span>
                  <span className="text-sm font-semibold text-white">{complaint.createdBy?.name} ({complaint.createdBy?.department})</span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Assigned Support Staff</span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {complaint.assignedStaff ? `${complaint.assignedStaff.name} (${complaint.assignedStaff.department})` : 'Unassigned'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">SLA Deadline</span>
                  <span className="text-sm font-semibold text-amber-400 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(complaint.slaDeadline).toLocaleString()}</span>
                  </span>
                </div>

                {complaint.rating && (
                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-500 block mb-1">User Satisfaction Rating</span>
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= complaint.rating.score ? 'fill-amber-400' : 'text-slate-700'}`}
                        />
                      ))}
                      <span className="text-xs font-bold ml-2 text-white">{complaint.rating.score}/5</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Staff Assignment Box */}
              {isAdmin && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Assign Staff Member</span>
                  </h3>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Staff Member</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>{st.name} ({st.department})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignStaff}
                    className="w-full py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all"
                  >
                    Confirm Staff Assignment
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Complaint Status">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            >
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status Note / Audit Reason</label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="State reason for status change..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
            />
          </div>
          <button
            onClick={handleUpdateStatus}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-md"
          >
            Apply Status Change
          </button>
        </div>
      </Modal>

      {/* Rate Complaint Modal */}
      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title="Rate Resolution Quality">
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-300">How satisfied are you with the resolution of this complaint?</p>
          <div className="flex justify-center space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarScore(star)}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${star <= starScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={ratingFeedback}
            onChange={(e) => setRatingFeedback(e.target.value)}
            placeholder="Optional feedback..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm"
          />
          <button
            onClick={handleSubmitRating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm shadow-md"
          >
            Submit Rating
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintDetailPage;
