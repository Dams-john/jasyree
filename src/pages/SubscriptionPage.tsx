import { useState } from 'react';
import { Check, ShieldCheck, Crown, Sparkles, Gem, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/coins';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PLAN_ICONS = {
  Silver: Star,
  Gold: Crown,
  Diamond: Gem,
};

const PLAN_GRADIENTS = {
  Silver: 'from-gray-300 to-gray-400',
  Gold: 'from-amber-300 to-amber-500',
  Diamond: 'from-blue-300 to-blue-500',
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (planId: number) => {
    setSelected(planId);
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigate('/profile'); }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e91e8c]/10 rounded-full text-sm font-semibold text-[#e91e8c] mb-3">
          <Sparkles className="w-4 h-4" />
          Premium Plans
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Choose a Plan</h1>
        <p className="text-gray-500 dark:text-gray-400">Unlock the full reading experience</p>
        {user && (
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
            <span className="text-gray-500 dark:text-gray-400">Current plan:</span>
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{user.subscription}</span>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-stretch">
        {SUBSCRIPTION_PLANS.map(plan => {
          const Icon = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || Star;
          const gradient = PLAN_GRADIENTS[plan.name as keyof typeof PLAN_GRADIENTS] || 'from-gray-300 to-gray-400';
          const isBestValue = plan.isBestValue;
          return (
            <div key={plan.id}
              className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${isBestValue ? 'border-[#e91e8c] bg-gradient-to-b from-[#e91e8c]/5 to-transparent dark:from-[#e91e8c]/10 dark:to-transparent scale-[1.03] shadow-xl shadow-[#e91e8c]/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e32]'}`}>
              {isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e91e8c] text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap shadow-lg">
                  Best Value
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-black text-center mb-1" style={{ color: plan.color }}>{plan.name}</h3>

              {/* Price */}
              <div className="text-center mb-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {plan.currency} {plan.price.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
              </div>

              {/* Monthly Coins */}
              {plan.monthlyCoins && (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full text-sm font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-black text-white">C</span>
                    {plan.monthlyCoins} coins/month
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isBestValue ? 'bg-[#e91e8c]' : 'bg-emerald-500'}`}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button onClick={() => handleSubscribe(plan.id)} disabled={processing && selected === plan.id}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isBestValue ? 'bg-[#e91e8c] hover:bg-[#c41578] text-white shadow-lg shadow-[#e91e8c]/30' : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white'}`}>
                {processing && selected === plan.id ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure payment via Paystack, Flutterwave, Stripe & PayPal
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Cancel anytime. No hidden fees.</p>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-8 text-center w-full max-w-xs animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#e91e8c]/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-[#e91e8c]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subscribed!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome to {SUBSCRIPTION_PLANS.find(p => p.id === selected)?.name} plan!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
