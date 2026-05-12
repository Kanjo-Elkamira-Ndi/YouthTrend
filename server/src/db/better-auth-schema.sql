-- ─────────────────────────────────────────────────────────────────────────────
-- Better Auth Tables — run this in DBeaver if the CLI migrate doesn't work
--
-- These use camelCase column names exactly as Better Auth's Kysely adapter
-- expects. Do NOT rename these columns to snake_case.
--
-- Run AFTER your main migrations (001–013).
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "user" (
  "id"            TEXT        PRIMARY KEY,
  "name"          TEXT        NOT NULL,
  "email"         TEXT        NOT NULL UNIQUE,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
  "image"         TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- YouthTrend additional fields (set via betterAuth additionalFields config)
  "campusId"      TEXT,
  "ytRole"        TEXT        NOT NULL DEFAULT 'reader'
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"          TEXT        PRIMARY KEY,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  "token"       TEXT        NOT NULL UNIQUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "userId"      TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                     TEXT PRIMARY KEY,
  "accountId"              TEXT NOT NULL,
  "providerId"             TEXT NOT NULL,
  "userId"                 TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken"            TEXT,
  "refreshToken"           TEXT,
  "idToken"                TEXT,
  "accessTokenExpiresAt"   TIMESTAMPTZ,
  "refreshTokenExpiresAt"  TIMESTAMPTZ,
  "scope"                  TEXT,
  "password"               TEXT,
  "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"          TEXT        PRIMARY KEY,
  "identifier"  TEXT        NOT NULL,
  "value"       TEXT        NOT NULL,
  "expiresAt"   TIMESTAMPTZ NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS "session_userId_idx"     ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "session_token_idx"      ON "session" ("token");
CREATE INDEX IF NOT EXISTS "account_userId_idx"     ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "account_provider_idx"   ON "account" ("providerId", "accountId");
CREATE INDEX IF NOT EXISTS "verification_ident_idx" ON "verification" ("identifier");