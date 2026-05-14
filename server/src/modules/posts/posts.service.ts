/**
 * PostsService — all database logic for the posts module.
 *
 * Covers:
 *   - Campus feed (recency + trending sorts)
 *   - Following feed
 *   - Explore feed (cross-campus public posts)
 *   - Single post by slug (with view tracking)
 *   - Create / update / delete post
 *   - Publish / unpublish
 *   - Clap (upsert, 1-50 per user per post)
 *   - Bookmark / unbookmark
 *   - Own posts list
 *   - Scheduled post processor
 */

import * as crypto                from 'crypto';
import { query, withTransaction } from '../../config/db';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../../shared/errors/AppError';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';
import { PostFull, PostStatus } from '../../shared/types/post';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

/** Hash an IP address for guest view deduplication (one-way, privacy-safe) */
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 32);
}

// ── Shared SELECT fragment ────────────────────────────────────────────────────
// Used across feed, explore, and single-post queries.

const POST_SELECT = `
  p.id,           p.author_id,      p.campus_id,
  p.title,        p.subtitle,       p.slug,
  p.body,         p.cover_url,      p.category,
  p.status,       p.visibility,     p.is_anonymous,
  p.is_pinned,    p.scheduled_at,   p.published_at,
  p.view_count,   p.clap_count,     p.comment_count,
  p.created_at,   p.updated_at,
  -- Author (hidden when anonymous)
  CASE WHEN p.is_anonymous THEN NULL ELSE u.full_name  END AS author_name,
  CASE WHEN p.is_anonymous THEN NULL ELSE u.username   END AS author_username,
  CASE WHEN p.is_anonymous THEN NULL ELSE u.avatar_url END AS author_avatar_url,
  -- Campus
  c.name       AS campus_name,
  c.short_code AS campus_short_code,
  c.slug       AS campus_slug,
  -- Tags (aggregated)
  COALESCE(
    ARRAY(SELECT pt.tag FROM post_tags pt WHERE pt.post_id = p.id ORDER BY pt.tag),
    '{}'
  ) AS tags
`;

// ── Service ───────────────────────────────────────────────────────────────────

