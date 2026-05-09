-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001 — Custom ENUM types
-- Must run before any table that references these types.
-- ─────────────────────────────────────────────────────────────────────────────

-- User roles across the platform
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'campus_admin',
  'moderator',
  'writer',
  'reader'
);

-- User account status
CREATE TYPE user_status AS ENUM (
  'unverified',   -- registered but email not yet confirmed
  'active',       -- normal active account
  'suspended',    -- suspended by campus admin (campus-scoped)
  'banned'        -- banned platform-wide by super admin
);

-- Post lifecycle status
CREATE TYPE post_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'taken_down'
);

-- Who can see a post
CREATE TYPE post_visibility AS ENUM (
  'public',         -- visible to all campuses
  'campus_only'     -- visible only to own campus members
);

-- What can be reported
CREATE TYPE report_target AS ENUM (
  'post',
  'comment'
);

-- Reason categories for reports
CREATE TYPE report_reason AS ENUM (
  'hate_speech',
  'misinformation',
  'spam',
  'explicit_content',
  'harassment',
  'other'
);

-- Report lifecycle
CREATE TYPE report_status AS ENUM (
  'pending',
  'taken_down',
  'dismissed',
  'escalated'     -- escalated from campus to super admin
);

-- Announcement audience
CREATE TYPE announcement_visibility AS ENUM (
  'all_students',
  'writers_only',
  'moderators_only'
);

-- Writer upgrade request lifecycle
CREATE TYPE upgrade_request_status AS ENUM (
  'pending',
  'approved',
  'declined'
);

-- Campus registration mode
CREATE TYPE registration_mode AS ENUM (
  'open',
  'invite_only',
  'closed'
);

-- Notification event types
CREATE TYPE notification_type AS ENUM (
  'clap',
  'comment',
  'comment_reply',
  'follow',
  'post_pinned',
  'post_taken_down',
  'post_approved',           -- post approved after pre-approval flow
  'campus_announcement',
  'writer_upgrade_approved',
  'writer_upgrade_declined',
  'system'
);