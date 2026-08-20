import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Chrome, Apple, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SignUpPage() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agree) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.ok) navigate('/email-verification', { state: { email } });
    else setError(result.error || 'Something went wrong. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] flex flex-col">
      <div className="flex justify-center pt-12 pb-8">
        <Link to="/" className="text-3xl font-black text-[#e91e8c] tracking-tight">JASYRE</Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          <div className="card p-8 animate-slide-up">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">{t.createAccount}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">Join Jasyre and explore thousands of stories.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.emailAddress}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.password}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password" className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm your password" className="input-field" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <button type="button" onClick={() => setAgree(!agree)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${agree ? 'bg-[#e91e8c] border-[#e91e8c]' : 'border-gray-300 dark:border-gray-600'}`}>
                  {agree && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/settings" className="text-[#e91e8c] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/settings" className="text-[#e91e8c] hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t.signup}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center"><span className="bg-white dark:bg-[#1e1e32] px-3 text-xs text-gray-400">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                <Chrome className="w-4 h-4" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                <Apple className="w-4 h-4" />
                Apple
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#e91e8c] font-semibold hover:text-[#c41578]">{t.login}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
