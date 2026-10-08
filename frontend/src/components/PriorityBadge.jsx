import React from 'react';

const PRIORITY_STYLES = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
};

const PriorityBadge = ({ priority }) => {
  const style = PRIORITY_STYLES[priority] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${style}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
