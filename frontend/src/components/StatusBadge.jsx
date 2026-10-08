import React from 'react';

const STATUS_STYLES = {
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ASSIGNED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ON_HOLD: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  REJECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  REOPENED: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
