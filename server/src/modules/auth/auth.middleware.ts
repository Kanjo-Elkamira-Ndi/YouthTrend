/**
 * Auth middleware for YouthTrend.
 *
 * Uses Better Auth sessions (cookie or Bearer token) to identify the caller,
 * then enriches req.user with our application user record from the users table.
 *
 * Two middleware functions:
 *   requireAuth    — 401 if no valid session
 *   requireRole    — 403 if the session user doesn't have an allowed role
 */

import { Request, Response, NextFunction } from 'express';
import { auth }            from '../../config/auth';
import { query }           from '../../config/db';
import { fromNodeHeaders } from 'better-auth/node';
import {
  UnauthorizedError,
  ForbiddenError,
} from '../../shared/errors/AppError';
import { UserRole } from '../../shared/types/express';

// ── Row type returned from our users table ────────────────────────────────────

interface UserRow {
  id:        string;
  email:     string;
  role:      UserRole;
  status:    string;
  campus_id: string | null;
  full_name: string;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

/**
 * Validates the Better Auth session (cookie or Authorization: Bearer <token>).
 * On success, attaches req.user with the application user record.
 * On failure, calls next(UnauthorizedError).
 */
export async function requireAuth(
  req:  Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Better Auth validates the session from cookies or Bearer header
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return next(new UnauthorizedError('Authentication required. Please sign in.'));
    }

    // Fetch our application user record linked to the Better Auth user
    const { rows } = await query<UserRow>(
      `SELECT u.id, u.email, u.role, u.status, u.campus_id, u.full_name
       FROM users u
       WHERE u.better_auth_id = $1
       LIMIT 1`,
      [session.user.id],
    );

    if (!rows[0]) {
      // Better Auth user exists but no application user row yet—
      // this happens if the after-signup hook hasn't run.
      return next(new UnauthorizedError('User account not fully set up. Please contact support.'));
    }

    const user = rows[0];

    // Check account status
    if (user.status === 'banned') {
      return next(new ForbiddenError('Your account has been banned from the platform.'));
    }
    if (user.status === 'suspended') {
      return next(new ForbiddenError('Your account has been suspended. Contact your Campus Admin.'));
    }

    // Attach to request
    req.user = {
      id:       user.id,
      email:    user.email,
      role:     user.role,
      status:   user.status as 'active' | 'suspended' | 'banned' | 'unverified',
      campusId: user.campus_id,
      fullName: user.full_name,
    };

    next();
  } catch (err) {
    next(err);
  }
}

// ── requireRole ───────────────────────────────────────────────────────────────

/**
 * Role-based access control middleware.
 * Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.delete('/post/:id', requireAuth, requireRole('campus_admin', 'super_admin'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of the following roles: ${roles.join(', ')}.`,
        ),
      );
    }
    next();
  };
}

// ── requireSameCampus ─────────────────────────────────────────────────────────

/**
 * Ensures the authenticated user belongs to the campus identified by
 * req.params.campusId (or req.body.campusId).
 * Super Admins bypass this check.
 *
 * Must be used AFTER requireAuth.
 */
export function requireSameCampus(
  req:  Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) return next(new UnauthorizedError());

  // Super admin can act on any campus
  if (req.user.role === 'super_admin') return next();

  const campusId =
    (req.params.campusId as string | undefined) ??
    (req.body?.campusId  as string | undefined);

  if (!campusId) return next();   // no campus context in this route — skip

  if (req.user.campusId !== campusId) {
    return next(
      new ForbiddenError('You do not have permission to act on this campus.'),
    );
  }

  next();
}

// ── optionalAuth ──────────────────────────────────────────────────────────────

/**
 * Like requireAuth but never rejects.
 * Sets req.user if a valid session exists, otherwise leaves it undefined.
 * Useful for routes that behave differently for logged-in vs guest users.
 */
export async function optionalAuth(
  req:  Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) return next();

    const { rows } = await query<UserRow>(
      `SELECT u.id, u.email, u.role, u.status, u.campus_id, u.full_name
       FROM users u
       WHERE u.better_auth_id = $1
       LIMIT 1`,
      [session.user.id],
    );

    if (rows[0] && rows[0].status === 'active') {
      req.user = {
        id:       rows[0].id,
        email:    rows[0].email,
        role:     rows[0].role,
        status:   rows[0].status as 'active',
        campusId: rows[0].campus_id,
        fullName: rows[0].full_name,
      };
    }
    next();
  } catch {
    // Never block the request on optional auth failure
    next();
  }
}