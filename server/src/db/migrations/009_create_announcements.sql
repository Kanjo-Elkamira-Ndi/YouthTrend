-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009 — announcements
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE announcements (
  id           UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id    UUID                    NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  author_id    UUID                    NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  title        VARCHAR(500)            NOT NULL,
  body         TEXT                    NOT NULL,
  visibility   announcement_visibility NOT NULL DEFAULT 'all_students',

  is_pinned    BOOLEAN                 NOT NULL DEFAULT FALSE,
  view_count   INTEGER                 NOT NULL DEFAULT 0,

  published_at TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

-- Max 5 pinned per campus enforced at the service layer
CREATE INDEX idx_announcements_campus_id    ON announcements (campus_id);
CREATE INDEX idx_announcements_published_at ON announcements (campus_id, published_at DESC);
CREATE INDEX idx_announcements_pinned       ON announcements (campus_id, is_pinned) WHERE is_pinned = TRUE;