import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Shield, LogOut, User, Search, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success && res.data.meta) {
          setUnreadCount(res.data.meta.unreadCount || 0);
        }
      } catch (err) {
        // Ignore silent fetch errors
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center space-x-3">
        <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'STAFF' ? '/staff/dashboard' : '/dashboard'} className="flex items-center space-x-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-900 font-extrabold shadow-md group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              ResolveIT
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
              v1.0
            </span>
          </div>
        </Link>
      </div>

      {/* Global Action Links & User Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Info & Badge */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                <span className={`inline-block w-2 h-2 rounded-full ${user.role === 'ADMIN' ? 'bg-rose-500' : user.role === 'STAFF' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>{user.role}</span>
              </div>
            </div>

            <Link
              to="/profile"
              className="p-2 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 hover:border-cyan-500 transition-all"
              title="Profile Settings"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
