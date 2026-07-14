import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Check, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COIN_PACKAGES } from '../data/coins';
import { useAuth } from '../contexts/AuthContext';

const PAYMENT_METHODS = [
  { id: 'paystack', name: 'Paystack', logo: '🅿️', color: 'bg-sky-50 dark:bg-sky-900/20' },
  { id: 'flutterwave', name: 'Flutterwave', logo: '🇳🇬', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'stripe', name: 'Stripe', logo: '💳', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'paypal', name: 'PayPal', logo: '💰', color: 'bg-blue-50 dark:bg-blue-900/20' },
];

export default function BuyCoinsPage() {
  const navigate = useNavigate();
  const { user, updateCoins } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    if (!selected) return;
    setPurchasing(true);
    await new Promise(r => setTimeout(r, 1500));
    const pkg = COIN_PACKAGES.find(p => p.id === selected)!;
    updateCoins(pkg.coins + (pkg.bonus || 0));
    setPurchasing(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigate('/wallet'); }, 2000);
  };

  const selectedPkg = COIN_PACKAGES.find(p => p.id === selected);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-gray-50 dark:bg-[#0f0f1a] px-4 h-12 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white">Buy Coins</h1>
        <div className="ml-auto flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{user?.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e91e8c] to-[#c41578] p-5 text-white">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative">
            <h2 className="text-lg font-black mb-1">Get More Coins</h2>
            <p className="text-sm text-white/80">Unlock premium chapters and support authors</p>
          </div>
        </div>

        {/* Coin Packages */}
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Choose a Package</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COIN_PACKAGES.map(pkg => {
              const isSelected = selected === pkg.id;
              return (
                <button key={pkg.id} onClick={() => setSelected(pkg.id)}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-all overflow-hidden ${isSelected ? 'border-[#e91e8c] bg-[#e91e8c]/5 shadow-lg shadow-[#e91e8c]/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32] hover:border-[#e91e8c]/50'}`}>
                  {pkg.isPopular && (
                    <div className="absolute top-0 right-0 bg-[#e91e8c] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  {pkg.isBestValue && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                      Best Value
                    </div>
                  )}
                  {/* Coin Stack Visual */}
                  <div className="relative h-16 flex items-center justify-center mb-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${pkg.isBestValue ? 'bg-gradient-to-br from-amber-300 to-amber-500' : pkg.isPopular ? 'bg-gradient-to-br from-[#e91e8c]/20 to-[#e91e8c]/40' : 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/40'}`}>
                      <Coins className={`w-7 h-7 ${pkg.isBestValue ? 'text-white' : 'text-amber-500'}`} />
                    </div>
                    {pkg.bonus && (
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
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-[#e91e8c] bg-[#e91e8c]/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1e32] hover:border-[#e91e8c]/50'}`}>
                <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center text-lg`}>
                  {method.logo}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</span>
                {paymentMethod === method.id && (
                  <Check className="w-4 h-4 text-[#e91e8c] ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Secure payment. Your payment information is safe.</span>
        </div>

        {/* Purchase Button */}
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
              <button onClick={handlePurchase} disabled={purchasing}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2">
                {purchasing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : `Purchase for ${selectedPkg.currency} ${selectedPkg.price.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-8 text-center w-full max-w-xs animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Purchase Successful!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPkg?.coins.toLocaleString()}{selectedPkg?.bonus ? ` + ${selectedPkg.bonus} bonus` : ''} coins added to your wallet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
