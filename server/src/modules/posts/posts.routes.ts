/**
 * Posts routes — /api/v1/posts
 *
 * Public (optionalAuth):
 *   GET /api/v1/posts                campus feed
 *   GET /api/v1/posts/trending       trending feed
 *   GET /api/v1/posts/explore        cross-campus public feed
 *   GET /api/v1/posts/:campusSlug/:postSlug   single post
 *
 * Authenticated:
 *   GET /api/v1/posts/following      following feed
 *   GET /api/v1/posts/me             own posts
 *   GET /api/v1/posts/bookmarks      own bookmarks
 *
 * Writer / owner:
 *   POST   /api/v1/posts                  create post
 *   PATCH  /api/v1/posts/:id              update post
 *   POST   /api/v1/posts/:id/publish      publish
 *   POST   /api/v1/posts/:id/unpublish    unpublish
 *   DELETE /api/v1/posts/:id              delete
 *
 * Any authenticated user:
 *   POST   /api/v1/posts/:id/clap         clap
 *   POST   /api/v1/posts/:id/bookmark     bookmark
 *   DELETE /api/v1/posts/:id/bookmark     remove bookmark
 */

import { Router }        from 'express';
import { z }             from 'zod';
import { PostsService }  from './posts.service';
import {
  requireAuth,
  requireRole,
  optionalAuth,
}                        from '../auth/auth.middleware';
import { validate }      from '../../shared/utils/validate';
import { asyncHandler }  from '../../shared/utils/asyncHandler';
import { writeAuditLog } from '../../shared/utils/audit';
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
}                        from '../../shared/utils/response';
import { ForbiddenError } from '../../shared/errors/AppError';

const router = Router();
const p = (v: string | string[]): string => (Array.isArray(v) ? v[0] : v);

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(500),
  subtitle:    z.string().max(500).optional(),
  body:        z.string().min(1, 'Body cannot be empty'),
  coverUrl:    z.string().url().optional(),
  category:    z.string().min(1).max(100),
  visibility:  z.enum(['public', 'campus_only']).default('campus_only'),
  isAnonymous: z.boolean().default(false),
  tags:        z.array(z.string().max(80)).max(5).optional(),
  scheduledAt: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
});

const updateSchema = z.object({
  title:       z.string().min(5).max(500).optional(),
  subtitle:    z.string().max(500).optional(),
  body:        z.string().min(1).optional(),
  coverUrl:    z.string().url().optional(),
  category:    z.string().min(1).max(100).optional(),
  visibility:  z.enum(['public', 'campus_only']).optional(),
  isAnonymous: z.boolean().optional(),
  tags:        z.array(z.string().max(80)).max(5).optional(),
  scheduledAt: z.string().datetime().nullable().optional()
    .transform((v) => v === null ? null : v ? new Date(v) : undefined),
});

const clapSchema = z.object({
  count: z.number().int().min(1).max(50).default(1),
});

