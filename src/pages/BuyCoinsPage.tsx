import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Check, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi, CoinPackage } from '../lib/resources';
import { ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function BuyCoinsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentsApi.listCoinPackages()
      .then(data => setPackages(data || []))
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load packages.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async () => {
    if (!selected) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setPurchasing(true);
    setError('');
    try {
      const { checkoutUrl } = await paymentsApi.checkout({ type: 'coin_package', id: selected });
      if (!checkoutUrl) {
        setError('No checkout URL returned.');
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed.');
      setPurchasing(false);
    }
  };

  const selectedPkg = packages.find(p => p.id === selected);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 h-12 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white">Buy Coins</h1>
        <div className="ml-auto flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{(user?.coins ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e91e8c] to-[#c41578] p-5 text-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative">
            <h2 className="text-lg font-black mb-1">Get More Coins</h2>
            <p className="text-sm text-white/80">Unlock premium chapters and support authors</p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Choose a Package</h2>
          {loading ? (
            <div className="py-12 flex justify-center">
              <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {packages.map(pkg => {
                const isSelected = selected === pkg.id;
                return (
                  <button key={pkg.id} type="button" onClick={() => setSelected(pkg.id)}
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all overflow-hidden ${isSelected ? 'border-[#e91e8c] bg-[#e91e8c]/5 shadow-lg shadow-[#e91e8c]/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32] hover:border-[#e91e8c]/50'}`}>
                    {pkg.isPopular && (
                      <div className="absolute top-0 right-0 bg-[#e91e8c] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">Popular</div>
                    )}
                    {pkg.isBestValue && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">Best Value</div>
                    )}
                    <div className="relative h-16 flex items-center justify-center mb-2">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${pkg.isBestValue ? 'bg-gradient-to-br from-amber-300 to-amber-500' : pkg.isPopular ? 'bg-gradient-to-br from-[#e91e8c]/20 to-[#e91e8c]/40' : 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/40'}`}>
                        <Coins className={`w-7 h-7 ${pkg.isBestValue ? 'text-white' : 'text-amber-500'}`} />
                      </div>
                      {pkg.bonus > 0 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          +{pkg.bonus.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{pkg.coins.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Coins</p>
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{pkg.currency} {pkg.price.toLocaleString()}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#e91e8c] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Secure payment via Stripe.</span>
        </div>

        {selectedPkg && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0f0f1a] border-t border-gray-100 dark:border-gray-800 md:relative md:bottom-auto md:bg-transparent md:border-0 md:p-0">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPkg.coins.toLocaleString()}{selectedPkg.bonus ? ` + ${selectedPkg.bonus} bonus` : ''} coins
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedPkg.currency} {selectedPkg.price.toLocaleString()}
                </span>
              </div>
              <button type="button" onClick={handlePurchase} disabled={purchasing}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2">
                {purchasing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecting to Stripe…
                  </>
                ) : `Pay ${selectedPkg.currency} ${selectedPkg.price.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
          }
