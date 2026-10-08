import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  UserCheck,
  Users,
  Grid,
  Clock,
  BarChart3,
  FileText,
  Activity,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'USER';

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints/new', label: 'Create Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: ClipboardList },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { to: '/staff/assigned', label: 'Assigned Complaints', icon: UserCheck },
    { to: '/profile', label: 'Staff Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/categories', label: 'Category Management', icon: Grid },
    { to: '/admin/sla', label: 'SLA Settings', icon: Clock },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Activity },
    { to: '/profile', label: 'Admin Profile', icon: User }
  ];

  const navItems = role === 'ADMIN' ? adminLinks : role === 'STAFF' ? staffLinks : userLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {role} PORTAL
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* SLA Quick Status Indicator */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>System Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <p className="text-[11px] text-slate-500">SLA Monitoring Active</p>
      </div>
    </aside>
  );
};

export default Sidebar;
