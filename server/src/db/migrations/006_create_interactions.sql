-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006 — comments, claps, bookmarks, follows
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Comments ─────────────────────────────────────────────────────────────────

CREATE TABLE comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id   UUID        REFERENCES comments(id) ON DELETE CASCADE,  -- NULL = top-level

  body        TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  status      VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'deleted')),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id   ON comments (post_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);
CREATE INDEX idx_comments_parent_id ON comments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_status    ON comments (status);

-- ── Claps ────────────────────────────────────────────────────────────────────
-- One row per user per post — count tracks total claps (1–50)

CREATE TABLE claps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  count       SMALLINT    NOT NULL DEFAULT 1 CHECK (count BETWEEN 1 AND 50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_claps_post_id ON claps (post_id);
CREATE INDEX idx_claps_user_id ON claps (user_id);

-- ── Bookmarks ────────────────────────────────────────────────────────────────

CREATE TABLE bookmarks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks (post_id);

-- ── Follows ──────────────────────────────────────────────────────────────────

CREATE TABLE follows (
  follower_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)              -- cannot follow yourself
);

CREATE INDEX idx_follows_following_id ON follows (following_id);
CREATE INDEX idx_follows_follower_id  ON follows (follower_id);