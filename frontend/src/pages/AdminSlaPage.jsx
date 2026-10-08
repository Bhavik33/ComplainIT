import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Clock, Save, ShieldAlert } from 'lucide-react';

const AdminSlaPage = () => {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingValues, setEditingValues] = useState({});

  const fetchSla = async () => {
    try {
      const res = await api.get('/sla');
      if (res.data.success) {
        setSlas(res.data.data);
        const initial = {};
        res.data.data.forEach(s => { initial[s.priority] = s.resolutionHours; });
        setEditingValues(initial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSla();
  }, []);

  const handleSave = async (priority) => {
    try {
      const hours = parseInt(editingValues[priority], 10);
      const res = await api.put(`/sla/${priority}`, { resolutionHours: hours });
      if (res.data.success) {
        alert(`SLA for ${priority} updated to ${hours} hours`);
        fetchSla();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update SLA');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
          <div className="mb-8 pb-4 border-b border-slate-800">
            <h1 className="text-3xl font-extrabold text-white">SLA Resolution Thresholds</h1>
            <p className="text-sm text-slate-400">Configure target resolution hours for each complaint priority tier.</p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading SLA configurations..." />
          ) : (
            <div className="space-y-4">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                <div key={priority} className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{priority} PRIORITY</h3>
                      <p className="text-xs text-slate-400">Target maximum hours allowed before SLA breach notification.</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min={1}
                      value={editingValues[priority] || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, [priority]: e.target.value })}
                      className="w-24 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold text-sm text-center"
                    />
                    <span className="text-xs text-slate-400 font-semibold">Hours</span>
                    <button
                      onClick={() => handleSave(priority)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminSlaPage;
