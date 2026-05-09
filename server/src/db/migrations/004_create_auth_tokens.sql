-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004 — email_verifications & password_resets
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE email_verifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at     TIMESTAMPTZ,                                    -- NULL = not yet consumed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verif_user_id ON email_verifications (user_id);
CREATE INDEX idx_email_verif_token   ON email_verifications (token);

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE password_resets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pw_reset_user_id ON password_resets (user_id);
CREATE INDEX idx_pw_reset_token   ON password_resets (token);

-- ─────────────────────────────────────────────────────────────────────────────
-- Refresh tokens — stored server-side for rotation / revocation
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,                    -- bcrypt hash of the raw token
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  revoked_at  TIMESTAMPTZ,                                    -- NULL = still valid
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);