// ── GET /api/v1/posts — campus feed ──────────────────────────────────────────
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const campusId = req.user?.campusId ?? (req.query.campusId as string);
    if (!campusId) {
      return sendSuccess(res, { data: [], meta: { page: 1, perPage: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } });
    }

    const { data, meta } = await PostsService.getCampusFeed({
      campusId,
      viewerId:    req.user?.id,
      sort:        req.query.sort === 'trending' ? 'trending' : 'recent',
      category:    req.query.category as string | undefined,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/trending ────────────────────────────────────────────────
router.get(
  '/trending',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getTrendingFeed({
      campusId:    req.user?.campusId ?? undefined,
      viewerId:    req.user?.id,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/explore ─────────────────────────────────────────────────
router.get(
  '/explore',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getExploreFeed({
      viewerId:    req.user?.id,
      category:    req.query.category as string | undefined,
      sort:        req.query.sort === 'trending' ? 'trending' : 'recent',
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/following ───────────────────────────────────────────────
router.get(
  '/following',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getFollowingFeed({
      viewerId:    req.user!.id,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/me ──────────────────────────────────────────────────────
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getOwnPosts({
      authorId:    req.user!.id,
      status:      req.query.status as any,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/bookmarks ───────────────────────────────────────────────
router.get(
  '/bookmarks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getBookmarks({
      userId:      req.user!.id,
      queryParams: req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/user/:userId — posts by a specific user ────────────────
router.get(
  '/user/:userId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { data, meta } = await PostsService.getUserPosts({
      authorId:       p(req.params.userId),
      viewerId:       req.user?.id,
      viewerCampusId: req.user?.campusId ?? undefined,
      queryParams:    req.query as Record<string, unknown>,
    });
    return sendPaginated(res, data, meta);
  }),
);

// ── GET /api/v1/posts/id/:id — single post by ID (for editing) ──────────────
router.get(
  '/id/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await PostsService.getById(p(req.params.id));

    // Only author or admin can view edit data
    if (
      post.author_id !== req.user!.id &&
      req.user!.role !== 'campus_admin' &&
      req.user!.role !== 'super_admin'
    ) {
      throw new ForbiddenError('You can only view your own posts.');
    }

    return sendSuccess(res, post);
  }),
);

// ── GET /api/v1/posts/:campusSlug/:postSlug ───────────────────────────────────
router.get(
  '/:campusSlug/:postSlug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const post = await PostsService.getBySlug({
      campusSlug: p(req.params.campusSlug),
      postSlug:   p(req.params.postSlug),
      viewerId:   req.user?.id,
      viewerIp:   typeof req.ip === 'string' ? req.ip : undefined,
    });
    return sendSuccess(res, post);
  }),
);

// ── POST /api/v1/posts — create ───────────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  requireRole('writer', 'campus_admin', 'super_admin'),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const campusId = req.user!.campusId;
    if (!campusId) {
      throw new ForbiddenError('You must belong to a campus to create posts.');
    }

    const post = await PostsService.create({
      authorId:     req.user!.id,
      campusId,
      ...req.body,
    });

    return sendCreated(res, post);
  }),
);

// ── PATCH /api/v1/posts/:id — update ─────────────────────────────────────────
router.patch(
  '/:id',
  requireAuth,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const post = await PostsService.update({
      postId:    p(req.params.id),
      actorId:   req.user!.id,
      actorRole: req.user!.role,
      ...req.body,
    });
    return sendSuccess(res, post);
  }),
);

// ── POST /api/v1/posts/:id/publish ────────────────────────────────────────────
router.post(
  '/:id/publish',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await PostsService.publish(p(req.params.id), req.user!.id);
    return sendSuccess(res, post);
  }),
);

// ── POST /api/v1/posts/:id/unpublish ──────────────────────────────────────────
router.post(
  '/:id/unpublish',
  requireAuth,
  asyncHandler(async (req, res) => {
    const post = await PostsService.unpublish(p(req.params.id), req.user!.id);
    return sendSuccess(res, post);
  }),
);

// ── DELETE /api/v1/posts/:id ──────────────────────────────────────────────────
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const postId = p(req.params.id);
    await PostsService.delete(postId, req.user!.id, req.user!.role);

    writeAuditLog({
      actorId:    req.user!.id,
      actorRole:  req.user!.role,
      action:     'post.delete',
      targetType: 'post',
      targetId:   postId,
      campusId:   req.user!.campusId,
      ip:         typeof req.ip === 'string' ? req.ip : undefined,
    });

    return sendNoContent(res);
  }),
);

// ── POST /api/v1/posts/:id/clap ───────────────────────────────────────────────
router.post(
  '/:id/clap',
  requireAuth,
  validate(clapSchema),
  asyncHandler(async (req, res) => {
    const result = await PostsService.clap(
      p(req.params.id),
      req.user!.id,
      req.body.count,
    );
    return sendSuccess(res, result);
  }),
);

// ── POST /api/v1/posts/:id/bookmark ──────────────────────────────────────────
router.post(
  '/:id/bookmark',
  requireAuth,
  asyncHandler(async (req, res) => {
    await PostsService.bookmark(p(req.params.id), req.user!.id);
    return sendCreated(res, { message: 'Post bookmarked.' });
  }),
);

// ── DELETE /api/v1/posts/:id/bookmark ────────────────────────────────────────
router.delete(
  '/:id/bookmark',
  requireAuth,
  asyncHandler(async (req, res) => {
    await PostsService.unbookmark(p(req.params.id), req.user!.id);
    return sendNoContent(res);
  }),
);

export default router;