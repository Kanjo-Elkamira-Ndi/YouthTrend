-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011 — platform_settings (single-row config table)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE platform_settings (
  id                          INTEGER     PRIMARY KEY DEFAULT 1
    CHECK (id = 1),                        -- enforces exactly one row
  platform_name               VARCHAR(100) NOT NULL DEFAULT 'YouthTrend',
  platform_tagline            TEXT         NOT NULL DEFAULT 'Where Campus Gist Lives',
  logo_url                    TEXT,
  default_language            VARCHAR(5)   NOT NULL DEFAULT 'en',
  registration_mode           registration_mode NOT NULL DEFAULT 'open',
  require_campus_email        BOOLEAN      NOT NULL DEFAULT TRUE,
  email_verification_required BOOLEAN      NOT NULL DEFAULT TRUE,
  max_post_length_words       INTEGER      NOT NULL DEFAULT 10000,
  max_image_size_mb           INTEGER      NOT NULL DEFAULT 5,
  auto_profanity_filter       BOOLEAN      NOT NULL DEFAULT FALSE,
  maintenance_mode            BOOLEAN      NOT NULL DEFAULT FALSE,
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by                  UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- Insert the one and only row
INSERT INTO platform_settings (id) VALUES (1);