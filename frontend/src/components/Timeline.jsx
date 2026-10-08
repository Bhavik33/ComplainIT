import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const STEPS = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const Timeline = ({ currentStatus, statusHistory = [] }) => {
  const isRejected = currentStatus === 'REJECTED';
  const isOnHold = currentStatus === 'ON_HOLD';
  const isReopened = currentStatus === 'REOPENED';

  const getStepIndex = (status) => {
    if (status === 'REOPENED') return 2; // Returns to in progress step
    return STEPS.indexOf(status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-700 -z-0" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 -z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (STEPS.length - 1)) * 100))}%`
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || currentStatus === 'CLOSED';
          const isCurrent = idx === currentIndex && !isRejected;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-cyan-500 border-cyan-400 text-slate-900 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-800 border-slate-600 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-semibold ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                {step.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Special Status Alerts */}
      {isRejected && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center text-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>This complaint has been <strong>REJECTED</strong> by administration.</span>
        </div>
      )}

      {isOnHold && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 flex items-center text-sm">
          <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>This complaint is currently <strong>ON HOLD</strong> pending additional information.</span>
        </div>
      )}

      {isReopened && (
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 flex items-center text-sm">
          <RefreshCw className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>This complaint was <strong>REOPENED</strong> by user and is pending staff re-assessment.</span>
        </div>
      )}
    </div>
  );
};

export default Timeline;
