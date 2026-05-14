/**
 * Campus routes — /api/v1/campuses
 *
 *   GET    /api/v1/campuses              list active campuses (public)
 *   GET    /api/v1/campuses/:slug        single campus profile (public)
 *   POST   /api/v1/campuses             create campus (Super Admin)
 *   PATCH  /api/v1/campuses/:id          update campus (Campus Admin / SA)
 *   PATCH  /api/v1/campuses/:id/status   activate / deactivate (SA only)
 *   DELETE /api/v1/campuses/:id          delete campus (SA only)
 */

import { Router, Request } from 'express';
import { z }               from 'zod';
import { CampusService }   from './campus.service';
import {
  requireAuth,
  requireRole,
  requireSameCampus,
} from '../auth/auth.middleware';
import { validate }        from '../../shared/utils/validate';
import { asyncHandler }    from '../../shared/utils/asyncHandler';
import { writeAuditLog }   from '../../shared/utils/audit';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from '../../shared/utils/response';
import { ForbiddenError }  from '../../shared/errors/AppError';

const router = Router();

// Express 5 types req.params values as string | string[].
// This helper narrows to string safely.
const param = (v: string | string[]): string =>
  Array.isArray(v) ? v[0] : v;

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name:           z.string().min(3, 'Name must be at least 3 characters').max(255),
  shortCode:      z
    .string()
    .min(2, 'Short code must be at least 2 characters')
    .max(10, 'Short code cannot exceed 10 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Short code must be alphanumeric only'),
  description:    z.string().max(1000).optional(),
  allowedDomains: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  name:           z.string().min(3).max(255).optional(),
  description:    z.string().max(1000).optional(),
  logoUrl:        z.string().url('Must be a valid URL').optional(),
  coverUrl:       z.string().url('Must be a valid URL').optional(),
  allowedDomains: z.array(z.string()).optional(),
  settings: z
    .object({
      registrationMode:        z.enum(['open', 'invite_only', 'closed']).optional(),
      postApprovalRequired:    z.boolean().optional(),
      anonymousPostingEnabled: z.boolean().optional(),
      autoApproveWriters:      z.boolean().optional(),
      moderationSlaHours:      z.number().int().min(1).max(168).optional(),
    })
    .optional(),
});

const statusSchema = z.object({
  status: z.enum(['active', 'inactive'], {
    error: 'Status must be "active" or "inactive"',
  }),
});

const deleteSchema = z.object({
  confirm: z.string(),
});

// ── GET /api/v1/campuses ──────────────────────────────────────────────────────
// Public — lists active campuses with member + post counts.
// Super Admin can pass ?includeInactive=true to see all.

router.get('/', asyncHandler(async (req, res) => {
  const isAdmin =
    req.user?.role === 'super_admin' || req.user?.role === 'campus_admin';

  const campuses = await CampusService.list({
    includeInactive: isAdmin && req.query.includeInactive === 'true',
    search:          req.query.search as string | undefined,
  });

  return sendSuccess(res, campuses);
}));

// ── GET /api/v1/campuses/:slug ────────────────────────────────────────────────
// Public — single campus profile by URL slug.

router.get('/:slug', asyncHandler(async (req, res) => {
  const campus = await CampusService.findBySlug(param(req.params.slug));
  return sendSuccess(res, campus);
}));

// ── POST /api/v1/campuses ─────────────────────────────────────────────────────
// Super Admin only — create a new campus.

router.post(
  '/',
  requireAuth,
  requireRole('super_admin'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const campus = await CampusService.create(req.body);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'campus.create',
      targetType: 'campus',
      targetId:   campus.id,
      campusId:   campus.id,
      meta:       { name: campus.name, shortCode: campus.short_code },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendCreated(res, campus);
  }),
);

// ── PATCH /api/v1/campuses/:id ────────────────────────────────────────────────
// Campus Admin (own campus) OR Super Admin — update details and/or settings.

router.patch(
  '/:id',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(updateSchema),
  asyncHandler(async (req: Request, res) => {
    const id = param(req.params.id);

    // Campus Admin can only update their own campus
    if (
      req.user!.role === 'campus_admin' &&
      req.user!.campusId !== id
    ) {
      throw new ForbiddenError(
        'Campus Admins can only update their own campus.',
      );
    }

    const campus = await CampusService.update(id, req.body);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'campus.update',
      targetType: 'campus',
      targetId:   campus.id,
      campusId:   campus.id,
      meta:       { changes: req.body },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, campus);
  }),
);

// ── PATCH /api/v1/campuses/:id/status ────────────────────────────────────────
// Super Admin only — activate or deactivate a campus.

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('super_admin'),
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const id = param(req.params.id);
    const { status } = req.body as { status: 'active' | 'inactive' };

    const campus = await CampusService.setStatus(id, status);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     `campus.${status === 'active' ? 'activate' : 'deactivate'}`,
      targetType: 'campus',
      targetId:   campus.id,
      campusId:   campus.id,
      meta:       { status },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, campus);
  }),
);

// ── DELETE /api/v1/campuses/:id ───────────────────────────────────────────────
// Super Admin only — hard delete campus.
// Requires { "confirm": "DELETE" } in request body.

router.delete(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  validate(deleteSchema),
  asyncHandler(async (req, res) => {
    const id = param(req.params.id);

    // Fetch campus name before deletion for the audit log
    const campus = await CampusService.findById(id);

    await CampusService.delete(id, req.body.confirm);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'campus.delete',
      targetType: 'campus',
      targetId:   id,
      campusId:   null,
      meta:       { name: campus.name, shortCode: campus.short_code },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendNoContent(res);
  }),
);

export default router;