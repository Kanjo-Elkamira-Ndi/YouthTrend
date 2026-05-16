import { Router } from 'express';
import { z } from 'zod';
import { AnnouncementsService, AnnouncementVisibility } from './announcements.service';
import {
  requireAuth,
  requireRole,
  optionalAuth,
} from '../auth/auth.middleware';
import { validate } from '../../shared/utils/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from '../../shared/utils/response';
import { ForbiddenError } from '../../shared/errors/AppError';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

const createSchema = z.object({
  title: z.string().min(3).max(500),
  body: z.string().min(10),
  visibility: z.enum(['all_students', 'writers_only', 'moderators_only'] as const),
  isPinned: z.boolean().default(false),
});

const updateSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  body: z.string().min(10).optional(),
  visibility: z.enum(['all_students', 'writers_only', 'moderators_only'] as const).optional(),
  isPinned: z.boolean().optional(),
});

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const campusId = req.user?.campusId ?? (req.query.campusId as string);
    if (!campusId) {
      throw new ForbiddenError('Campus ID is required.');
    }

    const viewerRole = req.user?.role;

    const { data, meta } = await AnnouncementsService.listForCampus(
      campusId,
      viewerRole,
      req.query as Record<string, unknown>,
    );

    return sendPaginated(res, data, meta);
  }),
);

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const campusId = req.user?.campusId ?? (req.query.campusId as string);
    if (!campusId) {
      throw new ForbiddenError('Campus ID is required.');
    }

    const viewerRole = req.user?.role;

    const announcement = await AnnouncementsService.getById(
      p(req.params.id),
      campusId,
      viewerRole,
    );

    return sendSuccess(res, announcement);
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    const announcement = await AnnouncementsService.create({
      campusId: campusId ?? (req.query.campusId as string),
      authorId: req.user!.id,
      title: req.body.title,
      body: req.body.body,
      visibility: req.body.visibility as AnnouncementVisibility,
      isPinned: req.body.isPinned,
    });

    return sendCreated(res, announcement);
  }),
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    const announcement = await AnnouncementsService.update(
      p(req.params.id),
      campusId ?? (req.query.campusId as string),
      req.user!.id,
      {
        title: req.body.title,
        body: req.body.body,
        visibility: req.body.visibility as AnnouncementVisibility | undefined,
        isPinned: req.body.isPinned,
      },
    );

    return sendSuccess(res, announcement);
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId && req.user!.role !== 'super_admin') {
      throw new ForbiddenError('No campus assigned.');
    }

    await AnnouncementsService.delete(
      p(req.params.id),
      campusId ?? (req.query.campusId as string),
      req.user!.id,
      req.user!.role,
    );

    return sendSuccess(res, { message: 'Announcement deleted successfully.' });
  }),
);

export default router;
