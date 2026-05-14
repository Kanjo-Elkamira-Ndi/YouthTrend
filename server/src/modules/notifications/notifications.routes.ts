/**
 * Notifications routes — /api/v1/notifications
 */

import { Router } from 'express';
import { NotificationService } from './notifications.service';
import { requireAuth } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  sendNoContent,
  sendPaginated,
  sendSuccess,
} from '../../shared/utils/response';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

function parseReadFilter(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

// GET /api/v1/notifications
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const type = req.query.type
      ? NotificationService.parseType(String(req.query.type))
      : undefined;

    const { data, meta } = await NotificationService.listForUser({
      userId:      req.user!.id,
      read:        parseReadFilter(req.query.read),
      type,
      queryParams: req.query as Record<string, unknown>,
    });

    return sendPaginated(res, data, meta);
  }),
);

// GET /api/v1/notifications/unread-count
router.get(
  '/unread-count',
  requireAuth,
  asyncHandler(async (req, res) => {
    const count = await NotificationService.unreadCount(req.user!.id);
    return sendSuccess(res, count);
  }),
);

// PATCH /api/v1/notifications/:id/read
router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await NotificationService.markRead(
      req.user!.id,
      p(req.params.id),
    );

    return sendSuccess(res, notification);
  }),
);

// POST /api/v1/notifications/read-all
router.post(
  '/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await NotificationService.markAllRead(req.user!.id);
    return sendSuccess(res, result);
  }),
);

// DELETE /api/v1/notifications/:id
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await NotificationService.delete(req.user!.id, p(req.params.id));
    return sendNoContent(res);
  }),
);

export default router;
