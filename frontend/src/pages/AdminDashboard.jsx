import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Grid,
  Activity,
  BarChart3
} from 'lucide-react';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Admin dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleExportCsv = () => {
    window.open('http://localhost:5000/api/complaints/export/csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Admin Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">Real-time organizational complaint metrics, staff workload, and SLA analytics.</p>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner label="Compiling system analytics & charts..." />
          ) : (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                <StatCard title="Total System Tickets" value={stats?.total || 0} icon={ClipboardList} color="cyan" />
                <StatCard title="Pending / Active" value={stats?.pending || 0} icon={Clock} color="amber" />
                <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle2} color="emerald" />
                <StatCard title="SLA Overdue" value={stats?.overdue || 0} icon={AlertTriangle} color="rose" />
                <StatCard title="Avg Resolution Time" value={`${stats?.avgResolutionHours || 0} hrs`} icon={Activity} color="purple" />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Complaints by Category Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center space-x-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>Complaints by Category</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.complaintsByCategory || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {(stats?.complaintsByCategory || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Complaints Over Time Line Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Complaints Frequency Over Time</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.complaintsOverTime || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Staff Workload Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Support Staff Ticket Workload Distribution</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.staffWorkload || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey="assigned" name="Active Assigned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
