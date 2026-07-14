export interface CoinPackage {
  id: number;
  coins: number;
  price: number;
  currency: string;
  bonus?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  image: string;
}

export interface Transaction {
  id: number;
  type: 'purchase' | 'spend' | 'reward' | 'refund';
  description: string;
  amount: number;
  date: string;
  balance: number;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 1, coins: 1000, price: 1500, currency: 'NGN', image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 2, coins: 2500, price: 3500, currency: 'NGN', bonus: 200, isPopular: true, image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 3, coins: 5500, price: 7000, currency: 'NGN', bonus: 500, image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 4, coins: 12000, price: 15000, currency: 'NGN', bonus: 2000, image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 5, coins: 25000, price: 28000, currency: 'NGN', bonus: 5000, isBestValue: true, image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 6, coins: 50000, price: 50000, currency: 'NGN', bonus: 15000, image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'purchase', description: 'Purchased 2,500 Coins', amount: 2500, date: '2024-05-10', balance: 2450 },
  { id: 2, type: 'spend', description: 'Unlocked Chapter 12 - Use Me, Alpha Kaine', amount: -2, date: '2024-05-10', balance: 2498 },
  { id: 3, type: 'reward', description: 'Daily Login Reward - Day 5', amount: 50, date: '2024-05-09', balance: 2500 },
  { id: 4, type: 'spend', description: 'Unlocked Chapter 11 - Use Me, Alpha Kaine', amount: -2, date: '2024-05-08', balance: 2450 },
  { id: 5, type: 'spend', description: 'Unlocked Chapter 10 - Use Me, Alpha Kaine', amount: -2, date: '2024-05-07', balance: 2452 },
  { id: 6, type: 'reward', description: 'Reading Reward - 30 minutes', amount: 20, date: '2024-05-07', balance: 2454 },
  { id: 7, type: 'purchase', description: 'Purchased 1,000 Coins', amount: 1000, date: '2024-05-01', balance: 2434 },
  { id: 8, type: 'reward', description: 'Referral Bonus - WolfHeart joined', amount: 100, date: '2024-04-28', balance: 1434 },
];

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
  color: string;
  monthlyCoins?: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Silver',
    price: 2500,
    currency: 'NGN',
    period: '/month',
    color: '#9ca3af',
    features: [
      'Unlimited Reading',
      'Standard Experience',
      '50 Coins Monthly',
      'Cancel Anytime',
    ],
  },
  {
    id: 2,
    name: 'Gold',
    price: 5000,
    currency: 'NGN',
    period: '/month',
    color: '#f59e0b',
    isPopular: true,
    isBestValue: true,
    monthlyCoins: 200,
    features: [
      'Unlimited Reading',
      'Ad-free Reading',
      '200 Coins Monthly',
      'Exclusive Content',
      'Early Chapter Access',
      'Cancel Anytime',
    ],
  },
  {
    id: 3,
    name: 'Diamond',
    price: 10000,
    currency: 'NGN',
    period: '/month',
    color: '#60a5fa',
    monthlyCoins: 500,
    features: [
      'Unlimited Reading',
      'Ad-free Reading',
      '500 Coins Monthly',
      'Exclusive Content',
      'Early Chapter Access',
      'Priority Support',
      'Cancel Anytime',
    ],
  },
];
