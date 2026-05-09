-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 — notifications
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,

  -- The user who triggered the notification (null for system notifications)
  actor_id     UUID              REFERENCES users(id) ON DELETE SET NULL,

  -- What the notification points to
  target_type  TEXT,             -- 'post' | 'comment' | 'user' | 'announcement'
  target_id    UUID,

  message      TEXT              NOT NULL,
  read         BOOLEAN           NOT NULL DEFAULT FALSE,

  created_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications (user_id);
CREATE INDEX idx_notifications_read       ON notifications (user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_type       ON notifications (type);