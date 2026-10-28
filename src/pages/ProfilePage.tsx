import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, BookOpen, Clock, Settings, LogOut, ShieldCheck, Coins, HelpCircle, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userApi } from '../lib/resources';
import { getAvatarUrl } from '../lib/avatar';
import { ApiError } from '../lib/api';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [recentlyRead, setRecentlyRead] = useState<
    { novelId: number; novelTitle: string; cover: string }[]
  >([]);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    if (!user) return;
    userApi
      .readingHistory(1, 5)
      .then(res =>
        setRecentlyRead(
          res.items.map(h => ({
            novelId: h.novelId,
            novelTitle: h.novelTitle,
            cover: h.cover,
          }))
        )
      )
      .catch(() => {});
  }, [user]);

  const openAvatarModal = () => {
    setAvatarUrl(user?.avatar && !user.avatar.includes('default-avatar') ? user.avatar : '');
    setAvatarError('');
    setShowAvatarModal(true);
  };

  const onPickFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAvatarError('Avatar must be an image (PNG, JPG, GIF, or WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 2MB.');
      return;
    }
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const { url } = await userApi.uploadAvatar(file);
      setAvatarUrl(url);
      await userApi.updateProfile({ avatar: url });
      await refreshUser();
      setShowAvatarModal(false);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveAvatar = async () => {
    const url = avatarUrl.trim();
    if (!url) {
      setAvatarError('Upload a photo or paste an image URL.');
      return;
    }
    setSavingAvatar(true);
    setAvatarError('');
    try {
      await userApi.updateProfile({ avatar: url });
      await refreshUser();
      setShowAvatarModal(false);
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : 'Failed to update avatar.');
    } finally {
      setSavingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join Jasyre</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Create an account to track your reading journey
        </p>
        <div className="flex gap-3">
          <Link to="/login" className="btn-outline px-6 py-2.5 rounded-xl">
            Log In
          </Link>
          <Link to="/signup" className="btn-primary px-6 py-2.5 rounded-xl">
            Sign Up
          </Link>
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
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] dark:from-[#1a1a2e] dark:to-[#0f0f1a] px-4 pt-6 pb-8 relative">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={getAvatarUrl(user.avatar)}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#e91e8c]/30"
              onError={e => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
            <button
              type="button"
              onClick={openAvatarModal}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#e91e8c] rounded-full flex items-center justify-center"
              aria-label="Change avatar"
            >
              <Edit2 className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <p className="text-white/60 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                  user.subscription === 'gold'
                    ? 'bg-amber-400/20 text-amber-400'
                    : user.subscription === 'diamond'
                      ? 'bg-blue-400/20 text-blue-400'
                      : user.subscription === 'silver'
                        ? 'bg-gray-400/20 text-gray-300'
                        : 'bg-gray-700 text-gray-400'
                }`}
              >
                {user.subscription === 'free' ? 'Free' : `${user.subscription} ✨`}
              </span>
            </div>
          </div>
          <Link
            to="/settings"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </Link>
        </div>

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

        {recentlyRead.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Recently Read</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {recentlyRead.map(item => (
                <Link key={item.novelId} to={`/novel/${item.novelId}`} className="shrink-0">
                  <img
                    src={item.cover}
                    alt={item.novelTitle}
                    className="w-16 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
              }`}
            >
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="ml-auto text-gray-300 dark:text-gray-600">›</span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{t.logout}</span>
        </button>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Change avatar</h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <img
                src={getAvatarUrl(avatarUrl || user.avatar)}
                alt="Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#e91e8c]/30"
                onError={e => {
                  (e.target as HTMLImageElement).src = '/default-avatar.svg';
                }}
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) onPickFile(f);
                e.target.value = '';
              }}
            />

            <button
              type="button"
              disabled={uploadingAvatar || savingAvatar}
              onClick={() => fileRef.current?.click()}
              className="w-full py-2.5 mb-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadingAvatar ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload from device
                </>
              )}
            </button>

            <label className="text-xs text-gray-500 dark:text-gray-400">Or paste image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="input-field mt-1 mb-3"
            />

            {avatarError && <p className="text-sm text-red-500 mb-3">{avatarError}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAvatar}
                disabled={savingAvatar || uploadingAvatar}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {savingAvatar ? 'Saving…' : 'Save URL'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              PNG, JPG, GIF or WebP · max 2MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
