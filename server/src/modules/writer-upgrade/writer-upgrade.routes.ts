import { Router } from 'express';
import { z } from 'zod';
import { WriterUpgradeService } from './writer-upgrade.service';
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
  topics: z.array(z.string()).min(1).max(4),
  motivation: z.string().min(50).max(1000),
  sampleTitle: z.string().min(5).max(500),
  sampleBody: z.string().min(100).max(10000),
  externalLink: z.string().url().optional(),
});

const declineSchema = z.object({
  reviewerNote: z.string().max(500).optional(),
});

router.post(
  '/',
  requireAuth,
  validate(submitSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId) {
      throw new ForbiddenError('You must belong to a campus to submit a writer upgrade request.');
    }

    const request = await WriterUpgradeService.submit({
      userId: req.user!.id,
      campusId,
      topics: req.body.topics,
      motivation: req.body.motivation,
      sampleTitle: req.body.sampleTitle,
      sampleBody: req.body.sampleBody,
      externalLink: req.body.externalLink,
    });

    return sendCreated(res, request);
  }),
);

router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    const requests = await WriterUpgradeService.getOwnRequests(req.user!.id);
    return sendSuccess(res, requests);
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

    const { data, meta } = await WriterUpgradeService.listForCampus(
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

    const request = await WriterUpgradeService.getById(p(req.params.id), campusId);
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

    const request = await WriterUpgradeService.approve(
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

    const request = await WriterUpgradeService.decline(
      p(req.params.id),
      req.user!.id,
      campusId,
      req.body.reviewerNote,
    );

    return sendSuccess(res, request);
  }),
);

export default router;
