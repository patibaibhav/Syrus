import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useChat } from '../hooks/useChat';
import { analyticsAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import TaskList from '../components/Checklist/TaskList';
import ChatWindow from '../components/Chat/ChatWindow';
import ProgressRing from '../components/Dashboard/ProgressRing';
import RiskMeter from '../components/Dashboard/RiskMeter';
import PitfallWarnings from '../components/Dashboard/PitfallWarnings';
import StarterTicket from '../components/Dashboard/StarterTicket';

export default function Dashboard() {
  const { user, persona, logout } = useAuth();
  const { tasks, loading: tasksLoading, startTask, verifyTask, completeTask } = useTasks();
  const chat = useChat();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [risk, setRisk] = useState(null);
  const [productivity, setProductivity] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      Promise.all([
        analyticsAPI.getProgress().catch(() => null),
        analyticsAPI.getRisk().catch(() => null),
        analyticsAPI.getProductivityEstimate().catch(() => null),
      ]).then(([progressRes, riskRes, prodRes]) => {
        if (cancelled) return;
        if (progressRes?.data?.success) setProgress(progressRes.data.data);
        if (riskRes?.data?.success) setRisk(riskRes.data.data);
        if (prodRes?.data?.success) setProductivity(prodRes.data.data);
      }).catch((err) => {
        console.error('Analytics load error:', err);
      });
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tasks]);

  return (
    <div className="h-screen flex flex-col bg-navy-950">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-navy-600 bg-navy-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
            <span className="text-cyan-400 font-heading font-bold text-sm">A</span>
          </div>
          <h1 className="text-lg font-heading font-semibold text-white">Axiom</h1>
          <span className="text-xs text-slate-500 font-mono ml-2">v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-right hover:opacity-80 transition-opacity">
            <p className="text-sm text-white font-medium">{user?.name}</p>
            <p className="text-[10px] text-slate-500">{persona?.name || user?.role}</p>
          </Link>
          {user?.role === 'manager' && (
            <button onClick={() => navigate('/manager')}
              className="btn-secondary text-xs py-1.5 px-3">
              Manager View
            </button>
          )}
          <button onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Checklist */}
        <div className="w-[320px] flex-shrink-0 border-r border-navy-600 bg-navy-900/50 flex flex-col">
          {tasksLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-slate-500">Loading tasks...</div>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onStart={startTask}
              onVerify={verifyTask}
              onComplete={completeTask}
            />
          )}
        </div>

        {/* Center Panel: Chat */}
        <div className="flex-1 min-w-0 flex flex-col bg-navy-950">
          <ChatWindow
            messages={chat.messages}
            loading={chat.loading}
            error={chat.error}
            sendMessage={chat.sendMessage}
            loadHistory={chat.loadHistory}
          />
        </div>

        {/* Right Panel: Stats & Widgets */}
        <div className="w-[280px] flex-shrink-0 border-l border-navy-600 bg-navy-900/50 overflow-y-auto p-4 space-y-4">
          {/* Progress Ring */}
          <div className="card p-4 flex flex-col items-center">
            <ProgressRing percentage={progress?.percentComplete || 0} size={100} strokeWidth={6} />
            <div className="mt-3 grid grid-cols-3 gap-2 w-full text-center">
              <div>
                <p className="text-lg font-heading font-bold text-white">{progress?.completed || 0}</p>
                <p className="text-[9px] text-slate-500">Done</p>
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-yellow-400">{progress?.inProgress || 0}</p>
                <p className="text-[9px] text-slate-500">Active</p>
              </div>
              <div>
                <p className="text-lg font-heading font-bold text-slate-500">{progress?.notStarted || 0}</p>
                <p className="text-[9px] text-slate-500">Left</p>
              </div>
            </div>
          </div>

          {/* Risk Meter */}
          {risk && <RiskMeter score={risk.score} factors={risk.factors} />}

          {/* Productivity Estimate */}
          {productivity && (
            <div className="card p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time to Productivity</h4>
              <p className="text-sm text-slate-300">{productivity.message}</p>
              {productivity.estimatedReadyDate && (
                <p className="text-xs text-cyan-400 font-mono mt-1.5">
                  🎯 Target: {productivity.estimatedReadyDate}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                <span>📊 {productivity.tasksPerDay} tasks/day</span>
              </div>
            </div>
          )}

          {/* Pitfall Warnings */}
          <PitfallWarnings tasks={tasks} />

          {/* Starter Ticket */}
          <StarterTicket />
        </div>
      </div>
    </div>
  );
}
