import { useState, useEffect } from 'react';
import { Check, ShieldCheck, Crown, Sparkles, Gem, Star } from 'lucide-react';
import { paymentsApi, SubscriptionPlan } from '../lib/resources';
import { ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PLAN_ICONS: Record<string, typeof Star> = {
  Silver: Star,
  Gold: Crown,
  Diamond: Gem,
};

const PLAN_GRADIENTS: Record<string, string> = {
  Silver: 'from-gray-300 to-gray-400',
  Gold: 'from-amber-300 to-amber-500',
  Diamond: 'from-blue-300 to-blue-500',
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentsApi.listSubscriptionPlans()
      .then(data => setPlans(data || []))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load plans.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelected(planId);
    setProcessing(true);
    setError('');
    try {
      const { checkoutUrl } = await paymentsApi.checkout({ type: 'subscription', id: planId });
      if (!checkoutUrl) {
        setError('No checkout URL returned.');
        setProcessing(false);
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-8">
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

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No plans available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-stretch">
          {plans.map(plan => {
            const Icon = PLAN_ICONS[plan.name] || Star;
            const gradient = PLAN_GRADIENTS[plan.name] || 'from-gray-300 to-gray-400';
            const isBestValue = plan.isBestValue;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${
                  isBestValue
                    ? 'border-[#e91e8c] bg-gradient-to-b from-[#e91e8c]/5 to-transparent dark:from-[#e91e8c]/10 dark:to-transparent scale-[1.03] shadow-xl shadow-[#e91e8c]/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e32]'
                }`}
              >
                {isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e91e8c] text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap shadow-lg">
                    Best Value
                  </div>
                )}

                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-black text-center mb-1" style={{ color: plan.color || undefined }}>
                  {plan.name}
                </h3>

                <div className="text-center mb-1">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {plan.currency} {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/{plan.period}</span>
                </div>

                {plan.monthlyCoins > 0 && (
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {plan.monthlyCoins} coins/month
                    </span>
                  </div>
                )}

                <ul className="space-y-2.5 mb-6 flex-1">
                  {(plan.features || []).map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isBestValue ? 'bg-[#e91e8c]' : 'bg-emerald-500'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing && selected === plan.id}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isBestValue
                      ? 'bg-[#e91e8c] hover:bg-[#c41578] text-white shadow-lg shadow-[#e91e8c]/30'
                      : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white'
                  }`}
                >
                  {processing && selected === plan.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure payment via Stripe
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
