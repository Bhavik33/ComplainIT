import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Activity, Search, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit-logs?page=${page}&limit=15${search ? `&search=${search}` : ''}`);
        if (res.data.success) {
          setLogs(res.data.data);
          if (res.data.meta) setPagination({ total: res.data.meta.total, pages: res.data.meta.pages });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, search]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Security Audit Trail Logs</h1>
              <p className="text-sm text-slate-400">Complete immutable record of all logins, status changes, assignments, and user operations.</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search action or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Querying audit log database..." />
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Entity</th>
                      <th className="py-3.5 px-4">IP Address</th>
                      <th className="py-3.5 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-400">{log.action}</td>
                        <td className="py-3.5 px-4 font-sans font-semibold text-white">{log.user?.name || 'System / Unauth'}</td>
                        <td className="py-3.5 px-4 text-emerald-400">{log.entity}</td>
                        <td className="py-3.5 px-4 text-slate-500">{log.ipAddress}</td>
                        <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400 font-sans">
                  <span>Page {page} of {pagination.pages} ({pagination.total} audit records)</span>
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

export default AdminAuditLogsPage;
