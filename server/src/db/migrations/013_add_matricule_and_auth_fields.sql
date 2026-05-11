-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013 — Add matricule number to users + better-auth tables
--
-- Matricule is nullable — most campuses don't issue them digitally yet.
-- Better Auth manages its own session/account/verification tables via
-- its migrate CLI, but we create them here so everything is in one place
-- and DBeaver shows the full picture.
-- ─────────────────────────────────────────────────────────────────────────────

-- Add matricule column to existing users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS matricule VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_matricule
  ON users (matricule) WHERE matricule IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Better Auth internal tables
-- (better-auth will also create these via its own migrate CLI,
--  but we define them here for explicit schema ownership)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  email_verified  BOOLEAN     NOT NULL DEFAULT FALSE,
  image           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  id              TEXT        PRIMARY KEY,
  expires_at      TIMESTAMPTZ NOT NULL,
  token           TEXT        NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address      TEXT,
  user_agent      TEXT,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id                    TEXT  PRIMARY KEY,
  account_id            TEXT  NOT NULL,
  provider_id           TEXT  NOT NULL,
  user_id               TEXT  NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token          TEXT,
  refresh_token         TEXT,
  id_token              TEXT,
  access_token_expires_at  TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope                 TEXT,
  password              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id          TEXT        PRIMARY KEY,
  identifier  TEXT        NOT NULL,
  value       TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id    ON "session" (user_id);
CREATE INDEX IF NOT EXISTS idx_session_token      ON "session" (token);
CREATE INDEX IF NOT EXISTS idx_account_user_id    ON "account" (user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider   ON "account" (provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_verification_ident ON "verification" (identifier);

-- Link better-auth user to our application user
-- This allows us to query both tables together with a JOIN.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS better_auth_id TEXT UNIQUE
    REFERENCES "user"(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_better_auth_id
  ON users (better_auth_id) WHERE better_auth_id IS NOT NULL;