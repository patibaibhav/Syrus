import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const TECH_OPTIONS = ['Node.js', 'Python', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis', 'AWS', 'TailwindCSS', 'Express', 'FastAPI', 'Vite', 'Jest', 'Kubernetes', 'JavaScript'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedPersona, setMatchedPersona] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'backend', experienceLevel: 'junior',
    techStack: [], team: '',
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTech = (tech) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await register(form);
      if (result.success) {
        setMatchedPersona(result.persona);
        setStep(4);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/20 flex items-center justify-center">
              <span className="text-cyan-400 font-heading font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Axiom</h1>
          </div>
          <p className="text-slate-400 text-sm">Begin your onboarding journey</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-semibold transition-all ${
                step >= s ? 'bg-cyan-400 text-navy-950' : 'bg-navy-700 text-slate-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-cyan-400' : 'bg-navy-700'}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-lg font-heading font-semibold text-white mb-4">Let's get started</h2>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                <input className="input-field" placeholder="Alex Chen" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                <input className="input-field" type="email" placeholder="alex@company.dev" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
              </div>
              <button className="btn-primary w-full mt-4" onClick={() => setStep(2)}
                disabled={!form.name || !form.email || !form.password || form.password.length < 6}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Role & Experience */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-lg font-heading font-semibold text-white mb-4">Your role & experience</h2>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Primary Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {['backend', 'frontend', 'fullstack', 'devops'].map((role) => (
                    <button key={role} onClick={() => updateField('role', role)}
                      className={`p-3 rounded border text-sm font-medium capitalize transition-all ${
                        form.role === role
                          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                          : 'border-navy-600 text-slate-400 hover:border-navy-500'
                      }`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Experience Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['intern', 'junior', 'mid', 'senior'].map((lvl) => (
                    <button key={lvl} onClick={() => updateField('experienceLevel', lvl)}
                      className={`p-2.5 rounded border text-sm font-medium capitalize transition-all ${
                        form.experienceLevel === lvl
                          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                          : 'border-navy-600 text-slate-400 hover:border-navy-500'
                      }`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack & Team */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-lg font-heading font-semibold text-white mb-4">Tech stack & team</h2>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Select your technologies</label>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map((tech) => (
                    <button key={tech} onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                        form.techStack.includes(tech)
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40'
                          : 'bg-navy-700 text-slate-400 border border-navy-600 hover:border-navy-500'
                      }`}>
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Team</label>
                <input className="input-field" placeholder="e.g. Platform, Frontend, Data" value={form.team} onChange={(e) => updateField('team', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating account...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Persona Match */}
          {step === 4 && matchedPersona && (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-white mb-2">Welcome aboard!</h2>
              <p className="text-slate-400 text-sm mb-6">You've been matched as:</p>

              <div className="card-elevated p-6 text-left mb-6">
                <h3 className="text-lg font-heading font-semibold text-cyan-400 mb-2">{matchedPersona.name}</h3>
                {matchedPersona.matchReason && (
                  <p className="text-xs font-mono text-slate-500 mb-3">Match: {matchedPersona.matchReason}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Focus: </span>
                    <span className="text-slate-300">{matchedPersona.onboardingFocus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Objectives: </span>
                    <span className="text-slate-300">{matchedPersona.learningObjectives}</span>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full" onClick={() => navigate('/dashboard')}>
                Start Onboarding →
              </button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
