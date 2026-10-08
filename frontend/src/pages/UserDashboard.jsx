import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { PlusCircle, ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/complaints?limit=5')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (complaintsRes.data.success) setRecentComplaints(complaintsRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Student / User Portal</h1>
              <p className="text-sm text-slate-400 mt-1">Submit new complaints, track real-time resolution, and review history.</p>
            </div>
            <Link
              to="/complaints/new"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Raise New Complaint</span>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading dashboard metrics..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                <StatCard title="Total Complaints" value={stats?.total || 0} icon={ClipboardList} color="cyan" />
                <StatCard title="New / Open" value={stats?.new || 0} icon={Clock} color="amber" />
                <StatCard title="In Progress" value={stats?.inProgress || 0} icon={AlertTriangle} color="purple" />
                <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} color="emerald" />
                <StatCard title="Closed" value={stats?.closed || 0} icon={CheckCircle2} color="rose" />
              </div>

              {/* Recent Complaints Table */}
              <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-cyan-400" />
                    <span>Recent Complaints</span>
                  </h2>
                  <Link to="/my-complaints" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {recentComplaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No complaints submitted yet. Click "Raise New Complaint" to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 px-3">Complaint ID</th>
                          <th className="pb-3 px-3">Title</th>
                          <th className="pb-3 px-3">Category</th>
                          <th className="pb-3 px-3">Priority</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Submitted</th>
                          <th className="pb-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {recentComplaints.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-semibold text-cyan-400">{item.complaintId}</td>
                            <td className="py-3.5 px-3 font-medium text-white max-w-xs truncate">{item.title}</td>
                            <td className="py-3.5 px-3 text-slate-300">{item.category?.name || 'General'}</td>
                            <td className="py-3.5 px-3"><PriorityBadge priority={item.priority} /></td>
                            <td className="py-3.5 px-3"><StatusBadge status={item.status} /></td>
                            <td className="py-3.5 px-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="py-3.5 px-3 text-right">
                              <Link
                                to={`/complaints/${item._id}`}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
