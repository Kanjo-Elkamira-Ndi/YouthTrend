import { Router } from 'express';
import { z } from 'zod';
import { CampusJoinService } from './campus-join.service';
import {
  requireAuth,
  requireRole,
} from '../auth/auth.middleware';
import { validate } from '../../shared/utils/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  sendCreated,
  sendSuccess,
  sendPaginated,
} from '../../shared/utils/response';
import { ForbiddenError } from '../../shared/errors/AppError';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

const submitSchema = z.object({
  campusId: z.string().uuid('Must be a valid campus UUID'),
});

const declineSchema = z.object({
  reviewerNote: z.string().max(500).optional(),
});

router.post(
  '/',
  requireAuth,
  validate(submitSchema),
  asyncHandler(async (req, res) => {
    if (req.user!.campusId) {
      throw new ForbiddenError('You already belong to a campus.');
    }

    const request = await CampusJoinService.submit({
      userId: req.user!.id,
      campusId: req.body.campusId,
    });

    return sendCreated(res, request);
  }),
);

router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const request = await CampusJoinService.getOwnRequest(req.user!.id);
    return sendSuccess(res, request);
  }),
);

router.get(
  '/campus',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const { data, meta } = await CampusJoinService.listForCampus(
      campusId,
      req.query as Record<string, unknown>,
    );

    return sendPaginated(res, data, meta);
  }),
);

router.get(
  '/campus/:id',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const request = await CampusJoinService.getById(p(req.params.id), campusId);
    return sendSuccess(res, request);
  }),
);

router.patch(
  '/campus/:id/approve',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const request = await CampusJoinService.approve(
      p(req.params.id),
      req.user!.id,
      campusId,
    );

    return sendSuccess(res, request);
  }),
);

router.patch(
  '/campus/:id/decline',
  requireAuth,
  requireRole('campus_admin', 'super_admin'),
  validate(declineSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.role === 'super_admin'
      ? (req.query.campusId as string)
      : req.user!.campusId;

    if (!campusId) {
      throw new ForbiddenError('Campus ID required.');
    }

    const request = await CampusJoinService.decline(
      p(req.params.id),
      req.user!.id,
      campusId,
      req.body.reviewerNote,
    );

    return sendSuccess(res, request);
  }),
);

export default router;
