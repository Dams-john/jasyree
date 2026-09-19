import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../lib/api';

/**
 * A separate front door for admins/authors — deliberately not linked from anywhere
 * in the normal site UI. Uses the same backend login endpoint as everyone else
 * (there's only one account system), but:
 *   1. Lives at its own URL, not mixed into the regular /login form.
 *   2. Immediately rejects + logs out anyone without author/admin role, so a
 *      regular reader account can never end up "logged in" via this screen.
 * Real enforcement still happens server-side on every admin API call — this page
 * is about keeping the entry point separate, not the actual security boundary.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in as an admin/author? Skip straight to the dashboard.
  if (isAuthenticated && user && (user.role === 'admin' || user.role === 'author')) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser) {
        setError('Incorrect email or password.');
        return;
      }
      if (loggedInUser.role !== 'admin' && loggedInUser.role !== 'author') {
        // Reject immediately — don't leave a reader account "logged in" via this screen.
        logout();
        setError('This account does not have admin access.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#e91e8c]/10 border border-[#e91e8c]/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-[#e91e8c]" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Restricted access — staff only</p>
        </div>

        <div className="bg-[#151521] border border-gray-800 rounded-2xl p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-900/40 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e91e8c] focus:border-transparent"
                placeholder="you@jnovel.app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-12 rounded-xl bg-[#0f0f1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e91e8c] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#e91e8c] hover:bg-[#c41578] text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          This portal is separate from the regular reader login and is not linked anywhere on the public site.
        </p>
      </div>
    </div>
  );
}
