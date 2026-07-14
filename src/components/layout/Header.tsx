import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Coins, ChevronDown, Menu, X, Globe, LogOut, User, Settings, BookOpen, BarChart2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGES } from '../../data/translations';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const navLinks = [
    { label: t.home, to: '/' },
    { label: t.genres, to: '/genres' },
    { label: 'Ranking', to: '/ranking' },
    { label: t.rewards, to: '/rewards' },
    { label: t.community, to: '/comments' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-black text-[#e91e8c] tracking-tight">JASYRE</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#e91e8c] dark:hover:text-[#e91e8c] transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search Bar (desktop) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search novels, authors..."
              onFocus={() => navigate('/search')}
              className="w-56 lg:w-72 pl-4 pr-10 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent focus:border-[#e91e8c] focus:outline-none transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <button onClick={() => setMobileSearch(!mobileSearch)} className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          {mobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button onClick={() => setShowLangMenu(!showLangMenu)} className="hidden sm:flex items-center gap-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Globe className="w-5 h-5" />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e1e32] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fade-in">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${language === lang.code ? 'text-[#e91e8c] font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && user ? (
          <>
            {/* Coins */}
            <Link to="/wallet" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <span className="text-base">🪙</span>
              <span>{user.coins.toLocaleString()}</span>
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#e91e8c] rounded-full" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e91e8c]/30" />
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1e1e32] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-amber-500 font-medium mt-0.5 capitalize">{user.subscription} Plan</p>
                  </div>
                  {[
                    { icon: User, label: t.profile, to: '/profile' },
                    { icon: BookOpen, label: t.myLibrary, to: '/library' },
                    { icon: Coins, label: t.wallet, to: '/wallet' },
                    { icon: BarChart2, label: 'Admin', to: '/admin' },
                    { icon: Settings, label: t.settings, to: '/settings' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                    <button onClick={() => { logout(); setShowUserMenu(false); navigate('/login'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#e91e8c] transition-colors">
              {t.login}
            </Link>
            <Link to="/signup" className="px-4 py-1.5 text-sm font-semibold bg-[#e91e8c] text-white rounded-full hover:bg-[#c41578] transition-colors">
              {t.signup}
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button onClick={onMenuToggle} className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearch && (
        <div className="md:hidden px-4 pb-3 animate-slide-down">
          <div className="relative">
            <input type="text" placeholder="Search novels, authors..." autoFocus
              onFocus={() => { navigate('/search'); setMobileSearch(false); }}
              className="w-full pl-4 pr-10 py-2.5 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent focus:border-[#e91e8c] focus:outline-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showUserMenu || showLangMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setShowLangMenu(false); }} />
      )}
    </header>
  );
}
