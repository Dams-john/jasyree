import { useState } from 'react';
import { Play, Clock, Users, Check, Coins, Gift, Flame, Trophy, Gem, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const DAILY_REWARDS = [
  { day: 1, coins: 10, claimed: true },
  { day: 2, coins: 20, claimed: true },
  { day: 3, coins: 30, claimed: true },
  { day: 4, coins: 40, claimed: true },
  { day: 5, coins: 50, claimed: false, isToday: true },
  { day: 6, coins: 60, claimed: false },
  { day: 7, coins: 100, claimed: false, isSpecial: true },
];

export default function RewardsPage() {
  const { user, updateCoins } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState(0);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adClaimed, setAdClaimed] = useState(false);
  const [claimedDays, setClaimedDays] = useState<number[]>(
    DAILY_REWARDS.filter(r => r.claimed).map(r => r.day)
  );

  const claimDailyReward = (reward: typeof DAILY_REWARDS[0]) => {
    if (claimedDays.includes(reward.day)) return;
    updateCoins(reward.coins);
    setClaimedDays([...claimedDays, reward.day]);
  };

  const handleWatchAd = async () => {
    setWatchingAd(true);
    for (let i = 0; i <= 30; i++) {
      await new Promise(r => setTimeout(r, 100));
      setReadingProgress(Math.min(100, Math.round((i / 30) * 100)));
    }
    setWatchingAd(false);
    setAdClaimed(true);
    updateCoins(15);
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 h-12 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white">{t.dailyRewards}</h1>
        <div className="ml-auto flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{user?.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Daily Check-in */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Daily Check-in</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Login everyday and earn amazing rewards!</p>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">5 days</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DAILY_REWARDS.map(reward => {
              const isClaimed = claimedDays.includes(reward.day);
              const canClaim = reward.isToday && !isClaimed;
              return (
                <div key={reward.day}
                  className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${canClaim ? 'border-[#e91e8c] bg-[#e91e8c]/5' : isClaimed ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30'}`}>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Day {reward.day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isClaimed ? 'bg-emerald-500' : canClaim ? 'bg-[#e91e8c]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {isClaimed ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : reward.isSpecial ? (
                      <Gift className="w-4 h-4 text-white" />
                    ) : (
                      <Coins className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${isClaimed ? 'text-emerald-500' : canClaim ? 'text-[#e91e8c]' : 'text-gray-500 dark:text-gray-400'}`}>
                    {reward.coins}
                  </span>
                  {canClaim && (
                    <button onClick={() => claimDailyReward(reward)}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#e91e8c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Claim
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Rewards */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Other Rewards</h2>
          <div className="space-y-3">
            {/* Watch Ad */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Watch Ad</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Watch a short ad and earn 15 Coins</p>
                {watchingAd && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${readingProgress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{readingProgress}%</span>
                  </div>
                )}
              </div>
              <button onClick={handleWatchAd} disabled={watchingAd || adClaimed}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${adClaimed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' : 'bg-[#e91e8c] text-white hover:bg-[#c41578]'} disabled:opacity-60`}>
                {adClaimed ? <Check className="w-4 h-4" /> : watchingAd ? '...' : 'Watch'}
              </button>
            </div>

            {/* Reading Reward */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Reading Reward</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Read 30 minutes and earn 20 Coins</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-xs text-gray-500">0/30 min</span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
                Read
              </button>
            </div>

            {/* Invite Friends */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-[#e91e8c]/10 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#e91e8c]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Invite Friends</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Invite a friend and earn 100 Coins</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold hover:bg-[#c41578] transition-colors">
                Invite
              </button>
            </div>
          </div>
        </div>

        {/* Streak info */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Your Streak</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Current Streak', value: '5 days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Longest Streak', value: '12 days', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Total Rewards', value: '580', icon: Gem, color: 'text-[#e91e8c]', bg: 'bg-[#e91e8c]/10' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{stat.value}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
