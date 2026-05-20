-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 015 — campus_join_requests + notification types
-- ─────────────────────────────────────────────────────────────────────────────

-- Add new notification types for campus join request flow
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'campus_join_approved';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'campus_join_declined';

-- Table for users requesting to join a campus
CREATE TABLE campus_join_requests (
  id              UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id       UUID                   NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,

  status          upgrade_request_status NOT NULL DEFAULT 'pending',

  -- Review fields
  reviewed_by     UUID                   REFERENCES users(id) ON DELETE SET NULL,
  reviewer_note   TEXT,
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campus_join_user_id   ON campus_join_requests (user_id);
CREATE INDEX idx_campus_join_campus_id ON campus_join_requests (campus_id);
CREATE INDEX idx_campus_join_status    ON campus_join_requests (status);

-- Ensure a user can only have one pending request at a time
CREATE UNIQUE INDEX idx_campus_join_user_pending
  ON campus_join_requests (user_id)
  WHERE status = 'pending';
