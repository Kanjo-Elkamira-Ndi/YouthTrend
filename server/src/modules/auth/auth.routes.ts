/**
 * Application-layer auth routes — /api/v1/auth/*
 *
 * Better Auth handles all credential/OAuth routes at /api/auth/*.
 * These are our application-layer additions:
 *
 *   GET   /api/v1/auth/session          lightweight session check
 *   GET   /api/v1/auth/me               full application user profile
 *   PATCH /api/v1/auth/me               update own profile
 *   POST  /api/v1/auth/provision        create app user after signup/OAuth
 *   POST  /api/v1/auth/assign-campus    join or change campus
 *   PATCH /api/v1/auth/language         update language preference
 *   GET   /api/v1/auth/profile/:username  public profile by username
 */

import { Router }          from 'express';
import { z }               from 'zod';
import { fromNodeHeaders } from 'better-auth/node';
import { auth }            from '../../config/auth';
import { query }           from '../../config/db';
import { AuthService }     from './auth.service';
import { requireAuth }     from './auth.middleware';
import { validate }        from '../../shared/utils/validate';
import { asyncHandler }    from '../../shared/utils/asyncHandler';
import {
  sendSuccess,
  sendCreated,
} from '../../shared/utils/response';
import {
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors/AppError';

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────

const provisionSchema = z.object({
  campusId: z.string().uuid('Must be a valid campus UUID').optional(),
});

const assignCampusSchema = z.object({
  campusId: z.string().uuid('Must be a valid campus UUID'),
});

const languageSchema = z.object({
  language: z.enum(['en', 'fr'], {
    error: 'Language must be "en" or "fr"',
  }),
});

const updateProfileSchema = z.object({
  fullName:    z.string().min(2, 'Name must be at least 2 characters').max(255).optional(),
  bio:         z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  department:  z.string().max(255).optional(),
  yearOfStudy: z
    .number({ error: 'Year of study must be a number' })
    .int()
    .min(1)
    .max(10)
    .optional(),
  avatarUrl:   z.string().url('Must be a valid URL').optional(),
  matricule:   z.string().max(50).optional(),
});

// ── GET /api/v1/auth/session ──────────────────────────────────────────────────
// Lightweight session check — called by the frontend on app load.
// Returns 200 + minimal user data if authenticated, 401 if not.

router.get('/session', asyncHandler(async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    throw new UnauthorizedError('No active session.');
  }

  const appUser = await AuthService.findByBetterAuthId(session.user.id);

  return sendSuccess(res, {
    authenticated:  true,
    emailVerified:  session.user.emailVerified,
    provisioned:    appUser !== null,
    betterAuthUser: {
      id:    session.user.id,
      email: session.user.email,
      name:  session.user.name,
    },
    user: appUser,
  });
}));

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
// Full application user profile with campus join.
// Also returns follower / following / post counts for the profile header.

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT
      u.id,             u.email,          u.full_name,
      u.username,       u.role,           u.status,
      u.avatar_url,     u.bio,            u.department,
      u.year_of_study,  u.language_pref,  u.matricule,
      u.created_at,     u.last_active_at,
      c.id         AS campus_id,
      c.name       AS campus_name,
      c.short_code AS campus_short_code,
      c.slug       AS campus_slug,
      -- counts
      (SELECT COUNT(*) FROM posts
       WHERE author_id = u.id AND status = 'published')::int   AS post_count,
      (SELECT COUNT(*) FROM follows
       WHERE following_id = u.id)::int                         AS follower_count,
      (SELECT COUNT(*) FROM follows
       WHERE follower_id  = u.id)::int                         AS following_count,
      (SELECT COALESCE(SUM(count), 0) FROM claps
       JOIN posts ON posts.id = claps.post_id
       WHERE posts.author_id = u.id)::int                      AS total_claps_received
    FROM   users u
    LEFT   JOIN campuses c ON c.id = u.campus_id
    WHERE  u.id = $1
    LIMIT  1
  `, [req.user!.id]);

  if (!rows[0]) throw new NotFoundError('User');

  AuthService.touchActivity(req.user!.id).catch(() => {});

  return sendSuccess(res, rows[0]);
}));

// ── PATCH /api/v1/auth/me ─────────────────────────────────────────────────────
// Update own profile (name, bio, department, year, avatar, matricule).
// Does NOT allow changing email, password, or role.

router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const updated = await AuthService.updateProfile(
      req.user!.id,
      req.body,
    );
    return sendSuccess(res, updated);
  }),
);

// ── POST /api/v1/auth/provision ───────────────────────────────────────────────
// Creates the application users row after Better Auth signup or OAuth login.
// The frontend MUST call this immediately after the Better Auth flow completes.
// Idempotent — returns the existing row if already provisioned.

router.post(
  '/provision',
  validate(provisionSchema),
  asyncHandler(async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      throw new UnauthorizedError('Must be signed in to provision an account.');
    }

    const appUser = await AuthService.provisionUser({
      betterAuthId: session.user.id,
      email:        session.user.email,
      fullName:     session.user.name,
      campusId:     req.body.campusId,
      avatarUrl:    session.user.image ?? undefined,
    });

    return sendCreated(res, appUser);
  }),
);

// ── POST /api/v1/auth/assign-campus ──────────────────────────────────────────
// Join or change campus after signup.

router.post(
  '/assign-campus',
  requireAuth,
  validate(assignCampusSchema),
  asyncHandler(async (req, res) => {
    await AuthService.assignCampus(req.user!.id, req.body.campusId);
    return sendSuccess(res, {
      message:  'Campus assigned successfully.',
      campusId: req.body.campusId,
    });
  }),
);

// ── PATCH /api/v1/auth/language ───────────────────────────────────────────────
// Update language preference (en / fr).

router.patch(
  '/language',
  requireAuth,
  validate(languageSchema),
  asyncHandler(async (req, res) => {
    await AuthService.setLanguage(req.user!.id, req.body.language);
    return sendSuccess(res, {
      message:  'Language preference updated.',
      language: req.body.language,
    });
  }),
);

// ── GET /api/v1/auth/profile/:username ───────────────────────────────────────
// Public profile view by username.
// Returns published post counts, follower/following counts, and whether the
// requesting user is following this profile (if authenticated).

router.get(
  '/profile/:username',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT
        u.id,            u.full_name,     u.username,
        u.role,          u.avatar_url,    u.bio,
        u.department,    u.year_of_study, u.created_at,
        c.id         AS campus_id,
        c.name       AS campus_name,
        c.short_code AS campus_short_code,
        -- public counts
        (SELECT COUNT(*) FROM posts
         WHERE author_id = u.id AND status = 'published')::int  AS post_count,
        (SELECT COUNT(*) FROM follows
         WHERE following_id = u.id)::int                        AS follower_count,
        (SELECT COUNT(*) FROM follows
         WHERE follower_id  = u.id)::int                        AS following_count,
        (SELECT COALESCE(SUM(count), 0) FROM claps
         JOIN posts ON posts.id = claps.post_id
         WHERE posts.author_id = u.id)::int                     AS total_claps_received
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  u.username = $1
        AND  u.status   = 'active'
      LIMIT  1
    `, [req.params.username]);

    if (!rows[0]) throw new NotFoundError('User');

    // Check if the requesting user follows this profile
    let isFollowing = false;
    if (req.user) {
      const { rows: followRows } = await query(
        `SELECT 1 FROM follows
         WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
        [req.user.id, rows[0].id],
      );
      isFollowing = followRows.length > 0;
    }

    return sendSuccess(res, { ...rows[0], isFollowing });
  }),
);

export default router;