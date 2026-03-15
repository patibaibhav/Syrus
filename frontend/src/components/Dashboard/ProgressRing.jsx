import { memo } from 'react';

const ProgressRing = memo(function ProgressRing({ percentage = 0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 40) return '#00D4FF';
    return '#f59e0b';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1a2540" strokeWidth={strokeWidth} />
          {/* Progress circle */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={getColor()} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-heading font-bold text-white">{Math.round(percentage)}%</span>
          <span className="text-[10px] text-slate-500">Complete</span>
        </div>
      </div>
    </div>
  );
});

export default ProgressRing;
