import { Router } from 'express';
import { z } from 'zod';
import { SuperAdminService } from './super-admin.service';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { validate } from '../../shared/utils/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
const router = Router();
const settingsSchema = z.object({
  platformName: z.string().max(100).optional(),
  platformTagline: z.string().optional(),
  logoUrl: z.string().optional(),
  defaultLanguage: z.enum(['en', 'fr']).optional(),
  registrationMode: z.enum(['open', 'invite_only', 'closed']).optional(),
  requireCampusEmail: z.boolean().optional(),
  emailVerificationRequired: z.boolean().optional(),
  maxPostLengthWords: z.number().int().min(1000).max(50000).optional(),
  maxImageSizeMb: z.number().int().min(1).max(50).optional(),
  autoProfanityFilter: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});
function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snake = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    result[snake] = value;
  }
  return result;
}
router.get(
  '/stats',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (_req, res) => {
    const stats = await SuperAdminService.getPlatformStats();
    return sendSuccess(res, stats);
  }),
);
router.get(
  '/campus-health',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (_req, res) => {
    const health = await SuperAdminService.getCampusHealth();
    return sendSuccess(res, health);
  }),
);
router.get(
  '/audit-log',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const { data, meta } = await SuperAdminService.getAuditLog({
      actorRole: req.query.actorRole as string | undefined,
      action: req.query.action as string | undefined,
      campusId: req.query.campusId as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);
router.get(
  '/content',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (req, res) => {
    const { data, meta } = await SuperAdminService.getGlobalContent(
      req.query as Record<string, unknown>,
    );
    return sendPaginated(res, data, meta);
  }),
);
router.get(
  '/settings',
  requireAuth,
  requireRole('super_admin'),
  asyncHandler(async (_req, res) => {
    const settings = await SuperAdminService.getPlatformSettings();
    return sendSuccess(res, settings);
  }),
);
router.patch(
  '/settings',
  requireAuth,
  requireRole('super_admin'),
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    const snakeInput = camelToSnake(req.body);
    const updated = await SuperAdminService.updatePlatformSettings(
      snakeInput,
      req.user!.id,
    );
    return sendSuccess(res, updated);
  }),
);

export default router;