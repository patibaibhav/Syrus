import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(result.user.role === 'manager' ? '/manager' : '/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/20 flex items-center justify-center">
              <span className="text-cyan-400 font-heading font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Axiom</h1>
          </div>
          <p className="text-slate-400 text-sm">NovaByte Developer Onboarding Intelligence</p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <h2 className="text-xl font-heading font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@novabyte.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            New developer?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline">
              Start onboarding
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-4 border-t border-navy-600">
            <p className="text-xs text-slate-500 mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs font-mono text-slate-400">
              <p>Developer: riya.sharma@novabyte.dev / password123</p>
              <p>Manager: manager@novabyte.dev / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
