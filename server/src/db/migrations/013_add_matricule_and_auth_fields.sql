-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 013 — matricule + better_auth_id link column
--
-- Better Auth manages its OWN tables (user, session, account, verification)
-- via its CLI migrate command. We do NOT create those tables here.
-- This migration only adds YouthTrend-specific columns to our users table.
-- ─────────────────────────────────────────────────────────────────────────────

-- Matricule number — nullable, unique when set
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS matricule VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_matricule
  ON users (matricule) WHERE matricule IS NOT NULL;

-- Foreign key to Better Auth's "user" table
-- Allows JOIN between our users and Better Auth's session data
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS better_auth_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_better_auth_id
  ON users (better_auth_id) WHERE better_auth_id IS NOT NULL;