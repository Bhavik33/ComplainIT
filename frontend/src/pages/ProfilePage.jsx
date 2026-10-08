import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Building, Phone, Save, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUserProfile(res.data.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-2xl mx-auto overflow-y-auto">
          <div className="mb-8 pb-4 border-b border-slate-800">
            <h1 className="text-3xl font-extrabold text-white">Account Profile Settings</h1>
            <p className="text-sm text-slate-400">View and update your personal user details and contact preferences.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-xl">
            {message && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned Portal Role</label>
                <div className="relative">
                  <Shield className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    disabled
                    value={user?.role || 'USER'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-cyan-400 font-bold text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
