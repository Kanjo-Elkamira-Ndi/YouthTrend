/**
 * Users routes — /api/v1/users
 *
 * Public:
 *   GET  /api/v1/users/:username              public profile
 *   GET  /api/v1/users/:username/followers    followers list
 *   GET  /api/v1/users/:username/following    following list
 *
 * Authenticated (any role):
 *   POST   /api/v1/users/:id/follow           follow a user
 *   DELETE /api/v1/users/:id/follow           unfollow a user
 *
 * Campus Admin (own campus only):
 *   GET    /api/v1/users/campus/list          list campus users
 *   PATCH  /api/v1/users/campus/:id/role      change role
 *   PATCH  /api/v1/users/campus/:id/status    suspend / activate
 *   POST   /api/v1/users/campus/invite        validate + send invite emails
 *
 * Super Admin (global):
 *   GET    /api/v1/users/admin/list           all users cross-campus
 *   PATCH  /api/v1/users/admin/:id/role       change any user's role
 *   PATCH  /api/v1/users/admin/:id/ban        platform-wide ban
 *   DELETE /api/v1/users/admin/:id            delete account
 */

import { Router }         from 'express';
import { z }              from 'zod';
import { UsersService }   from './users.service';
import { EmailService }   from '../../services/email.service';
import {
  requireAuth,
  requireRole,
  optionalAuth,
}                         from '../auth/auth.middleware';
import { validate }       from '../../shared/utils/validate';
import { asyncHandler }   from '../../shared/utils/asyncHandler';
import { writeAuditLog }  from '../../shared/utils/audit';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
}                         from '../../shared/utils/response';
import { ForbiddenError } from '../../shared/errors/AppError';

const router = Router();

// ── Param helper (Express 5 types params as string | string[]) ────────────────
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

// ── Schemas ───────────────────────────────────────────────────────────────────

const roleSchema = z.object({
  role: z.enum(
    ['super_admin', 'campus_admin', 'moderator', 'writer', 'reader'],
    { error: 'Invalid role' },
  ),
});

const campusStatusSchema = z.object({
  status: z.enum(['active', 'suspended'], {
    error: 'Status must be "active" or "suspended"',
  }),
});

const inviteSchema = z.object({
  emails: z
    .array(z.string().email('Each entry must be a valid email'))
    .min(1, 'Provide at least one email')
    .max(50, 'Cannot invite more than 50 users at once'),
  role: z
    .enum(['reader', 'writer', 'moderator'])
    .default('reader'),
});

const deleteSchema = z.object({
  confirm: z.string(),
});

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/v1/users/:username — public profile
router.get(
  '/:username',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const profile = await UsersService.getPublicProfile(
      p(req.params.username),
      req.user?.id,
    );
    return sendSuccess(res, profile);
  }),
);

// GET /api/v1/users/:username/followers
router.get(
  '/:username/followers',
  asyncHandler(async (req, res) => {
    // Resolve username → id first
    const profile = await UsersService.getPublicProfile(p(req.params.username));
    const { data, meta } = await UsersService.getFollowers(
      profile.id,
      req.query as Record<string, unknown>,
    );
    return sendPaginated(res, data, meta);
  }),
);

// GET /api/v1/users/:username/following
router.get(
  '/:username/following',
  asyncHandler(async (req, res) => {
    const profile = await UsersService.getPublicProfile(p(req.params.username));
    const { data, meta } = await UsersService.getFollowing(
      profile.id,
      req.query as Record<string, unknown>,
    );
    return sendPaginated(res, data, meta);
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED — follow / unfollow
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/v1/users/:id/follow
router.post(
  '/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    await UsersService.follow(req.user!.id, p(req.params.id));
    return sendCreated(res, { message: 'User followed successfully.' });
  }),
);

// DELETE /api/v1/users/:id/follow
router.delete(
  '/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    await UsersService.unfollow(req.user!.id, p(req.params.id));
    return sendNoContent(res);
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// CAMPUS ADMIN — /api/v1/users/campus/*
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/v1/users/campus/list
router.get(
  '/campus/list',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    // Super admin must supply ?campusId=; campus admin uses their own
    const campusId =
      req.user!.role === 'super_admin'
        ? (req.query.campusId as string)
        : req.user!.campusId!;

    if (!campusId) {
      return sendSuccess(res, { error: 'campusId query param required for Super Admin.' });
    }

    const { data, meta } = await UsersService.listCampusUsers(
      campusId,
      req.query as Record<string, unknown>,
    );
    return sendPaginated(res, data, meta);
  }),
);

