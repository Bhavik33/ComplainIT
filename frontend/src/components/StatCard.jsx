import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'cyan', subtitle }) => {
  const colorStyles = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-400',
    purple: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400'
  };

  const currentStyle = colorStyles[color] || colorStyles.cyan;

  return (
    <div className={`p-5 rounded-xl border bg-gradient-to-br ${currentStyle} shadow-lg backdrop-blur-md relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
