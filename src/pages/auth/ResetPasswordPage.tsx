import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) { setError('Email and reset token are required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(email, token, password, confirm);
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] flex flex-col">
      <div className="flex justify-center pt-12 pb-8">
        <Link to="/" className="text-3xl font-black text-[#e91e8c] tracking-tight">JASYRE</Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="card p-8 animate-slide-up">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">Reset Password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Enter your new password below.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your account email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reset Token</label>
                <input type="text" value={token} onChange={e => setToken(e.target.value)}
                  placeholder="Paste the token from your reset email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password" className="input-field pr-12" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password" className="input-field" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Remembered your password?{' '}
              <Link to="/login" className="text-[#e91e8c] font-semibold hover:text-[#c41578]">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
