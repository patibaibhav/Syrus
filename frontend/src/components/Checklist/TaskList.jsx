import { useState } from 'react';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';

export default function TaskList({ tasks, onStart, onVerify, onComplete }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = [...new Set(
    [...tasks]
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((task) => task.category)
      .filter(Boolean)
  )];

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter((t) => t.category === cat);
    return acc;
  }, {});

  const filteredCategories = filter === 'all'
    ? categories
    : categories.filter((cat) => {
        if (filter === 'pending') return grouped[cat]?.some((t) => t.status !== 'completed' && t.status !== 'verified');
        if (filter === 'completed') return grouped[cat]?.some((t) => t.status === 'completed' || t.status === 'verified');
        return true;
      });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-navy-600">
        <h3 className="text-sm font-heading font-semibold text-white mb-2">Onboarding Checklist</h3>
        <div className="flex gap-1">
          {['all', 'pending', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] rounded font-medium capitalize transition-all ${
                filter === f ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {filteredCategories.map((cat) => {
          const catTasks = grouped[cat]?.filter((t) => {
            if (filter === 'pending') return t.status !== 'completed' && t.status !== 'verified';
            if (filter === 'completed') return t.status === 'completed' || t.status === 'verified';
            return true;
          }) || [];

          if (catTasks.length === 0) return null;

          const completedCount = catTasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;

          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center justify-between px-1 mb-1">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{cat}</h4>
                <span className="text-[10px] text-slate-600 font-mono">{completedCount}/{catTasks.length}</span>
              </div>
              {catTasks.map((task) => (
                <TaskItem key={task.id} task={task} onStart={onStart} onOpenModal={setSelectedTask} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onVerify={async (id, evidence) => {
            const result = await onVerify(id, evidence);
            return result;
          }}
          onComplete={async (id) => {
            await onComplete(id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
