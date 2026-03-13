import { useState } from 'react';

export default function TaskModal({ task, onClose, onVerify, onComplete }) {
  const [evidence, setEvidence] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  if (!task) return null;

  const handleVerify = async () => {
    if (!evidence.trim()) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await onVerify(task.id, evidence);
      if (res.success) {
        setResult(res.data.verification);
      }
    } catch (err) {
      setResult({ passed: false, message: 'Verification request failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleComplete = async () => {
    await onComplete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto card-elevated p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="badge-info text-[10px] mb-2">{task.category}</span>
            <h2 className="text-lg font-heading font-semibold text-white mt-1">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="prose-dark text-sm mb-6 whitespace-pre-wrap">{task.description}</div>

        {/* Pitfall Warnings */}
        {task.pitfalls && task.pitfalls.length > 0 && (
          <div className="mb-6 space-y-2">
            {task.pitfalls.map((p) => (
              <div key={p.id} className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 text-sm mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-400">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{p.warningMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Submission */}
        {(task.status === 'in_progress' || task.status === 'not_started') && (
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Submit Evidence</label>
            <textarea
              className="input-field font-mono text-xs min-h-[100px] resize-y"
              placeholder={`Paste the output of the verification command here...\n\nExample: ${task.verificationType === 'node_version' ? 'v18.19.0' : task.verificationType === 'text_confirmation' ? 'done' : 'Paste your terminal output'}`}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={handleVerify} disabled={verifying || !evidence.trim()} className="btn-primary text-sm">
                {verifying ? 'Verifying...' : '🔍 Verify'}
              </button>
              <button onClick={handleComplete} className="btn-secondary text-sm">
                Mark Complete
              </button>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className={`p-4 rounded-lg border mt-4 animate-fade-in ${
            result.passed
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <p className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
              {result.message}
            </p>
            {result.details && (
              <p className="text-xs text-slate-500 mt-1 font-mono">{result.details}</p>
            )}
          </div>
        )}

        {/* Task metadata */}
        <div className="mt-6 pt-4 border-t border-navy-600 flex items-center gap-4 text-xs text-slate-500">
          <span>⏱ Est. {task.estimatedMinutes} min</span>
          <span>🔄 Attempts: {task.attemptCount || 0}</span>
          {task.startedAt && <span>Started: {new Date(task.startedAt).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}
