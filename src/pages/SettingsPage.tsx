import { useState } from 'react';
import { Sun, Moon, Globe, Bell, Lock, Trash2, HelpCircle, FileText, Shield, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../data/translations';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({ newChapters: true, comments: true, promos: false, dailyReward: true });
  const [showLangPicker, setShowLangPicker] = useState(false);

  const selectedLang = LANGUAGES.find(l => l.code === language)!;

  const settingGroups = [
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Theme',
          value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
          action: (
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['light', 'dark'] as const).map(th => (
                <button key={th} onClick={() => setTheme(th)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${theme === th ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                  {th === 'light' ? t.light : t.dark}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Language',
      items: [
        {
          icon: Globe,
          label: 'Language',
          value: `${selectedLang.flag} ${selectedLang.nativeName}`,
          onClick: () => setShowLangPicker(true),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: Bell, label: 'New Chapters', key: 'newChapters' as const },
        { icon: Bell, label: 'Comments & Replies', key: 'comments' as const },
        { icon: Bell, label: 'Promotions & Offers', key: 'promos' as const },
        { icon: Bell, label: 'Daily Reward Reminder', key: 'dailyReward' as const },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Change Password', showArrow: true },
        { icon: Shield, label: 'Privacy Policy', showArrow: true },
        { icon: FileText, label: 'Terms of Service', showArrow: true },
        { icon: HelpCircle, label: 'Help & Support', showArrow: true },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t.settings}</h1>
      </div>

      <div className="px-4 space-y-5">
        {settingGroups.map(group => (
          <div key={group.title}>
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{group.title}</h2>
            <div className="card overflow-hidden">
              {group.items.map((item, i) => {
                const isNotification = 'key' in item;
                const Icon = item.icon;
                return (
                  <div key={item.label}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''} ${item.onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
                    onClick={item.onClick}>
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                      {!isNotification && item.value && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.value}</p>
                      )}
                    </div>
                    {isNotification ? (
                      <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-[#e91e8c]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    ) : item.action ? (
                      item.action
                    ) : item.showArrow ? (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Danger Zone</h2>
          <div className="card overflow-hidden">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm font-medium">Delete Account</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600">Jasyre v1.0.0</p>
      </div>

      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowLangPicker(false)}>
          <div className="w-full bg-white dark:bg-[#1e1e32] rounded-t-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-center">Select Language</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${language === lang.code ? 'bg-[#e91e8c]/10' : ''}`}>
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={`font-medium text-sm ${language === lang.code ? 'text-[#e91e8c]' : 'text-gray-900 dark:text-white'}`}>{lang.nativeName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</p>
                  </div>
                  {language === lang.code && <span className="ml-auto text-[#e91e8c] font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
