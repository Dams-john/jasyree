-- ============================================================
-- Sample content for local testing/dev only.
-- Demonstrates the multi-language structure: one novel, two language editions.
-- DO NOT run in production.
-- ============================================================

INSERT INTO users (name, email, password_hash, role, email_verified_at) VALUES
('JNovel Admin', 'admin@jnovel.app', '$2y$10$abcdefghijklmnopqrstuvKPOu5oCzLZ5tZ5tZ5tZ5tZ5tZ5tZ5tO', 'admin', NOW());

SET @admin_id = LAST_INSERT_ID();

INSERT INTO pen_names (user_id, name, slug) VALUES
(@admin_id, 'Temijasire', 'temijasire'),
(@admin_id, 'Jaden Blake', 'jaden-blake');

SET @pn1 = (SELECT id FROM pen_names WHERE slug = 'temijasire');
SET @pn2 = (SELECT id FROM pen_names WHERE slug = 'jaden-blake');

-- Novel 1: "Use Me, Alpha Kaine" — published in English AND French
INSERT INTO novels (pen_name_id, slug, is_featured, rating_avg, rating_count, views_count) VALUES
(@pn1, 'use-me-alpha-kaine', 1, 4.8, 12400, 124500);
SET @novel1 = LAST_INSERT_ID();

INSERT INTO novel_translations (novel_id, language, title, slug, cover, synopsis, status, chapters_count, publish_status, published_at, updated_at) VALUES
(@novel1, 'en', 'Use Me, Alpha Kaine', 'use-me-alpha-kaine',
  'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400',
  'The daughter of a rogue. The one no one wanted. Dealt and discarded. He was never meant to love her.',
  'ongoing', 12, 'published', '2024-01-15 00:00:00', NOW()),
(@novel1, 'fr', 'Utilise-moi, Alpha Kaine', 'utilise-moi-alpha-kaine',
  'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400',
  'La fille d''un solitaire. Celle que personne ne voulait. Vendue et abandonnee.',
  'ongoing', 5, 'published', '2024-03-01 00:00:00', DATE_SUB(NOW(), INTERVAL 2 DAY));

SET @novel1_en = (SELECT id FROM novel_translations WHERE slug = 'use-me-alpha-kaine');
SET @novel1_fr = (SELECT id FROM novel_translations WHERE slug = 'utilise-moi-alpha-kaine');

-- Novel 2: "Bound to the Ruthless Alpha" — English only for now
INSERT INTO novels (pen_name_id, slug, is_featured, rating_avg, rating_count, views_count) VALUES
(@pn2, 'bound-to-the-ruthless-alpha', 1, 4.6, 8900, 98200);
SET @novel2 = LAST_INSERT_ID();

INSERT INTO novel_translations (novel_id, language, title, slug, cover, synopsis, status, chapters_count, publish_status, published_at, updated_at) VALUES
(@novel2, 'en', 'Bound to the Ruthless Alpha', 'bound-to-the-ruthless-alpha',
  'https://images.pexels.com/photos/3932839/pexels-photo-3932839.jpeg?auto=compress&cs=tinysrgb&w=400',
  'She never wanted a mate. He never expected to find one.',
  'ongoing', 3, 'published', '2024-01-10 00:00:00', DATE_SUB(NOW(), INTERVAL 1 DAY));

SET @novel2_en = (SELECT id FROM novel_translations WHERE slug = 'bound-to-the-ruthless-alpha');

-- Genres/tags attach to the novel (language-agnostic)
INSERT INTO novel_genres (novel_id, genre_id) SELECT @novel1, id FROM genres WHERE slug IN ('werewolf','romance','billionaire','drama');
INSERT INTO novel_genres (novel_id, genre_id) SELECT @novel2, id FROM genres WHERE slug IN ('werewolf','romance','fantasy');

INSERT INTO tags (name, slug) VALUES
('Alpha','alpha'), ('Forbidden Love','forbidden-love'), ('Pack Drama','pack-drama'), ('Strong FL','strong-fl'),
('Mate Bond','mate-bond'), ('Pack Life','pack-life');