// PATCH /api/v1/users/campus/:id/role
router.patch(
  '/campus/:id/role',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(roleSchema),
  asyncHandler(async (req, res) => {
    const userId   = p(req.params.id);
    const campusId = req.user!.campusId;

    if (req.user!.role === 'campus_admin' && !campusId) {
      throw new ForbiddenError('No campus assigned to your account.');
    }

    await UsersService.changeCampusUserRole(
      campusId ?? '',
      userId,
      req.body.role,
      req.user!.id,
    );

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'user.role_change',
      targetType: 'user',
      targetId:   userId,
      campusId:   campusId,
      meta:       { newRole: req.body.role },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, { message: 'Role updated successfully.', role: req.body.role });
  }),
);

// PATCH /api/v1/users/campus/:id/status
router.patch(
  '/campus/:id/status',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(campusStatusSchema),
  asyncHandler(async (req, res) => {
    const userId   = p(req.params.id);
    const campusId = req.user!.campusId ?? '';

    await UsersService.setCampusUserStatus(
      campusId,
      userId,
      req.body.status,
      req.user!.id,
    );

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     req.body.status === 'suspended' ? 'user.suspend' : 'user.activate',
      targetType: 'user',
      targetId:   userId,
      campusId:   campusId,
      meta:       { status: req.body.status },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, {
      message: `User ${req.body.status === 'suspended' ? 'suspended' : 'activated'} successfully.`,
    });
  }),
);

// POST /api/v1/users/campus/invite
router.post(
  '/campus/invite',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(inviteSchema),
  asyncHandler(async (req, res) => {
    const { emails, role } = req.body as { emails: string[]; role: string };
    const campusId = req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('No campus assigned to your account.');
    }

    const { valid, alreadyRegistered } =
      await UsersService.validateInviteEmails(emails);

    // Send invite emails to valid addresses
    for (const email of valid) {
      EmailService.sendCampusAnnouncement({
        to:         email,
        name:       'Student',
        campusName: 'YouthTrend',
        title:      'You have been invited to join YouthTrend',
        body:       `You've been invited to join your campus on YouthTrend as a ${role}. Sign up at ${process.env.BETTER_AUTH_URL?.replace(':4000', ':5173') ?? 'http://localhost:5173'}/signup`,
        url:        `${process.env.BETTER_AUTH_URL?.replace(':4000', ':5173') ?? 'http://localhost:5173'}/signup`,
      }).catch(() => {}); // fire-and-forget
    }

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'user.invite',
      targetType: 'campus',
      targetId:   campusId,
      campusId:   campusId,
      meta:       { invitedCount: valid.length, role },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, {
      invited:           valid.length,
      alreadyRegistered: alreadyRegistered.length,
      emails: {
        invited:           valid,
        alreadyRegistered,
      },
    });
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// SUPER ADMIN — /api/v1/users/admin/*
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/v1/users/admin/list
router.get(
  '/admin/list',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const { data, meta } = await UsersService.listAllUsers(
      req.query as Record<string, unknown>,
    );
    return sendPaginated(res, data, meta);
  }),
);

// PATCH /api/v1/users/admin/:id/role
router.patch(
  '/admin/:id/role',
  requireAuth,
  requireRole('super_admin'),
  validate(roleSchema),
  asyncHandler(async (req, res) => {
    const userId = p(req.params.id);

    await UsersService.changeUserRole(userId, req.body.role, req.user!.id);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'user.role_change',
      targetType: 'user',
      targetId:   userId,
      meta:       { newRole: req.body.role },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, {
      message: 'Role updated successfully.',
      role:    req.body.role,
    });
  }),
);

// PATCH /api/v1/users/admin/:id/ban
router.patch(
  '/admin/:id/ban',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const userId = p(req.params.id);

    await UsersService.banUser(userId, req.user!.id);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'user.ban',
      targetType: 'user',
      targetId:   userId,
      meta:       { reason: req.body?.reason ?? null },
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendSuccess(res, { message: 'User has been banned from the platform.' });
  }),
);

// DELETE /api/v1/users/admin/:id
router.delete(
  '/admin/:id',
  requireAuth,
  requireRole('super_admin'),
  validate(deleteSchema),
  asyncHandler(async (req, res) => {
    const userId = p(req.params.id);

    await UsersService.deleteUser(userId, req.user!.id, req.body.confirm);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'user.delete',
      targetType: 'user',
      targetId:   userId,
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendNoContent(res);
  }),
);

export default router;