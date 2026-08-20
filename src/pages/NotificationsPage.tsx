import { useState } from 'react';
import { Bell, BookOpen, Gift, MessageCircle, Tag, Settings } from 'lucide-react';
import { NOTIFICATIONS } from '../data/users';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const TYPE_ICONS = {
  chapter: BookOpen,
  reward: Gift,
  comment: MessageCircle,
  promo: Tag,
  system: Settings,
};

const TYPE_COLORS = {
  chapter: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
  reward: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
  comment: 'bg-[#e91e8c]/10 text-[#e91e8c]',
  promo: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
  system: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{t.notifications}</h1>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-[#e91e8c] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#e91e8c] font-medium hover:text-[#c41578]">
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4 pt-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notif, i) => {
              const Icon = TYPE_ICONS[notif.type];
              const colorClass = TYPE_COLORS[notif.type];

              return (
                <div key={notif.id}
                  className={`flex gap-3 p-4 rounded-xl transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#e91e8c]/5 dark:bg-[#e91e8c]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{notif.time}</span>
                        {!notif.isRead && <span className="w-2 h-2 bg-[#e91e8c] rounded-full shrink-0" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    {notif.novelId && (
                      <Link to={`/novel/${notif.novelId}`} className="inline-block mt-1.5 text-xs text-[#e91e8c] font-medium hover:text-[#c41578]">
                        View Novel →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
