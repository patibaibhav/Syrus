export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 animate-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-navy-600' : 'bg-cyan-400/20'
      }`}>
        <span className={`text-xs font-bold ${isUser ? 'text-slate-300' : 'text-cyan-400'}`}>
          {isUser ? 'U' : 'A'}
        </span>
      </div>

      {/* Message */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-cyan-400/10 border border-cyan-400/20 text-slate-200'
            : 'bg-navy-700 border border-navy-600 text-slate-300'
        }`}>
          <div className="prose-dark whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Source Citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((src, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-700 border border-navy-600 text-xs text-slate-400">
                <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {src.title}
              </span>
            ))}
          </div>
        )}

        {/* Confidence indicator */}
        {message.confidence && message.confidence !== 'high' && (
          <p className="text-xs text-slate-500 mt-1">
            {message.confidence === 'low' ? '⚠ Low confidence — verify with team lead' : '📋 Moderate confidence'}
          </p>
        )}

        <p className="text-[10px] text-slate-600 mt-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