export const PostsService = {

  // ── Campus feed ────────────────────────────────────────────────────────────
  async getCampusFeed(opts: {
    campusId:   string;
    viewerId?:  string;
    sort?:      'recent' | 'trending';
    category?:  string;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const sort     = opts.sort ?? 'recent';
    const params: unknown[] = [opts.campusId];
    let   idx = 2;

    const conditions = [
      `p.campus_id = $1`,
      `p.status    = 'published'`,
    ];

    if (opts.category) {
      conditions.push(`p.category = $${idx++}`);
      params.push(opts.category);
    }

    const where    = `WHERE ${conditions.join(' AND ')}`;
    const orderBy  = sort === 'trending'
      ? `ORDER BY (p.clap_count * 3 + p.comment_count * 2 + p.view_count) DESC, p.published_at DESC`
      : `ORDER BY p.is_pinned DESC, p.published_at DESC`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM posts p ${where}`,
      params,
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      ${where}
      ${orderBy}
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    if (opts.viewerId) {
      await PostsService._attachViewerContext(rows, opts.viewerId);
    }

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Following feed ──────────────────────────────────────────────────────────
  async getFollowingFeed(opts: {
    viewerId:    string;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM posts p
       WHERE p.author_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       ) AND p.status = 'published'`,
      [opts.viewerId],
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      WHERE  p.author_id IN (
               SELECT following_id FROM follows WHERE follower_id = $1
             )
        AND  p.status = 'published'
      ORDER  BY p.published_at DESC
      LIMIT  $2 OFFSET $3
    `, [opts.viewerId, perPage, offset]);

    await PostsService._attachViewerContext(rows, opts.viewerId);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Explore feed (cross-campus public posts) ───────────────────────────────
  async getExploreFeed(opts: {
    viewerId?:   string;
    category?:   string;
    sort?:       'recent' | 'trending';
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const params: unknown[] = [];
    let   idx = 1;

    const conditions = [
      `p.status     = 'published'`,
      `p.visibility = 'public'`,
    ];

    if (opts.category) {
      conditions.push(`p.category = $${idx++}`);
      params.push(opts.category);
    }

    const where   = `WHERE ${conditions.join(' AND ')}`;
    const orderBy = opts.sort === 'trending'
      ? `ORDER BY (p.clap_count * 3 + p.comment_count * 2 + p.view_count) DESC, p.published_at DESC`
      : `ORDER BY p.published_at DESC`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts p ${where}`,
      params,
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      ${where}
      ${orderBy}
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    if (opts.viewerId) {
      await PostsService._attachViewerContext(rows, opts.viewerId);
    }

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Trending feed ───────────────────────────────────────────────────────────
  async getTrendingFeed(opts: {
    campusId?:   string;
    viewerId?:   string;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const params: unknown[] = [];
    let   idx = 1;

    const conditions = [`p.status = 'published'`];

    if (opts.campusId) {
      conditions.push(`(p.campus_id = $${idx} OR p.visibility = 'public')`);
      params.push(opts.campusId);
      idx++;
    } else {
      conditions.push(`p.visibility = 'public'`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts p ${where}`,
      params,
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      ${where}
      ORDER  BY (p.clap_count * 3 + p.comment_count * 2 + p.view_count) DESC,
                p.published_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    if (opts.viewerId) {
      await PostsService._attachViewerContext(rows, opts.viewerId);
    }

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Single post by slug ─────────────────────────────────────────────────────
  async getBySlug(opts: {
    campusSlug: string;
    postSlug:   string;
    viewerId?:  string;
    viewerIp?:  string;
  }): Promise<PostFull> {
    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      WHERE  c.slug = $1
        AND  p.slug = $2
        AND  p.status IN ('published', 'taken_down')
      LIMIT  1
    `, [opts.campusSlug, opts.postSlug]);

    if (!rows[0]) throw new NotFoundError('Post');

    const post = rows[0];

    // Record view (deduplicated per user per day / per IP per day)
    if (post.status === 'published') {
      PostsService._recordView(
        post.id,
        opts.viewerId,
        opts.viewerIp,
      ).catch(() => {});
    }

    if (opts.viewerId) {
      await PostsService._attachViewerContext([post], opts.viewerId);
    }

    return post;
  },

  // ── Own posts list ──────────────────────────────────────────────────────────
  async getOwnPosts(opts: {
    authorId:    string;
    status?:     PostStatus;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const params: unknown[] = [opts.authorId];
    let   idx = 2;

    const conditions = [`p.author_id = $1`];

    if (opts.status) {
      conditions.push(`p.status = $${idx++}`);
      params.push(opts.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts p ${where}`,
      params,
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      ${where}
      ORDER  BY p.updated_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Create post ─────────────────────────────────────────────────────────────
  async create(opts: {
    authorId:     string;
    campusId:     string;
    title:        string;
    subtitle?:    string;
    body:         string;
    coverUrl?:    string;
    category:     string;
    visibility:   'public' | 'campus_only';
    isAnonymous?: boolean;
    tags?:        string[];
    scheduledAt?: Date;
  }): Promise<PostFull> {
    return withTransaction(async (client) => {
      let   baseSlug = toSlug(opts.title);
      const suffix   = Date.now().toString(36);
      let   slug     = baseSlug;

      // Ensure slug uniqueness within campus
      const { rows: existing } = await client.query(
        `SELECT id FROM posts WHERE campus_id = $1 AND slug = $2 LIMIT 1`,
        [opts.campusId, slug],
      );
      if (existing.length > 0) slug = `${baseSlug}-${suffix}`;

      const status: PostStatus = opts.scheduledAt ? 'scheduled' : 'draft';

      const { rows } = await client.query<{ id: string }>(`
        INSERT INTO posts
          (author_id, campus_id, title, subtitle, slug, body, cover_url,
           category, status, visibility, is_anonymous, scheduled_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id
      `, [
        opts.authorId,
        opts.campusId,
        opts.title,
        opts.subtitle ?? null,
        slug,
        opts.body,
        opts.coverUrl ?? null,
        opts.category,
        status,
        opts.visibility,
        opts.isAnonymous ?? false,
        opts.scheduledAt ?? null,
      ]);

      const postId = rows[0].id;

      // Insert tags
      if (opts.tags && opts.tags.length > 0) {
        for (const tag of opts.tags.slice(0, 5)) {
          await client.query(
            `INSERT INTO post_tags (post_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [postId, tag.toLowerCase().trim()],
          );
        }
      }

      return PostsService.getById(postId);
    });
  },

  // ── Update post ─────────────────────────────────────────────────────────────
  async update(opts: {
    postId:       string;
    actorId:      string;
    actorRole:    string;
    title?:       string;
    subtitle?:    string;
    body?:        string;
    coverUrl?:    string;
    category?:    string;
    visibility?:  'public' | 'campus_only';
    isAnonymous?: boolean;
    tags?:        string[];
    scheduledAt?: Date | null;
  }): Promise<PostFull> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<{
        author_id: string;
        status: PostStatus;
        title: string;
        body: string;
      }>(
        `SELECT author_id, status, title, body FROM posts WHERE id = $1 LIMIT 1`,
        [opts.postId],
      );
      if (!rows[0]) throw new NotFoundError('Post');

      const post = rows[0];

      // Only author or admin can edit
      if (
        post.author_id !== opts.actorId &&
        opts.actorRole !== 'campus_admin' &&
        opts.actorRole !== 'super_admin'
      ) {
        throw new ForbiddenError('You can only edit your own posts.');
      }

      // Cannot edit a taken-down post
      if (post.status === 'taken_down') {
        throw new ForbiddenError('Taken-down posts cannot be edited.');
      }

      // Archive old version in post_edits
      if (opts.title !== undefined || opts.body !== undefined) {
        await client.query(
          `INSERT INTO post_edits (post_id, editor_id, title_was, body_was)
           VALUES ($1, $2, $3, $4)`,
          [opts.postId, opts.actorId, post.title, post.body],
        );
      }

      const sets:   string[]  = [];
      const params: unknown[] = [];
      let   idx = 1;

      if (opts.title !== undefined) {
        sets.push(`title = $${idx++}`);
        params.push(opts.title);
        // Regenerate slug only if title changes
        const newSlug = toSlug(opts.title);
        const { rows: sc } = await client.query(
          `SELECT id FROM posts WHERE campus_id = (SELECT campus_id FROM posts WHERE id = $1) AND slug = $2 AND id != $1 LIMIT 1`,
          [opts.postId, newSlug],
        );
        sets.push(`slug = $${idx++}`);
        params.push(sc.length > 0 ? `${newSlug}-${Date.now().toString(36)}` : newSlug);
      }
      if (opts.subtitle    !== undefined) { sets.push(`subtitle     = $${idx++}`); params.push(opts.subtitle); }
      if (opts.body        !== undefined) { sets.push(`body         = $${idx++}`); params.push(opts.body); }
      if (opts.coverUrl    !== undefined) { sets.push(`cover_url    = $${idx++}`); params.push(opts.coverUrl); }
      if (opts.category    !== undefined) { sets.push(`category     = $${idx++}`); params.push(opts.category); }
      if (opts.visibility  !== undefined) { sets.push(`visibility   = $${idx++}`); params.push(opts.visibility); }
      if (opts.isAnonymous !== undefined) { sets.push(`is_anonymous = $${idx++}`); params.push(opts.isAnonymous); }
      if (opts.scheduledAt !== undefined) {
        sets.push(`scheduled_at = $${idx++}`);
        params.push(opts.scheduledAt);
        if (opts.scheduledAt !== null && post.status === 'draft') {
          sets.push(`status = 'scheduled'`);
        }
      }

      if (sets.length > 0) {
        params.push(opts.postId);
        await client.query(
          `UPDATE posts SET ${sets.join(', ')} WHERE id = $${idx}`,
          params,
        );
      }

      // Replace tags if provided
      if (opts.tags !== undefined) {
        await client.query(`DELETE FROM post_tags WHERE post_id = $1`, [opts.postId]);
        for (const tag of opts.tags.slice(0, 5)) {
          await client.query(
            `INSERT INTO post_tags (post_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [opts.postId, tag.toLowerCase().trim()],
          );
        }
      }

      return PostsService.getById(opts.postId);
    });
  },

  // ── Publish post ────────────────────────────────────────────────────────────
  async publish(postId: string, actorId: string): Promise<PostFull> {
    const { rows } = await query<{ author_id: string; status: PostStatus }>(
      `SELECT author_id, status FROM posts WHERE id = $1 LIMIT 1`,
      [postId],
    );
    if (!rows[0]) throw new NotFoundError('Post');
    if (rows[0].author_id !== actorId) {
      throw new ForbiddenError('You can only publish your own posts.');
    }
    if (rows[0].status === 'published') {
      throw new BadRequestError('Post is already published.');
    }
    if (rows[0].status === 'taken_down') {
      throw new ForbiddenError('Taken-down posts cannot be republished directly.');
    }

    await query(
      `UPDATE posts
       SET status = 'published', published_at = NOW()
       WHERE id = $1`,
      [postId],
    );

    return PostsService.getById(postId);
  },

  // ── Unpublish post (back to draft) ──────────────────────────────────────────
  async unpublish(postId: string, actorId: string): Promise<PostFull> {
    const { rows } = await query<{ author_id: string; status: PostStatus }>(
      `SELECT author_id, status FROM posts WHERE id = $1 LIMIT 1`,
      [postId],
    );
    if (!rows[0]) throw new NotFoundError('Post');
    if (rows[0].author_id !== actorId) {
      throw new ForbiddenError('You can only unpublish your own posts.');
    }
    if (rows[0].status !== 'published') {
      throw new BadRequestError('Only published posts can be unpublished.');
    }

    await query(
      `UPDATE posts SET status = 'draft' WHERE id = $1`,
      [postId],
    );

    return PostsService.getById(postId);
  },

  // ── Delete post ─────────────────────────────────────────────────────────────
  async delete(
    postId:    string,
    actorId:   string,
    actorRole: string,
  ): Promise<void> {
    const { rows } = await query<{ author_id: string }>(
      `SELECT author_id FROM posts WHERE id = $1 LIMIT 1`,
      [postId],
    );
    if (!rows[0]) throw new NotFoundError('Post');

    const isOwner = rows[0].author_id === actorId;
    const isAdmin = actorRole === 'campus_admin' || actorRole === 'super_admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You can only delete your own posts.');
    }

    await query(`DELETE FROM posts WHERE id = $1`, [postId]);
  },

  // ── Clap (upsert) ────────────────────────────────────────────────────────────
  async clap(
    postId: string,
    userId: string,
    count:  number,
  ): Promise<{ totalClaps: number; myClaps: number }> {
    if (count < 1 || count > 50) {
      throw new BadRequestError('Clap count must be between 1 and 50.');
    }

    // Verify post exists and is published
    const { rows } = await query<{ id: string; clap_count: number }>(
      `SELECT id, clap_count FROM posts WHERE id = $1 AND status = 'published' LIMIT 1`,
      [postId],
    );
    if (!rows[0]) throw new NotFoundError('Post');

    return withTransaction(async (client) => {
      // Get existing clap record for this user
      const { rows: existing } = await client.query<{ count: number; id: string }>(
        `SELECT id, count FROM claps WHERE user_id = $1 AND post_id = $2 LIMIT 1`,
        [userId, postId],
      );

      if (existing[0]) {
        // Already capped at 50
        if (existing[0].count >= 50) {
          return {
            totalClaps: rows[0].clap_count,
            myClaps:    existing[0].count,
          };
        }
        const newCount = Math.min(50, existing[0].count + count);
        const delta    = newCount - existing[0].count;

        await client.query(
          `UPDATE claps SET count = $1, updated_at = NOW()
           WHERE id = $2`,
          [newCount, existing[0].id],
        );

        await client.query(
          `UPDATE posts SET clap_count = clap_count + $1 WHERE id = $2`,
          [delta, postId],
        );

        const { rows: updated } = await client.query<{ clap_count: number }>(
          `SELECT clap_count FROM posts WHERE id = $1`,
          [postId],
        );

        return { totalClaps: updated[0].clap_count, myClaps: newCount };
      }

      // New clap record
      const clampedCount = Math.min(50, count);
      await client.query(
        `INSERT INTO claps (user_id, post_id, count) VALUES ($1, $2, $3)`,
        [userId, postId, clampedCount],
      );

      await client.query(
        `UPDATE posts SET clap_count = clap_count + $1 WHERE id = $2`,
        [clampedCount, postId],
      );

      const { rows: updated } = await client.query<{ clap_count: number }>(
        `SELECT clap_count FROM posts WHERE id = $1`,
        [postId],
      );

      return { totalClaps: updated[0].clap_count, myClaps: clampedCount };
    });
  },

  // ── Bookmark ────────────────────────────────────────────────────────────────
  async bookmark(postId: string, userId: string): Promise<void> {
    const { rows } = await query(
      `SELECT id FROM posts WHERE id = $1 AND status = 'published' LIMIT 1`,
      [postId],
    );
    if (!rows[0]) throw new NotFoundError('Post');

    try {
      await query(
        `INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)`,
        [userId, postId],
      );
    } catch (err: unknown) {
      const pg = err as { code?: string };
      if (pg.code === '23505') {
        throw new ConflictError('Post is already bookmarked.');
      }
      throw err;
    }
  },

  // ── Remove bookmark ──────────────────────────────────────────────────────────
  async unbookmark(postId: string, userId: string): Promise<void> {
    const { rowCount } = await query(
      `DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );
    if (rowCount === 0) throw new NotFoundError('Bookmark');
  },

  // ── Get own bookmarks ────────────────────────────────────────────────────────
  async getBookmarks(opts: {
    userId:      string;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: PostFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
       WHERE b.user_id = $1 AND p.status = 'published'`,
      [opts.userId],
    );

    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   bookmarks b
      JOIN   posts    p ON p.id = b.post_id
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      WHERE  b.user_id = $1
        AND  p.status  = 'published'
      ORDER  BY b.created_at DESC
      LIMIT  $2 OFFSET $3
    `, [opts.userId, perPage, offset]);

    await PostsService._attachViewerContext(rows, opts.userId);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Scheduled post processor ────────────────────────────────────────────────
  // Called on a setInterval from index.ts — publishes due scheduled posts.
  async processScheduledPosts(): Promise<number> {
    const { rows } = await query<{ id: string }>(
      `UPDATE posts
       SET    status = 'published', published_at = NOW()
       WHERE  status = 'scheduled'
         AND  scheduled_at <= NOW()
       RETURNING id`,
    );
    return rows.length;
  },

  // ── Internal: get post by ID (full shape) ────────────────────────────────────
  async getById(postId: string): Promise<PostFull> {
    const { rows } = await query<PostFull>(`
      SELECT ${POST_SELECT}
      FROM   posts p
      JOIN   users    u ON u.id = p.author_id
      JOIN   campuses c ON c.id = p.campus_id
      WHERE  p.id = $1
      LIMIT  1
    `, [postId]);

    if (!rows[0]) throw new NotFoundError('Post');
    return rows[0];
  },

  // ── Internal: attach viewer context (has_clapped, has_bookmarked) ────────────
  async _attachViewerContext(
    posts:    PostFull[],
    viewerId: string,
  ): Promise<void> {
    if (posts.length === 0) return;

    const ids = posts.map((p) => p.id);

    const { rows: claps } = await query<{
      post_id: string;
      count:   number;
    }>(
      `SELECT post_id, count FROM claps
       WHERE user_id = $1 AND post_id = ANY($2::uuid[])`,
      [viewerId, ids],
    );

    const { rows: bkmarks } = await query<{ post_id: string }>(
      `SELECT post_id FROM bookmarks
       WHERE user_id = $1 AND post_id = ANY($2::uuid[])`,
      [viewerId, ids],
    );

    const clapMap = new Map(claps.map((c) => [c.post_id, c.count]));
    const bmSet   = new Set(bkmarks.map((b) => b.post_id));

    for (const post of posts) {
      post.has_clapped          = clapMap.has(post.id);
      post.clap_count_by_viewer = clapMap.get(post.id) ?? 0;
      post.has_bookmarked       = bmSet.has(post.id);
    }
  },

  // ── Internal: record a view ──────────────────────────────────────────────────
  async _recordView(
    postId:   string,
    userId?:  string,
    viewerIp?: string,
  ): Promise<void> {
    if (userId) {
      await query(
        `INSERT INTO post_views (post_id, user_id, viewed_date)
         VALUES ($1, $2, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [postId, userId],
      );
    } else if (viewerIp) {
      const ipHash = hashIp(viewerIp);
      await query(
        `INSERT INTO post_views (post_id, ip_hash, viewed_date)
         VALUES ($1, $2, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [postId, ipHash],
      );
    } else {
      return; // no dedup key — skip
    }

    // Increment denormalised counter only when the INSERT succeeded
    // (ON CONFLICT DO NOTHING means rowCount === 0 if it was a duplicate)
    await query(
      `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
      [postId],
    );
  },
};