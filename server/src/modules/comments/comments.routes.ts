/**
 * Comments routes.
 *
 *   GET    /api/v1/posts/:postId/comments
 *   POST   /api/v1/posts/:postId/comments
 *   PATCH  /api/v1/comments/:id
 *   DELETE /api/v1/comments/:id
 */

import { Router }          from 'express';
import { z }               from 'zod';
import { CommentsService } from './comments.service';
import { requireAuth }     from '../auth/auth.middleware';
import { validate }        from '../../shared/utils/validate';
import { asyncHandler }    from '../../shared/utils/asyncHandler';
import {
  sendCreated,
  sendNoContent,
  sendPaginated,
  sendSuccess,
}                          from '../../shared/utils/response';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

const createSchema = z.object({
  body:     z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment cannot exceed 5000 characters'),
  parentId: z.string().uuid('parentId must be a valid comment UUID').optional(),
});

const updateSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment cannot exceed 5000 characters'),
});

// ── GET /api/v1/posts/:postId/comments ───────────────────────────────────────
router.get(
  '/posts/:postId/comments',
  asyncHandler(async (req, res) => {
    const { data, meta } = await CommentsService.listForPost(
      p(req.params.postId),
      req.query as Record<string, unknown>,
    );

    return sendPaginated(res, data, meta);
  }),
);

// ── POST /api/v1/posts/:postId/comments ──────────────────────────────────────
router.post(
  '/posts/:postId/comments',
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const comment = await CommentsService.create({
      postId:   p(req.params.postId),
      authorId: req.user!.id,
      body:     req.body.body,
      parentId: req.body.parentId,
    });

    return sendCreated(res, comment);
  }),
);

// ── PATCH /api/v1/comments/:id ───────────────────────────────────────────────
router.patch(
  '/comments/:id',
  requireAuth,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const comment = await CommentsService.update({
      commentId: p(req.params.id),
      actorId:   req.user!.id,
      body:      req.body.body,
    });

    return sendSuccess(res, comment);
  }),
);

// ── DELETE /api/v1/comments/:id ──────────────────────────────────────────────
router.delete(
  '/comments/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await CommentsService.delete({
      commentId:     p(req.params.id),
      actorId:       req.user!.id,
      actorRole:     req.user!.role,
      actorCampusId: req.user!.campusId,
    });

    return sendNoContent(res);
  }),
);

export default router;
