-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — users table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id       UUID          REFERENCES campuses(id) ON DELETE SET NULL,

  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   TEXT          NOT NULL,
  full_name       VARCHAR(255)  NOT NULL,
  username        VARCHAR(100)  NOT NULL UNIQUE,               -- derived from name at registration
  role            user_role     NOT NULL DEFAULT 'reader',
  status          user_status   NOT NULL DEFAULT 'unverified',

  -- Profile
  avatar_url      TEXT,
  bio             TEXT,
  department      VARCHAR(255),
  year_of_study   SMALLINT      CHECK (year_of_study BETWEEN 1 AND 10),
  language_pref   VARCHAR(5)    NOT NULL DEFAULT 'en'          CHECK (language_pref IN ('en', 'fr')),

  -- Metadata
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Lookups
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_username   ON users (username);
CREATE INDEX idx_users_campus_id  ON users (campus_id);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_status     ON users (status);

-- Full-text search on name
CREATE INDEX idx_users_full_name  ON users USING gin(to_tsvector('english', full_name));