import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '../../lib/resources';
import { ApiError } from '../../lib/api';

type CoinPkg = {
  id: number; coins: number; price: number; currency: string; bonus: number;
  isPopular: boolean; isBestValue: boolean; isActive: boolean;
};

type SubPlan = {
  id: number; name: string; slug: string; price: number; currency: string;
  period: string; monthlyCoins: number; isPopular: boolean; isBestValue: boolean; isActive: boolean;
};

export default function AdminPricing() {
  const [packages, setPackages] = useState<CoinPkg[]>([]);
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      adminApi.listAdminCoinPackages().catch(err => {
        setError(err instanceof ApiError ? err.message : 'Failed to load packages.');
        return [] as CoinPkg[];
      }),
      adminApi.listAdminSubscriptionPlans().catch(err => {
        setError(err instanceof ApiError ? err.message : 'Failed to load plans.');
        return [] as SubPlan[];
      }),
    ]).then(([p, s]) => {
      setPackages(p);
      setPlans(s);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const savePackage = async (pkg: CoinPkg) => {
    setSavingId(`pkg-${pkg.id}`);
    setMessage('');
    setError('');
    try {
      await adminApi.updateCoinPackage(pkg.id, {
        price: Number(pkg.price),
        currency: pkg.currency,
        coins: Number(pkg.coins),
        bonus: Number(pkg.bonus),
        isActive: pkg.isActive,
        isPopular: pkg.isPopular,
        isBestValue: pkg.isBestValue,
      });
      setMessage('Coin package saved.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save package.');
    } finally {
      setSavingId(null);
    }
  };

  const savePlan = async (plan: SubPlan) => {
    setSavingId(`plan-${plan.id}`);
    setMessage('');
    setError('');
    try {
      await adminApi.updateSubscriptionPlan(plan.id, {
        price: Number(plan.price),
        currency: plan.currency,
        monthlyCoins: Number(plan.monthlyCoins),
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        isBestValue: plan.isBestValue,
      });
      setMessage('Subscription plan saved.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save plan.');
    } finally {
      setSavingId(null);
    }
  };

  const updatePkg = (id: number, patch: Partial<CoinPkg>) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updatePlan = (id: number, patch: Partial<SubPlan>) => {
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pricing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Edit coin packages and subscription prices. Changes apply to checkout immediately.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
      )}
      {message && (
        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm">{message}</div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Coin packages</h2>
        <div className="space-y-3">
          {packages.map(pkg => (
            <div key={pkg.id} className="card p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
              <div>
                <label className="text-xs text-gray-500">Coins</label>
                <input type="number" className="input-field" value={pkg.coins}
                  onChange={e => updatePkg(pkg.id, { coins: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Bonus</label>
                <input type="number" className="input-field" value={pkg.bonus}
                  onChange={e => updatePkg(pkg.id, { bonus: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Price</label>
                <input type="number" step="0.01" className="input-field" value={pkg.price}
                  onChange={e => updatePkg(pkg.id, { price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Currency</label>
                <input type="text" className="input-field uppercase" value={pkg.currency}
                  onChange={e => updatePkg(pkg.id, { currency: e.target.value.toUpperCase() })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={pkg.isActive}
                  onChange={e => updatePkg(pkg.id, { isActive: e.target.checked })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={pkg.isBestValue}
                  onChange={e => updatePkg(pkg.id, { isBestValue: e.target.checked })} />
                Best value
              </label>
              <button type="button" onClick={() => savePackage(pkg)} disabled={savingId === `pkg-${pkg.id}`}
                className="btn-primary py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingId === `pkg-${pkg.id}` ? 'Saving…' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Subscription plans</h2>
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className="card p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="text-xs text-gray-500">Plan</label>
                <p className="font-semibold text-gray-900 dark:text-white pt-2">{plan.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Price</label>
                <input type="number" step="0.01" className="input-field" value={plan.price}
                  onChange={e => updatePlan(plan.id, { price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Currency</label>
                <input type="text" className="input-field uppercase" value={plan.currency}
                  onChange={e => updatePlan(plan.id, { currency: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className="text-xs text-gray-500">Monthly coins</label>
                <input type="number" className="input-field" value={plan.monthlyCoins}
                  onChange={e => updatePlan(plan.id, { monthlyCoins: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={plan.isActive}
                  onChange={e => updatePlan(plan.id, { isActive: e.target.checked })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={plan.isBestValue}
                  onChange={e => updatePlan(plan.id, { isBestValue: e.target.checked })} />
                Best value
              </label>
              <button type="button" onClick={() => savePlan(plan)} disabled={savingId === `plan-${plan.id}`}
                className="btn-primary py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {savingId === `plan-${plan.id}` ? 'Saving…' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
                                                      }
