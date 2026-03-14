import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow() {
  const { messages, loading, error, sendMessage, loadHistory } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-w-0 flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-600">
        <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-sm">A</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Axiom</h3>
          <p className="text-[10px] text-slate-500">AI Onboarding Assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-slate-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Hey there!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              I'm Axiom, your NovaByte onboarding assistant. Ask me anything about setup, docs, or your tasks.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['How do I set up my local env?', 'What are the coding standards?', 'Tell me about the architecture'].map((q) => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-navy-600 text-slate-400 hover:border-cyan-400/30 hover:text-cyan-400 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="text-center text-xs text-red-400 py-2">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-navy-600">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input-field flex-1 text-sm"
            placeholder="Ask Axiom about NovaByte setup, docs, or tasks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary px-4" disabled={loading || !input.trim()}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
