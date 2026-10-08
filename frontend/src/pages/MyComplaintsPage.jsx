import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Search, Filter, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter }),
          ...(categoryFilter && { category: categoryFilter }),
          ...(priorityFilter && { priority: priorityFilter })
        });

        const res = await api.get(`/complaints?${params.toString()}`);
        if (res.data.success) {
          setComplaints(res.data.data);
          if (res.data.meta) {
            setPagination({
              total: res.data.meta.total,
              pages: res.data.meta.pages
            });
          }
        }
      } catch (err) {
        console.error('Fetch complaints error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [page, search, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Title */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-3xl font-extrabold text-white">My Complaints History</h1>
              <p className="text-sm text-slate-400">Search, filter, and track all complaints submitted under your account.</p>
            </div>
            <Link
              to="/complaints/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-md"
            >
              + New Complaint
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Complaint ID or Title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REOPENED">REOPENED</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner label="Searching complaints..." />
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-500">
              No complaints match the selected filter criteria.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                      <th className="py-3.5 px-4">Complaint ID</th>
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">SLA Status</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {complaints.map((item) => {
                      const isOverdue = item.isBreached || (new Date(item.slaDeadline) < new Date() && !['RESOLVED', 'CLOSED'].includes(item.status));
                      return (
                        <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-cyan-400">{item.complaintId}</td>
                          <td className="py-4 px-4 font-medium text-white max-w-xs truncate">{item.title}</td>
                          <td className="py-4 px-4 text-slate-300">{item.category?.name || 'General'}</td>
                          <td className="py-4 px-4"><PriorityBadge priority={item.priority} /></td>
                          <td className="py-4 px-4"><StatusBadge status={item.status} /></td>
                          <td className="py-4 px-4">
                            {isOverdue ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                                Overdue
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-400 font-medium">On Track</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right">
                            <Link
                              to={`/complaints/${item._id}`}
                              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
                  <span>Page {page} of {pagination.pages} ({pagination.total} complaints)</span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={page === pagination.pages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyComplaintsPage;
