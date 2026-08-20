import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gift, User, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MobileNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { icon: Home, label: t.home, to: '/' },
    { icon: BookOpen, label: t.library, to: '/library' },
    {
      label: t.coins,
      to: '/wallet',
      custom: true,
    },
    { icon: Gift, label: t.rewards, to: '/rewards' },
    { icon: User, label: t.profile, to: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-[#0f0f1a] border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to));
          if (tab.custom) {
            return (
              <Link key={tab.to} to={tab.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-transform border-2 ${isActive ? 'bg-amber-400 border-amber-400 text-white scale-110' : 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'}`}>
                  C
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#e91e8c]" />}
              </Link>
            );
          }
          const Icon = tab.icon!;
          return (
            <Link key={tab.to} to={tab.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400'}`}>
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#e91e8c]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
