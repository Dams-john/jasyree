-- ============================================================
-- JNovel Database Schema
-- Mobile-first premium novel reading platform
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  avatar            VARCHAR(500) NULL,
  role              ENUM('reader','author','admin') NOT NULL DEFAULT 'reader',
  coins             INT UNSIGNED NOT NULL DEFAULT 0,
  status            ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  google_id         VARCHAR(190) NULL,
  apple_id          VARCHAR(190) NULL,
  total_read_time   INT UNSIGNED NOT NULL DEFAULT 0, -- minutes
  books_read        INT UNSIGNED NOT NULL DEFAULT 0,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_google_id (google_id),
  INDEX idx_users_apple_id (apple_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pen names: one user (author/admin) can publish under multiple identities
CREATE TABLE pen_names (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL, -- owning account (you, initially)
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  bio         TEXT NULL,
  avatar      VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pen_names_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Readers following authors (pen names)
CREATE TABLE author_follows (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  pen_name_id  BIGINT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pen_name_id) REFERENCES pen_names(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_follow (user_id, pen_name_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE email_verifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ev_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_resets (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pr_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Refresh tokens for JWT auth (long-lived, rotatable, revocable)
CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  user_agent  VARCHAR(255) NULL,
  ip_address  VARCHAR(45) NULL,
  revoked     TINYINT(1) NOT NULL DEFAULT 0,
  expires_at  DATETIME NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_user (user_id),
  INDEX idx_rt_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CATALOG: GENRES, TAGS, NOVELS, CHAPTERS
-- ============================================================

CREATE TABLE genres (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(60) NOT NULL UNIQUE,
  slug        VARCHAR(70) NOT NULL UNIQUE,
  icon        VARCHAR(20) NULL,
  color       VARCHAR(20) NULL,
  cover       VARCHAR(500) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tags (
  id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(60) NOT NULL UNIQUE,
  slug   VARCHAR(70) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- The novel itself is a language-agnostic container: one story, one set of genres,
-- owned by one pen name. Everything language-specific (title, synopsis, cover,
-- status, chapters) lives in novel_translations / chapters below.
CREATE TABLE novels (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pen_name_id     BIGINT UNSIGNED NOT NULL,
  slug            VARCHAR(220) NOT NULL UNIQUE, -- internal/admin reference slug, language-agnostic
  is_featured     TINYINT(1) NOT NULL DEFAULT 0,
  rating_avg      DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count    INT UNSIGNED NOT NULL DEFAULT 0,
  views_count     BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pen_name_id) REFERENCES pen_names(id) ON DELETE CASCADE,
  INDEX idx_novels_updated (updated_at),
  INDEX idx_novels_views (views_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per language edition of a novel. This is what readers actually browse/read,
-- and what the admin manages independently per language (own title, own chapters,
-- own publish schedule, own ongoing/completed status).
CREATE TABLE novel_translations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  novel_id        BIGINT UNSIGNED NOT NULL,
  language        VARCHAR(10) NOT NULL, -- ISO code, e.g. 'en', 'fr', 'es'
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(220) NOT NULL UNIQUE, -- public-facing, per-language URL slug
  cover           VARCHAR(500) NULL,
  synopsis        TEXT NULL,
  status          ENUM('ongoing','completed','hiatus') NOT NULL DEFAULT 'ongoing',
  chapters_count  INT UNSIGNED NOT NULL DEFAULT 0,
  publish_status  ENUM('draft','published','unpublished') NOT NULL DEFAULT 'draft',
  published_at    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_novel_language (novel_id, language),
  INDEX idx_translations_publish_status (publish_status),
  INDEX idx_translations_language (language),
  FULLTEXT KEY ft_translations_search (title, synopsis)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE novel_genres (
  novel_id  BIGINT UNSIGNED NOT NULL,
  genre_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (novel_id, genre_id),
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE novel_tags (
  novel_id  BIGINT UNSIGNED NOT NULL,
  tag_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (novel_id, tag_id),
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chapters belong to a specific language edition (novel_translation), not the novel
-- directly. This is what lets English be on chapter 40 while French is on chapter 12,
-- each with their own publish schedule.
CREATE TABLE chapters (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  novel_translation_id BIGINT UNSIGNED NOT NULL,
  number              INT UNSIGNED NOT NULL,
  title               VARCHAR(200) NOT NULL,
  content             LONGTEXT NOT NULL,
  word_count          INT UNSIGNED NOT NULL DEFAULT 0,
  is_premium          TINYINT(1) NOT NULL DEFAULT 0,
  coin_cost           INT UNSIGNED NOT NULL DEFAULT 0,
  publish_status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at        DATETIME NULL, -- future date = scheduled publish; shown once NOW() passes this
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (novel_translation_id) REFERENCES novel_translations(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_translation_chapter_number (novel_translation_id, number),
  INDEX idx_chapters_translation (novel_translation_id),
  INDEX idx_chapters_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BANNERS (homepage slider)
-- ============================================================

CREATE TABLE banners (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image       VARCHAR(500) NOT NULL,
  title       VARCHAR(200) NULL,
  subtitle    VARCHAR(300) NULL,
  link_translation_id BIGINT UNSIGNED NULL,
  external_link VARCHAR(500) NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  starts_at   DATETIME NULL,
  ends_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_translation_id) REFERENCES novel_translations(id) ON DELETE SET NULL,
  INDEX idx_banners_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- READER ENGAGEMENT: bookmarks, favorites, reading progress
-- ============================================================

-- Bookmarks/favorites are language-agnostic — "I like this story", regardless of edition.
CREATE TABLE bookmarks (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  novel_id    BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_bookmark (user_id, novel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE favorites (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  novel_id    BIGINT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_favorite (user_id, novel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per user+translation: tracks "Continue Reading" progress for that language edition.
CREATE TABLE reading_progress (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  novel_translation_id BIGINT UNSIGNED NOT NULL,
  chapter_id      BIGINT UNSIGNED NOT NULL, -- last read chapter
  scroll_percent  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (novel_translation_id) REFERENCES novel_translations(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_progress (user_id, novel_translation_id),
  INDEX idx_progress_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Every chapter a user has fully read (drives isRead + booksRead stats)
CREATE TABLE chapter_reads (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  chapter_id  BIGINT UNSIGNED NOT NULL,
  read_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_chapter_read (user_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Premium chapter unlocks paid for with coins
CREATE TABLE chapter_unlocks (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  chapter_id    BIGINT UNSIGNED NOT NULL,
  coins_spent   INT UNSIGNED NOT NULL DEFAULT 0,
  unlocked_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_unlock (user_id, chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SOCIAL: comments, replies, likes
-- ============================================================

CREATE TABLE comments (
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

CREATE TABLE comment_replies (
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

CREATE TABLE comment_likes (
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

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
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

-- ============================================================
-- MONETIZATION: coins & subscriptions
-- ============================================================

CREATE TABLE coin_packages (
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

CREATE TABLE coin_transactions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  type          ENUM('purchase','spend','reward','refund') NOT NULL,
  description   VARCHAR(255) NOT NULL,
  amount        INT NOT NULL, -- positive for credit, negative for debit
  balance_after INT UNSIGNED NOT NULL,
  reference_type VARCHAR(50) NULL, -- e.g. 'chapter_unlock','coin_package','subscription_bonus'
  reference_id  BIGINT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_coin_tx_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_transactions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            ENUM('coin_package','subscription') NOT NULL,
  reference_id    INT UNSIGNED NOT NULL, -- coin_package.id or subscription_plans.id
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'NGN',
  provider        VARCHAR(50) NOT NULL DEFAULT 'paystack', -- paystack/flutterwave/stripe
  provider_ref    VARCHAR(190) NULL,
  status          ENUM('pending','successful','failed') NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pay_tx_user (user_id),
  INDEX idx_pay_tx_provider_ref (provider_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subscription_plans (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50) NOT NULL, -- Silver, Gold, Diamond
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

CREATE TABLE user_subscriptions (
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
