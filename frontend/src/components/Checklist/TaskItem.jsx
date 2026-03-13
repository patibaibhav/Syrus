import { useState } from 'react';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', class: 'badge-neutral', icon: '○' },
  in_progress: { label: 'In Progress', class: 'badge-warning', icon: '◐' },
  verified: { label: 'Verified', class: 'badge-success', icon: '✓' },
  completed: { label: 'Completed', class: 'badge-success', icon: '✓' },
};

export default function TaskItem({ task, onStart, onOpenModal }) {
  const [starting, setStarting] = useState(false);
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.not_started;

  const handleStart = async (e) => {
    e.stopPropagation();
    setStarting(true);
    try {
      await onStart(task.id);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div
      onClick={() => onOpenModal(task)}
      className="group flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-navy-600 hover:bg-navy-800/50 cursor-pointer transition-all animate-slide-in"
    >
      {/* Status Icon */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
        task.status === 'completed' || task.status === 'verified'
          ? 'bg-green-500/20 text-green-400'
          : task.status === 'in_progress'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-navy-700 text-slate-500'
      }`}>
        {config.icon}
      </div>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${
          task.status === 'completed' || task.status === 'verified' ? 'text-slate-500 line-through' : 'text-slate-200'
        }`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-slate-500 font-mono">{task.estimatedMinutes}min</span>
          {task.pitfalls?.length > 0 && (
            <span className="text-[10px] text-yellow-500">⚠ {task.pitfalls.length} pitfall{task.pitfalls.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0">
        {task.status === 'not_started' && (
          <button onClick={handleStart} disabled={starting}
            className="px-3 py-1 text-xs font-medium rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-all disabled:opacity-50">
            {starting ? '...' : 'Start'}
          </button>
        )}
        {task.status === 'in_progress' && (
          <button onClick={(e) => { e.stopPropagation(); onOpenModal(task); }}
            className="px-3 py-1 text-xs font-medium rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
            Submit
          </button>
        )}
        {(task.status === 'completed' || task.status === 'verified') && (
          <span className="text-green-400 text-sm">✓</span>
        )}
      </div>
    </div>
  );
}
