import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { UserCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const [statsRes, compRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/complaints')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (compRes.data.success) setComplaints(compRes.data.data);
      } catch (err) {
        console.error('Staff dashboard error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8 pb-6 border-b border-slate-800">
            <h1 className="text-3xl font-extrabold text-white">Support Staff Dashboard</h1>
            <p className="text-sm text-slate-400">Manage assigned tickets, execute status transitions, and log internal notes.</p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading staff workload..." />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard title="Assigned Tickets" value={stats?.total || 0} icon={UserCheck} color="cyan" />
                <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Clock} color="amber" />
                <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} color="emerald" />
                <StatCard title="SLA Overdue" value={stats?.overdue || 0} icon={AlertTriangle} color="rose" />
              </div>

              {/* Assigned Complaints Table */}
              <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span>Assigned Complaints Queue</span>
                </h2>

                {complaints.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No active complaints currently assigned to you.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 px-3">Complaint ID</th>
                          <th className="pb-3 px-3">Title</th>
                          <th className="pb-3 px-3">Category</th>
                          <th className="pb-3 px-3">Submitted By</th>
                          <th className="pb-3 px-3">Priority</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {complaints.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{item.complaintId}</td>
                            <td className="py-3.5 px-3 font-medium text-white max-w-xs truncate">{item.title}</td>
                            <td className="py-3.5 px-3 text-slate-300">{item.category?.name || 'General'}</td>
                            <td className="py-3.5 px-3 text-xs text-slate-400">{item.createdBy?.name || 'User'}</td>
                            <td className="py-3.5 px-3"><PriorityBadge priority={item.priority} /></td>
                            <td className="py-3.5 px-3"><StatusBadge status={item.status} /></td>
                            <td className="py-3.5 px-3 text-right">
                              <Link
                                to={`/complaints/${item._id}`}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all"
                              >
                                Manage Ticket
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

export default StaffDashboard;
