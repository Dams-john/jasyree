-- ============================================================
-- JNovel Seed Data — matches the frontend mock data 1:1
-- Run after schema.sql
-- ============================================================

INSERT INTO genres (name, slug, icon, color, cover) VALUES
('Werewolf', 'werewolf', '🐺', '#6366f1', 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Romance', 'romance', '💕', '#e91e8c', 'https://images.pexels.com/photos/3932839/pexels-photo-3932839.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Fantasy', 'fantasy', '✨', '#f59e0b', 'https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Billionaire', 'billionaire', '💼', '#10b981', 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Drama', 'drama', '🎭', '#ef4444', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Mystery', 'mystery', '🔍', '#8b5cf6', 'https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Thriller', 'thriller', '⚡', '#f97316', 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Vampire', 'vampire', '🧛', '#dc2626', 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Contemporary', 'contemporary', '🌆', '#0ea5e9', 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Dark Romance', 'dark-romance', '🖤', '#374151', 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Suspense', 'suspense', '😱', '#7c3aed', 'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=400'),
('Dragon', 'dragon', '🐉', '#d97706', 'https://images.pexels.com/photos/3617501/pexels-photo-3617501.jpeg?auto=compress&cs=tinysrgb&w=400');

INSERT INTO coin_packages (coins, price, currency, bonus, is_popular, is_best_value, image, sort_order) VALUES
(1000, 1500, 'NGN', 0, 0, 0, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 1),
(2500, 3500, 'NGN', 200, 1, 0, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 2),
(5500, 7000, 'NGN', 500, 0, 0, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 3),
(12000, 15000, 'NGN', 2000, 0, 0, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 4),
(25000, 28000, 'NGN', 5000, 0, 1, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 5),
(50000, 50000, 'NGN', 15000, 0, 0, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200', 6);

INSERT INTO subscription_plans (name, slug, price, currency, period, monthly_coins, features, color, is_popular, is_best_value, sort_order) VALUES
('Silver', 'silver', 2500, 'NGN', 'monthly', 50,
  JSON_ARRAY('Unlimited Reading','Standard Experience','50 Coins Monthly','Cancel Anytime'),
  '#9ca3af', 0, 0, 1),
('Gold', 'gold', 5000, 'NGN', 'monthly', 200,
  JSON_ARRAY('Unlimited Reading','Ad-free Reading','200 Coins Monthly','Exclusive Content','Early Chapter Access','Cancel Anytime'),
  '#f59e0b', 1, 1, 2),
('Diamond', 'diamond', 10000, 'NGN', 'monthly', 500,
  JSON_ARRAY('Unlimited Reading','Ad-free Reading','500 Coins Monthly','Exclusive Content','Early Chapter Access','Priority Support','Cancel Anytime'),
  '#60a5fa', 0, 0, 3);
