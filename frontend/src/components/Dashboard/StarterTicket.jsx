import { useState, useEffect, memo } from 'react';
import { ticketAPI } from '../../services/api';

const StarterTicket = memo(function StarterTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketAPI.getStarter().then((res) => {
      if (res.data.success) setTickets(res.data.data.tickets);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await ticketAPI.updateStatus(id, status);
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  if (loading) return <div className="text-xs text-slate-500">Loading tickets...</div>;
  if (tickets.length === 0) return null;

  const ticket = tickets[0]; // Show first ticket

  const statusColors = {
    assigned: 'badge-info',
    in_progress: 'badge-warning',
    completed: 'badge-success',
  };

  return (
    <div className="p-4 card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Starter Ticket</h4>
        <span className={statusColors[ticket.status] || 'badge-neutral'}>{ticket.status.replace('_', ' ')}</span>
      </div>

      <h5 className="text-sm font-medium text-white mb-1">{ticket.title}</h5>
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{ticket.description}</p>

      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3">
        <span className="font-mono">📁 {ticket.repository}</span>
        <span>•</span>
        <span className="capitalize">{ticket.difficulty}</span>
      </div>

      {/* Status toggle */}
      <div className="flex gap-1.5">
        {ticket.status === 'assigned' && (
          <button onClick={() => updateStatus(ticket.id, 'in_progress')}
            className="btn-primary text-xs py-1.5 px-3">
            Start Working
          </button>
        )}
        {ticket.status === 'in_progress' && (
          <button onClick={() => updateStatus(ticket.id, 'completed')}
            className="btn-primary text-xs py-1.5 px-3">
            Mark Complete
          </button>
        )}
        {ticket.status === 'completed' && (
          <span className="text-xs text-green-400 font-medium">✅ Completed</span>
        )}
      </div>
    </div>
  );
});

export default StarterTicket;
