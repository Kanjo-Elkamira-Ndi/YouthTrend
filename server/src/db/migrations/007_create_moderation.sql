-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007 — reports & audit_logs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE reports (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id     UUID          NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,

  target_type   report_target NOT NULL,
  target_id     UUID          NOT NULL,            -- post.id or comment.id

  reason        report_reason NOT NULL,
  description   TEXT,                              -- optional extra detail from reporter
  status        report_status NOT NULL DEFAULT 'pending',

  -- Moderation fields
  actioned_by   UUID          REFERENCES users(id) ON DELETE SET NULL,
  moderator_note TEXT,
  escalated_to  UUID          REFERENCES users(id) ON DELETE SET NULL,  -- super admin who handled escalation

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actioned_at   TIMESTAMPTZ,

  -- Prevent the same user reporting the same target twice
  UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX idx_reports_campus_id    ON reports (campus_id);
CREATE INDEX idx_reports_status       ON reports (status);
CREATE INDEX idx_reports_target       ON reports (target_type, target_id);
CREATE INDEX idx_reports_reporter_id  ON reports (reporter_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Audit log — immutable record of every significant admin action
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID        NOT NULL REFERENCES users(id) ON DELETE SET NULL,  -- who did it
  actor_role   user_role   NOT NULL,
  action       TEXT        NOT NULL,   -- e.g. 'post.takedown', 'user.suspend', 'campus.create'
  target_type  TEXT,                   -- 'post' | 'user' | 'campus' | 'report' | 'platform'
  target_id    UUID,
  campus_id    UUID        REFERENCES campuses(id) ON DELETE SET NULL,
  meta         JSONB,                  -- any extra context (old values, new values, reason)
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id   ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_campus_id  ON audit_logs (campus_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_target     ON audit_logs (target_type, target_id);