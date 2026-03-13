export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
        <span className="text-cyan-400 text-xs font-bold">A</span>
      </div>
      <div className="bg-navy-700 border border-navy-600 rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
