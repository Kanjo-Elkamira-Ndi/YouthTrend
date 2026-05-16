import { Router } from 'express';
import { AnalyticsService } from './analytics.service';
import { requireAuth, requireRole, optionalAuth } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);
router.get(
  '/posts/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const period = (req.query.period as string) || '30d';
    const result = await AnalyticsService.getPostAnalytics(
      p(req.params.id),
      req.user!.id,
      period,
    );
    return sendSuccess(res, result);
  }),
);
router.get(
  '/me',
  requireAuth,
  requireRole('writer', 'campus_admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const result = await AnalyticsService.getWriterAnalytics(req.user!.id);
    return sendSuccess(res, result);
  }),
);
router.post(
  '/posts/:id/view',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const result = await AnalyticsService.recordView(
      p(req.params.id),
      req.user?.id,
      req.ip,
    );
    return sendSuccess(res, result);
  }),
);
export default router;