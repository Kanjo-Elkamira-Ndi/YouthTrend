/**
 * Moderation routes
 *
 * Any authenticated user:
 *   POST /api/v1/moderation/reports          file a report
 *
 * Campus Moderator / Campus Admin:
 *   GET  /api/v1/moderation/campus/queue     campus report queue
 *   PATCH /api/v1/moderation/campus/reports/:id/action  take_down | dismiss | escalate
 *   GET  /api/v1/moderation/campus/posts     all campus posts (for oversight)
 *   PATCH /api/v1/moderation/campus/posts/:id/pin       pin / unpin
 *   PATCH /api/v1/moderation/campus/posts/:id/takedown  force takedown
 *
 * Super Admin:
 *   GET  /api/v1/moderation/admin/queue      global queue (all + escalated)
 *   PATCH /api/v1/moderation/admin/reports/:id/action   platform action
 *   PATCH /api/v1/moderation/admin/posts/:id/takedown   platform-wide takedown
 */

import { Router }              from 'express';
import { z }                   from 'zod';
import { ModerationService }   from './moderation.service';
import { PostsService }        from '../posts/posts.service';
import {
  requireAuth,
  requireRole,
}                              from '../auth/auth.middleware';
import { validate }            from '../../shared/utils/validate';
import { asyncHandler }        from '../../shared/utils/asyncHandler';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
}                              from '../../shared/utils/response';
import { ForbiddenError }      from '../../shared/errors/AppError';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

// ── Schemas ───────────────────────────────────────────────────────────────────

const reportSchema = z.object({
  targetType:  z.enum(['post', 'comment']),
  targetId:    z.string().uuid('Must be a valid UUID'),
  reason:      z.enum([
    'hate_speech', 'misinformation', 'spam',
    'explicit_content', 'harassment', 'other',
  ]),
  description: z.string().max(1000).optional(),
});

const campusActionSchema = z.object({
  action:        z.enum(['take_down', 'dismiss', 'escalate']),
  moderatorNote: z.string().max(1000).optional(),
});

const adminActionSchema = z.object({
  action:        z.enum(['take_down_platform', 'return_to_campus', 'dismiss']),
  moderatorNote: z.string().max(1000).optional(),
});

const pinSchema = z.object({
  pinned: z.boolean(),
});

const takedownSchema = z.object({
  note: z.string().max(500).optional(),
});

// ═════════════════════════════════════════════════════════════════════════════
// ANY AUTHENTICATED USER — file a report
// ═════════════════════════════════════════════════════════════════════════════

router.post(
  '/reports',
  requireAuth,
  validate(reportSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId) {
      throw new ForbiddenError('You must belong to a campus to file a report.');
    }

    const report = await ModerationService.fileReport({
      reporterId:  req.user!.id,
      campusId,
      targetType:  req.body.targetType,
      targetId:    req.body.targetId,
      reason:      req.body.reason,
      description: req.body.description,
    });

    return sendCreated(res, report);
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// CAMPUS MODERATOR + CAMPUS ADMIN
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/v1/moderation/campus/queue
router.get(
  '/campus/queue',
  requireAuth,
  requireRole('moderator', 'campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const { data, meta } = await ModerationService.getCampusQueue({
      campusId,
      status:      req.query.status as any,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// PATCH /api/v1/moderation/campus/reports/:id/action
router.patch(
  '/campus/reports/:id/action',
  requireAuth,
  requireRole('moderator', 'campus_admin', 'super_admin'),
  validate(campusActionSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    const report = await ModerationService.actionReport({
      reportId:      p(req.params.id),
      actorId:       req.user!.id,
      actorRole:     req.user!.role,
      campusId:      campusId ?? (req.query.campusId as string),
      action:        req.body.action,
      moderatorNote: req.body.moderatorNote,
    });

    return sendSuccess(res, report);
  }),
);

// GET /api/v1/moderation/campus/posts — all campus posts for oversight
router.get(
  '/campus/posts',
  requireAuth,
  requireRole('moderator', 'campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const { data, meta } = await PostsService.getCampusFeed({
      campusId,
      sort:        'recent',
      queryParams: {
        ...req.query,
        // Override to include all statuses for admins
        _adminView: 'true',
      } as Record<string, unknown>,
    });

    return sendPaginated(res, data, meta);
  }),
);

// PATCH /api/v1/moderation/campus/posts/:id/pin
router.patch(
  '/campus/posts/:id/pin',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(pinSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    await ModerationService.setPinned({
      postId:    p(req.params.id),
      campusId:  campusId ?? (req.query.campusId as string),
      pinned:    req.body.pinned,
      actorId:   req.user!.id,
      actorRole: req.user!.role,
    });

    return sendSuccess(res, {
      message: `Post ${req.body.pinned ? 'pinned' : 'unpinned'} successfully.`,
    });
  }),
);

// PATCH /api/v1/moderation/campus/posts/:id/takedown
router.patch(
  '/campus/posts/:id/takedown',
  requireAuth,
  requireRole('moderator', 'campus_admin', 'super_admin'),
  validate(takedownSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    await ModerationService.takedownPost({
      postId:    p(req.params.id),
      campusId:  campusId ?? (req.query.campusId as string),
      actorId:   req.user!.id,
      actorRole: req.user!.role,
      note:      req.body.note,
    });

    return sendSuccess(res, { message: 'Post taken down successfully.' });
  }),
);

// ═════════════════════════════════════════════════════════════════════════════
// SUPER ADMIN — global moderation
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/v1/moderation/admin/queue
router.get(
  '/admin/queue',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const { data, meta } = await ModerationService.getGlobalQueue({
      status:      req.query.status as any,
      campusId:    req.query.campusId as string | undefined,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// PATCH /api/v1/moderation/admin/reports/:id/action
router.patch(
  '/admin/reports/:id/action',
  requireAuth,
  requireRole('super_admin'),
  validate(adminActionSchema),
  asyncHandler(async (req, res) => {
    const report = await ModerationService.adminActionReport({
      reportId:      p(req.params.id),
      actorId:       req.user!.id,
      action:        req.body.action,
      moderatorNote: req.body.moderatorNote,
    });
    return sendSuccess(res, report);
  }),
);

// PATCH /api/v1/moderation/admin/posts/:id/takedown
router.patch(
  '/admin/posts/:id/takedown',
  requireAuth,
  requireRole('super_admin'),
  validate(takedownSchema),
  asyncHandler(async (req, res) => {
    await ModerationService.takedownPost({
      postId:    p(req.params.id),
      campusId:  req.user!.campusId ?? '',
      actorId:   req.user!.id,
      actorRole: 'super_admin',
      note:      req.body.note,
    });
    return sendSuccess(res, { message: 'Post taken down platform-wide.' });
  }),
);

export default router;