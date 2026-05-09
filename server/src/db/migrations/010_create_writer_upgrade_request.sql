-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010 — writer_upgrade_requests
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE writer_upgrade_requests (
  id              UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id       UUID                   NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,

  -- Application fields
  topics          TEXT[]                 NOT NULL DEFAULT '{}',
  motivation      TEXT                   NOT NULL,
  sample_title    VARCHAR(500)           NOT NULL,
  sample_body     TEXT                   NOT NULL,
  external_link   TEXT,

  status          upgrade_request_status NOT NULL DEFAULT 'pending',

  -- Review fields
  reviewed_by     UUID                   REFERENCES users(id) ON DELETE SET NULL,
  reviewer_note   TEXT,
  reviewed_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_upgrade_requests_user_id   ON writer_upgrade_requests (user_id);
CREATE INDEX idx_upgrade_requests_campus_id ON writer_upgrade_requests (campus_id);
CREATE INDEX idx_upgrade_requests_status    ON writer_upgrade_requests (status);