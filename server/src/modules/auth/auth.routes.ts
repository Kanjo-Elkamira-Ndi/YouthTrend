/**
 * YouthTrend application-layer auth routes.
 *
 * Better Auth handles all credential / OAuth routes at /api/auth/*.
 * These routes are our OWN additions on top of Better Auth:
 *
 *   POST /api/v1/auth/provision   — called after OAuth signup to create app user
 *   POST /api/v1/auth/assign-campus — set campus after signup
 *   GET  /api/v1/auth/me          — return the full application user profile
 *   GET  /api/v1/auth/session     — lightweight session check
 */

import { Router }          from 'express';
import { z }               from 'zod';
import { auth }            from '../../config/auth';
import { fromNodeHeaders } from 'better-auth/node';
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
  campusId:  z.string().uuid().optional(),
});

const assignCampusSchema = z.object({
  campusId: z.string().uuid('Must be a valid campus ID'),
});

// ── GET /api/v1/auth/session ──────────────────────────────────────────────────
// Quick session check — returns 200 + user if authenticated, 401 if not.
// The frontend calls this on app load to restore session state.

router.get('/session', asyncHandler(async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    throw new UnauthorizedError('No active session.');
  }

  const appUser = await AuthService.findByBetterAuthId(session.user.id);

  return sendSuccess(res, {
    betterAuthUser: {
      id:            session.user.id,
      email:         session.user.email,
      emailVerified: session.user.emailVerified,
    },
    user: appUser ?? null,
  });
}));

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
// Returns the full application user profile for the authenticated session.

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await (await import('../../config/db')).query(`
    SELECT
      u.id, u.email, u.full_name, u.username, u.role, u.status,
      u.avatar_url, u.bio, u.department, u.year_of_study,
      u.language_pref, u.matricule, u.created_at, u.last_active_at,
      c.id        AS campus_id,
      c.name      AS campus_name,
      c.short_code AS campus_short_code,
      c.slug      AS campus_slug
    FROM users u
    LEFT JOIN campuses c ON c.id = u.campus_id
    WHERE u.id = $1
    LIMIT 1
  `, [req.user!.id]);

  if (!rows[0]) throw new NotFoundError('User');

  // Update last_active_at
  await (await import('../../config/db')).query(
    'UPDATE users SET last_active_at = NOW() WHERE id = $1',
    [req.user!.id],
  );

  return sendSuccess(res, rows[0]);
}));

// ── POST /api/v1/auth/provision ───────────────────────────────────────────────
// Called after Better Auth creates a user (signup / first OAuth login).
// Creates the application users row.
// The frontend calls this immediately after the Better Auth signup/OAuth flow.

router.post(
  '/provision',
  validate(provisionSchema),
  asyncHandler(async (req, res) => {
    // Read the Better Auth session to get the authenticated user
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
// Allows a user to join a campus after signup (or change campus — v1 allows this).

router.post(
  '/assign-campus',
  requireAuth,
  validate(assignCampusSchema),
  asyncHandler(async (req, res) => {
    await AuthService.assignCampus(req.user!.id, req.body.campusId);
    return sendSuccess(res, { message: 'Campus assigned successfully.' });
  }),
);

export default router;