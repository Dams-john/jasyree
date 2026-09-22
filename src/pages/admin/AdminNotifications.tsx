import { useState } from 'react';
import { Bell, Send, Users, Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../lib/resources';
import { ApiError } from '../../lib/api';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'subscribers'>('all');
  const [sending, setSending] = useState(false);
  const [successResult, setSuccessResult] = useState<{ count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setSuccessResult(null);
    setErrorMsg('');

    try {
      const res = await adminApi.broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        audience,
      });
      setSuccessResult({ count: res.recipientCount });
      setTitle('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Broadcast Notifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send push notifications and announcements directly to readers via Notification service.
        </p>
      </div>

      {successResult && (
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium">
            Broadcast successfully dispatched to <strong>{successResult.count}</strong> user(s)!
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSend} className="md:col-span-2 card p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Weekend Coin Bonus Live!"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement or promotion details..."
              className="input-field h-28 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Audience
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAudience('all')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  audience === 'all'
                    ? 'border-[#e91e8c] bg-[#e91e8c]/10 text-[#e91e8c]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <div>
                  <p className="text-xs font-bold">All Users</p>
                  <p className="text-[10px] opacity-75">All active readers</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAudience('subscribers')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                  audience === 'subscribers'
                    ? 'border-[#e91e8c] bg-[#e91e8c]/10 text-[#e91e8c]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Crown className="w-4 h-4" />
                <div>
                  <p className="text-xs font-bold">Subscribers</p>
                  <p className="text-[10px] opacity-75">Active subscribers</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending Broadcast...' : 'Broadcast Notification'}
          </button>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reader Preview</h2>
          <div className="card p-4 space-y-2 border-l-4 border-l-[#e91e8c]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#e91e8c]/10 flex items-center justify-center text-[#e91e8c]">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {title.trim() || 'Notification Title'}
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
              {message.trim() || 'Notification message will appear here in the reader’s notifications list...'}
            </p>
            <p className="text-[10px] text-gray-400">Just now • Promo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

