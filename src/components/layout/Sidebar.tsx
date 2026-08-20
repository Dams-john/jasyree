import { Link, useLocation } from 'react-router-dom';
import { X, Home, BookOpen, Coins, Gift, Users, User, Settings, Bell, Search, Tag, BarChart2, BookMarked, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: t.home, to: '/' },
    { icon: Search, label: t.search, to: '/search' },
    { icon: BookOpen, label: t.library, to: '/library' },
    { icon: Tag, label: t.genres, to: '/genres' },
    { icon: Coins, label: t.coins, to: '/wallet' },
    { icon: Gift, label: t.rewards, to: '/rewards' },
    { icon: Bell, label: t.notifications, to: '/notifications' },
    { icon: Users, label: t.community, to: '/comments' },
    { icon: User, label: t.profile, to: '/profile' },
    { icon: BookMarked, label: 'Subscription', to: '/subscription' },
    { icon: Settings, label: t.settings, to: '/settings' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1a1a2e] z-50 md:hidden shadow-2xl flex flex-col animate-slide-left">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xl font-black text-[#e91e8c]">JASYRE</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {user && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.subscription} Plan</p>
                <div className="flex items-center gap-1.5 mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full w-fit">
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-500">{user.coins.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${isActive ? 'text-[#e91e8c] bg-[#e91e8c]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#e91e8c]' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
            <Link to="/admin" onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              Admin Dashboard
            </Link>
            <Link to="#" onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              More
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
