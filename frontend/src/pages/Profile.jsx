import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, persona, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-navy-600 bg-navy-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
            <span className="text-cyan-400 font-heading font-bold text-sm">A</span>
          </div>
          <h1 className="text-lg font-heading font-semibold text-white">Axiom</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs py-1.5 px-3">
            ← Dashboard
          </button>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-8 space-y-6">
        <h2 className="text-2xl font-heading font-bold text-white">Your Profile</h2>

        {/* Identity */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Account</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Name</p>
              <p className="text-sm text-white font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Email</p>
              <p className="text-sm text-slate-300">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Role</p>
              <p className="text-sm text-slate-300 capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Experience</p>
              <p className="text-sm text-slate-300 capitalize">{user.experienceLevel}</p>
            </div>
            {user.team && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Team</p>
                <p className="text-sm text-slate-300">{user.team}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">Member Since</p>
              <p className="text-sm text-slate-300">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {user.techStack && user.techStack.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {user.techStack.map((tech) => (
                  <span key={tech} className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Persona */}
        {persona && (
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Onboarding Persona</h3>
            <div className="card-elevated p-4">
              <h4 className="text-base font-heading font-semibold text-cyan-400 mb-1">{persona.name}</h4>
              <p className="text-xs text-slate-500 mb-3 font-mono capitalize">
                {persona.role} · {persona.experienceLevel}
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Focus: </span>
                  <span className="text-slate-300">{persona.onboardingFocus}</span>
                </div>
                <div>
                  <span className="text-slate-500">Objectives: </span>
                  <span className="text-slate-300">{persona.learningObjectives}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!persona && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Onboarding Persona</h3>
            <p className="text-sm text-slate-500">No persona assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
