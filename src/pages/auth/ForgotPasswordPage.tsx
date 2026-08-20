import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
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
            {!sent ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <Link to="/login" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No worries, we'll send you a reset link.</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email" className="input-field" required />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                  Remembered your password?{' '}
                  <Link to="/login" className="text-[#e91e8c] font-semibold hover:text-[#c41578]">Log In</Link>
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#e91e8c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#e91e8c]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  We sent a password reset link to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                </p>
                <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="btn-primary block w-full py-3 rounded-xl text-center">
                  Continue to Reset Password
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  (Mail isn't configured in this dev environment — check the backend's error log for the reset link, or paste the token manually on the next screen.)
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Didn't receive?{' '}
                  <button onClick={() => setSent(false)} className="text-[#e91e8c] font-semibold hover:text-[#c41578]">Resend</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
