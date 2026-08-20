import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, BookOpen, Clock, Settings, LogOut, ShieldCheck, Coins, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userApi } from '../lib/resources';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentlyRead, setRecentlyRead] = useState<{ novelId: number; novelTitle: string; cover: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    userApi.readingHistory(1, 5)
      .then(res => setRecentlyRead(res.items.map(h => ({ novelId: h.novelId, novelTitle: h.novelTitle, cover: h.cover }))))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join Jasyre</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Create an account to track your reading journey</p>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline px-6 py-2.5 rounded-xl">Log In</Link>
          <Link to="/signup" className="btn-primary px-6 py-2.5 rounded-xl">Sign Up</Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: BookOpen, label: t.myLibrary, to: '/library' },
    { icon: Coins, label: t.wallet, to: '/wallet' },
    { icon: Clock, label: t.purchaseHistory, to: '/wallet' },
    { icon: ShieldCheck, label: 'Subscription', to: '/subscription' },
    { icon: Settings, label: t.settings, to: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', to: '/settings' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-[#1a1a2e] dark:to-[#0f0f1a] px-4 pt-6 pb-8 relative">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#e91e8c]/30" />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#e91e8c] rounded-full flex items-center justify-center">
              <Edit2 className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <p className="text-white/60 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${user.subscription === 'gold' ? 'bg-amber-400/20 text-amber-400' : user.subscription === 'diamond' ? 'bg-blue-400/20 text-blue-400' : user.subscription === 'silver' ? 'bg-gray-400/20 text-gray-300' : 'bg-gray-700 text-gray-400'}`}>
                {user.subscription === 'free' ? 'Free' : `${user.subscription} ✨`}
              </span>
            </div>
          </div>
          <Link to="/settings" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: 'Books Read', value: user.booksRead },
            { label: 'Following', value: user.following },
            { label: 'Followers', value: user.followers },
            { label: 'Coins', value: user.coins.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-white/50 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Reading Activity */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Reading Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Hours Read', value: `${Math.round(user.totalReadTime / 60)}h` },
              { label: 'Words Read', value: '520K' },
              { label: 'Streak', value: '5 days' },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <p className="text-lg font-black text-[#e91e8c]">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Read */}
        {recentlyRead.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Recently Read</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {recentlyRead.map(item => (
                <Link key={item.novelId} to={`/novel/${item.novelId}`} className="shrink-0">
                  <img src={item.cover} alt={item.novelTitle} className="w-16 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="card overflow-hidden">
          {menuItems.map((item, i) => (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="ml-auto text-gray-300 dark:text-gray-600">›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{t.logout}</span>
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
        </p>
      </div>
    </div>
  );
}
