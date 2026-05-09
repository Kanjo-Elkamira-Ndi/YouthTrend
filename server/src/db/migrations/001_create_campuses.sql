-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — campuses table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE campuses (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255)  NOT NULL,
  slug                VARCHAR(100)  NOT NULL UNIQUE,          -- url-safe identifier e.g. "uy1"
  short_code          VARCHAR(10)   NOT NULL UNIQUE,          -- e.g. "UY1"
  description         TEXT,
  logo_url            TEXT,
  cover_url           TEXT,
  allowed_domains     TEXT[]        NOT NULL DEFAULT '{}',    -- e.g. ARRAY['uy1.cm','uniyaounde1.cm']
  status              VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Flexible settings stored as JSONB so Campus Admin can toggle them
  -- without schema changes. Keys defined in src/shared/types/campus.ts.
  settings            JSONB         NOT NULL DEFAULT '{
    "registrationMode":       "open",
    "postApprovalRequired":   false,
    "anonymousPostingEnabled": false,
    "autoApproveWriters":     false,
    "moderationSlaHours":     24
  }'::jsonb,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Full-text search on campus name / description
CREATE INDEX idx_campuses_name ON campuses USING gin(to_tsvector('english', name));
CREATE INDEX idx_campuses_status ON campuses (status);