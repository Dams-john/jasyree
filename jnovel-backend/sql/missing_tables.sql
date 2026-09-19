-- ============================================================
-- PATCH: Missing tables from schema.sql
-- Run this in phpMyAdmin or MySQL CLI against the jnovel database.
-- Uses IF NOT EXISTS so it's safe to run even if some tables exist.
-- ============================================================

USE jnovel;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS novel_likes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  novel_id    BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_like (user_id, novel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reading_progress (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  novel_translation_id BIGINT UNSIGNED NOT NULL,
  chapter_id      BIGINT UNSIGNED NOT NULL,
  scroll_percent  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_translation_id) REFERENCES novel_translations(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_progress (user_id, novel_translation_id),
  INDEX idx_progress_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chapter_reads (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  chapter_id  BIGINT UNSIGNED NOT NULL,
  read_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_chapter_read (user_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chapter_unlocks (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  chapter_id    BIGINT UNSIGNED NOT NULL,
  coins_spent   INT UNSIGNED NOT NULL DEFAULT 0,
  unlocked_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_unlock (user_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  novel_id      BIGINT UNSIGNED NOT NULL,
  chapter_id    BIGINT UNSIGNED NULL,
  content       TEXT NOT NULL,
  likes_count   INT UNSIGNED NOT NULL DEFAULT 0,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
  INDEX idx_comments_novel (novel_id),
  INDEX idx_comments_chapter (chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comment_replies (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  comment_id    BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  content       TEXT NOT NULL,
  likes_count   INT UNSIGNED NOT NULL DEFAULT 0,
  is_deleted    TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_replies_comment (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comment_likes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  comment_id  BIGINT UNSIGNED NULL,
  reply_id    BIGINT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (reply_id) REFERENCES comment_replies(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_like_comment (user_id, comment_id),
  UNIQUE KEY uniq_like_reply (user_id, reply_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('chapter','reward','system','promo','comment') NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     VARCHAR(500) NOT NULL,
  novel_id    BIGINT UNSIGNED NULL,
  avatar      VARCHAR(500) NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE SET NULL,
  INDEX idx_notif_user (user_id, is_read),
  INDEX idx_notif_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coin_packages (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coins         INT UNSIGNED NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(10) NOT NULL DEFAULT 'NGN',
  bonus         INT UNSIGNED NOT NULL DEFAULT 0,
  is_popular    TINYINT(1) NOT NULL DEFAULT 0,
  is_best_value TINYINT(1) NOT NULL DEFAULT 0,
  image         VARCHAR(500) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  sort_order    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coin_transactions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  type          ENUM('purchase','spend','reward','refund') NOT NULL,
  description   VARCHAR(255) NOT NULL,
  amount        INT NOT NULL,
  balance_after INT UNSIGNED NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id  BIGINT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_coin_tx_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            ENUM('coin_package','subscription') NOT NULL,
  reference_id    INT UNSIGNED NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'NGN',
  provider        VARCHAR(50) NOT NULL DEFAULT 'paystack',
  provider_ref    VARCHAR(190) NULL,
  status          ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pay_tx_user (user_id),
  INDEX idx_pay_tx_provider_ref (provider_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50) NOT NULL,
  slug          VARCHAR(50) NOT NULL UNIQUE,
  price         DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(10) NOT NULL DEFAULT 'NGN',
  period        VARCHAR(20) NOT NULL DEFAULT 'monthly',
  monthly_coins INT UNSIGNED NOT NULL DEFAULT 0,
  features      JSON NULL,
  color         VARCHAR(20) NULL,
  is_popular    TINYINT(1) NOT NULL DEFAULT 0,
  is_best_value TINYINT(1) NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  sort_order    INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  plan_id             INT UNSIGNED NOT NULL,
  status              ENUM('active','cancelled','expired') NOT NULL DEFAULT 'active',
  started_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end  DATETIME NOT NULL,
  cancelled_at        DATETIME NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  INDEX idx_user_sub_user (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

