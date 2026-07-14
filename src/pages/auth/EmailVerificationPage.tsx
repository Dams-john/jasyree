import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (idx: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1a] flex flex-col">
      <div className="flex justify-center pt-12 pb-8">
        <Link to="/" className="text-3xl font-black text-[#e91e8c] tracking-tight">JASYRE</Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="card p-8 text-center animate-slide-up">
            <div className="w-16 h-16 bg-[#e91e8c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#e91e8c]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              We sent a 6-digit code to your email address. Enter it below to verify your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 justify-center">
                {code.map((c, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" value={c}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !c && i > 0) {
                        const prev = document.getElementById(`otp-${i - 1}`);
                        prev?.focus();
                      }
                    }}
                    className="w-11 h-13 text-center text-lg font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#16213e] text-gray-900 dark:text-white focus:outline-none focus:border-[#e91e8c] transition-colors"
                    style={{ height: '52px' }}
                    maxLength={1} />
                ))}
              </div>

              <button type="submit" disabled={loading || code.some(c => !c)}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Email'}
              </button>
            </form>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-5">
              Didn't receive?{' '}
              <button className="text-[#e91e8c] font-semibold hover:text-[#c41578]">Resend Code</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
