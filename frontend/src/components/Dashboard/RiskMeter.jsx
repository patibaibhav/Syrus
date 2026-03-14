export default function RiskMeter({ score = 0, factors = {} }) {
  const level = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
  const percentage = Math.round(score * 100);

  const config = {
    low: { color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Low Risk', glow: '' },
    medium: { color: '#f59e0b', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Medium Risk', glow: '' },
    high: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'High Risk', glow: 'risk-glow-high' },
  };

  const c = config[level];

  return (
    <div className={`p-4 rounded-lg border ${c.bg} ${c.border} ${c.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Score</h4>
        <span className={`text-xs font-mono font-semibold`} style={{ color: c.color }}>{c.label}</span>
      </div>

      {/* Meter Bar */}
      <div className="w-full h-2 rounded-full bg-navy-900 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: c.color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-heading font-bold text-white">{percentage}%</span>
        {level === 'high' && (
          <span className="flex items-center gap-1 text-xs text-red-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Flagged
          </span>
        )}
      </div>

      {/* Factor indicators */}
      <div className="mt-3 space-y-1">
        {Object.entries(factors).filter(([, value]) => value?.signal_score > 0).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-slate-400 font-mono">{(val.signal_score * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
