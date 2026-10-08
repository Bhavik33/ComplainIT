import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Bell, CheckCheck, Clock } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-4xl mx-auto overflow-y-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Notifications Center</h1>
              <p className="text-sm text-slate-400">Updates regarding your complaint status changes and assignments.</p>
            </div>
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-400 hover:bg-slate-800 flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-500">
              No notifications available at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-xl border flex items-start justify-between transition-all ${
                    n.isRead
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{n.title}</h4>
                      <p className="text-xs mt-1 text-slate-300">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {n.complaint && (
                    <Link
                      to={`/complaints/${n.complaint._id || n.complaint}`}
                      className="text-xs font-bold text-cyan-400 hover:underline flex-shrink-0 ml-4"
                    >
                      View Complaint
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
