-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 014 — add meta JSONB column to notifications table
--
-- Stores contextual metadata like { postSlug, campusSlug } so the frontend
-- can navigate to the correct target URL without an extra query.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS meta JSONB;

CREATE INDEX IF NOT EXISTS idx_notifications_meta
  ON notifications USING gin (meta);