INSERT INTO novel_tags (novel_id, tag_id) SELECT @novel1, id FROM tags WHERE slug IN ('alpha','forbidden-love','pack-drama','strong-fl');
INSERT INTO novel_tags (novel_id, tag_id) SELECT @novel2, id FROM tags WHERE slug IN ('mate-bond','alpha','pack-life');

-- Chapters for the ENGLISH edition of novel 1 (12 chapters, last 5 premium)
INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at) VALUES
(@novel1_en, 1, 'The Beginning', 'Kaine''s eyes never left hers...', 2100, 0, 0, 'published', '2024-01-15'),
(@novel1_en, 2, 'First Encounter', 'Sample chapter content...', 2300, 0, 0, 'published', '2024-01-18'),
(@novel1_en, 3, 'The Pack', 'Sample chapter content...', 1900, 0, 0, 'published', '2024-01-22'),
(@novel1_en, 4, 'Shadows and Lies', 'Sample chapter content...', 2500, 0, 0, 'published', '2024-02-01'),
(@novel1_en, 5, 'The Alpha''s Challenge', 'Sample chapter content...', 2200, 0, 0, 'published', '2024-02-08'),
(@novel1_en, 6, 'Hidden Truth', 'Sample chapter content...', 2400, 0, 0, 'published', '2024-02-15'),
(@novel1_en, 7, 'Dangerous Games', 'Sample chapter content...', 2100, 0, 0, 'published', '2024-02-22'),
(@novel1_en, 8, 'Shattered Trust', 'Sample chapter content...', 2600, 1, 2, 'published', '2024-03-01'),
(@novel1_en, 9, 'Secrets on Fire', 'Sample chapter content...', 2300, 1, 2, 'published', '2024-03-08'),
(@novel1_en, 10, 'Bound by Pain', 'Sample chapter content...', 2800, 1, 2, 'published', '2024-03-15'),
(@novel1_en, 11, 'Dangerous Truths', 'Sample chapter content...', 2200, 1, 2, 'published', '2024-04-10'),
(@novel1_en, 12, 'The Reveal', 'Sample chapter content...', 3100, 1, 2, 'published', '2024-05-12');

-- Chapters for the FRENCH edition of the SAME novel — independent numbering/schedule, lagging behind English
INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at) VALUES
(@novel1_fr, 1, 'Le Debut', 'Contenu de chapitre exemple...', 2050, 0, 0, 'published', '2024-03-01'),
(@novel1_fr, 2, 'Premiere Rencontre', 'Contenu de chapitre exemple...', 2250, 0, 0, 'published', '2024-03-08'),
(@novel1_fr, 3, 'La Meute', 'Contenu de chapitre exemple...', 1850, 0, 0, 'published', '2024-03-15'),
(@novel1_fr, 4, 'Ombres et Mensonges', 'Contenu de chapitre exemple...', 2450, 0, 0, 'published', '2024-03-22'),
(@novel1_fr, 5, 'Le Defi de l''Alpha', 'Contenu de chapitre exemple...', 2150, 1, 2, 'published', '2024-04-01');

-- Chapters for novel 2 (English)
INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at) VALUES
(@novel2_en, 1, 'Unwanted Bond', 'Sample chapter content...', 2200, 0, 0, 'published', '2024-01-10'),
(@novel2_en, 2, 'The Rejection', 'Sample chapter content...', 2400, 0, 0, 'published', '2024-01-17'),
(@novel2_en, 3, 'Second Chances', 'Sample chapter content...', 2100, 0, 0, 'published', '2024-01-24');

-- A chapter SCHEDULED for the future — won't show publicly until this date passes.
-- Demonstrates the "publish different chapter schedules" requirement.
INSERT INTO chapters (novel_translation_id, number, title, content, word_count, is_premium, coin_cost, publish_status, published_at) VALUES
(@novel2_en, 4, 'What Comes Next', 'Scheduled chapter content...', 2300, 0, 0, 'published', DATE_ADD(NOW(), INTERVAL 3 DAY));

INSERT INTO banners (image, title, subtitle, link_translation_id, sort_order) VALUES
('https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=800', 'Use Me, Alpha Kaine', 'The forbidden bond begins', @novel1_en, 1);
