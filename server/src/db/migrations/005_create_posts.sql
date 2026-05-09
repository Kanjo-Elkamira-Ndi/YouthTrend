-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — posts & post_tags
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE posts (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id       UUID            NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,

  title           VARCHAR(500)    NOT NULL,
  subtitle        VARCHAR(500),
  slug            TEXT            NOT NULL,                  -- campus_id + slug = unique
  body            TEXT            NOT NULL DEFAULT '',
  cover_url       TEXT,

  category        VARCHAR(100)    NOT NULL DEFAULT 'gist',
  status          post_status     NOT NULL DEFAULT 'draft',
  visibility      post_visibility NOT NULL DEFAULT 'campus_only',
  is_anonymous    BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Scheduling
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,

  -- Denormalised counters — kept in sync by triggers / service layer
  -- Avoids expensive COUNT(*) on hot read paths
  view_count      INTEGER         NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  clap_count      INTEGER         NOT NULL DEFAULT 0 CHECK (clap_count >= 0),
  comment_count   INTEGER         NOT NULL DEFAULT 0 CHECK (comment_count >= 0),

  is_pinned       BOOLEAN         NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- slug must be unique per campus
CREATE UNIQUE INDEX idx_posts_campus_slug ON posts (campus_id, slug);

CREATE INDEX idx_posts_author_id    ON posts (author_id);
CREATE INDEX idx_posts_campus_id    ON posts (campus_id);
CREATE INDEX idx_posts_status       ON posts (status);
CREATE INDEX idx_posts_visibility   ON posts (visibility);
CREATE INDEX idx_posts_published_at ON posts (published_at DESC);
CREATE INDEX idx_posts_category     ON posts (category);
CREATE INDEX idx_posts_scheduled_at ON posts (scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_posts_pinned       ON posts (campus_id, is_pinned) WHERE is_pinned = TRUE;

-- Full-text search on title + body
CREATE INDEX idx_posts_fts ON posts
  USING gin(to_tsvector('english', title || ' ' || COALESCE(body, '')));

-- ─────────────────────────────────────────────────────────────────────────────
-- Post tags (many-to-many via junction — no separate tags table for v1)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE post_tags (
  post_id   UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag       VARCHAR(80) NOT NULL,
  PRIMARY KEY (post_id, tag)
);

CREATE INDEX idx_post_tags_tag ON post_tags (tag);

-- ─────────────────────────────────────────────────────────────────────────────
-- Post edit history — light audit trail for changed posts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE post_edits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  editor_id   UUID        NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title_was   TEXT,
  body_was    TEXT,
  edited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_edits_post_id ON post_edits (post_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Post views — deduplicated per user per day
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE post_views (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,  -- NULL = guest
  ip_hash     TEXT,                                                  -- hashed IP for guest dedup
  viewed_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One view record per user per post per day
CREATE UNIQUE INDEX idx_post_views_user_day
  ON post_views (post_id, user_id, viewed_date)
  WHERE user_id IS NOT NULL;

-- Guest view dedup by IP hash per day
CREATE UNIQUE INDEX idx_post_views_ip_day
  ON post_views (post_id, ip_hash, viewed_date)
  WHERE user_id IS NULL AND ip_hash IS NOT NULL;

CREATE INDEX idx_post_views_post_id ON post_views (post_id);
CREATE INDEX idx_post_views_date    ON post_views (viewed_date);