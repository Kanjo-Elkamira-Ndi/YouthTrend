/**
 * CommentsService — post comments, one-level replies, and comment notifications.
 */

import { PoolClient } from 'pg';
import { query, withTransaction } from '../../config/db';
import { buildMeta, PaginationMeta, parsePagination } from '../../shared/utils/response';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../shared/errors/AppError';
import { CommentFull, CommentThread } from '../../shared/types/comment';
import { UserRole } from '../../shared/types/express';

const COMMENT_SELECT = `
  c.id,          c.post_id,       c.author_id,
  c.parent_id,   c.body,          c.status,
  c.created_at,  c.updated_at,
  u.full_name AS author_name,
  u.username  AS author_username,
  u.avatar_url AS author_avatar_url
`;

export const CommentsService = {

  async listForPost(
    postId: string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: CommentThread[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);

    await CommentsService.ensureCommentablePost(postId);

    const { rows: total } = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count
      FROM comments
      WHERE post_id = $1
        AND parent_id IS NULL
        AND status = 'visible'
    `, [postId]);

    const { rows: parents } = await query<CommentFull>(`
      SELECT ${COMMENT_SELECT}
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.post_id = $1
        AND c.parent_id IS NULL
        AND c.status = 'visible'
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `, [postId, perPage, offset]);

    if (parents.length === 0) {
      return {
        data: [],
        meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
      };
    }

    const parentIds = parents.map((comment) => comment.id);
    const { rows: replies } = await query<CommentFull>(`
      SELECT ${COMMENT_SELECT}
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.parent_id = ANY($1::uuid[])
        AND c.status = 'visible'
      ORDER BY c.created_at ASC
    `, [parentIds]);

    const repliesByParent = new Map<string, CommentFull[]>();
    for (const reply of replies) {
      if (!reply.parent_id) continue;
      const group = repliesByParent.get(reply.parent_id) ?? [];
      group.push(reply);
      repliesByParent.set(reply.parent_id, group);
    }

    return {
      data: parents.map((comment) => ({
        ...comment,
        replies: repliesByParent.get(comment.id) ?? [],
      })),
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  async create(opts: {
    postId:   string;
    authorId: string;
    body:     string;
    parentId?: string;
  }): Promise<CommentFull> {
    return withTransaction(async (client) => {
      const { rows: posts } = await client.query<{
        id: string;
        author_id: string;
        title: string;
      }>(`
        SELECT id, author_id, title
        FROM posts
        WHERE id = $1
          AND status = 'published'
        LIMIT 1
      `, [opts.postId]);

      if (!posts[0]) throw new NotFoundError('Post');

      if (opts.parentId) {
        const { rows: parents } = await client.query<{ id: string; parent_id: string | null }>(`
          SELECT id, parent_id
          FROM comments
          WHERE id = $1
            AND post_id = $2
            AND status = 'visible'
          LIMIT 1
        `, [opts.parentId, opts.postId]);

        if (!parents[0]) {
          throw new NotFoundError('Parent comment');
        }

        if (parents[0].parent_id) {
          throw new BadRequestError('Replies can only be one level deep.');
        }
      }

      const { rows } = await client.query<{ id: string }>(`
        INSERT INTO comments (post_id, author_id, parent_id, body)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [
        opts.postId,
        opts.authorId,
        opts.parentId ?? null,
        opts.body,
      ]);

      await client.query(
        `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
        [opts.postId],
      );

      if (posts[0].author_id !== opts.authorId) {
        await client.query(`
          INSERT INTO notifications
            (user_id, type, actor_id, target_type, target_id, message)
          VALUES
            ($1, $2, $3, 'comment', $4, $5)
        `, [
          posts[0].author_id,
          opts.parentId ? 'comment_reply' : 'comment',
          opts.authorId,
          rows[0].id,
          opts.parentId
            ? 'Someone replied in the comments on your post.'
            : 'Someone commented on your post.',
        ]);
      }

      const created = await CommentsService.findById(rows[0].id, client);
      if (!created) throw new NotFoundError('Comment');
      return created;
    });
  },

  async update(opts: {
    commentId: string;
    actorId:   string;
    body:      string;
  }): Promise<CommentFull> {
    const { rows } = await query<{ author_id: string; status: string }>(
      `SELECT author_id, status FROM comments WHERE id = $1 LIMIT 1`,
      [opts.commentId],
    );

    if (!rows[0]) throw new NotFoundError('Comment');
    if (rows[0].status !== 'visible') {
      throw new ForbiddenError('This comment can no longer be edited.');
    }
    if (rows[0].author_id !== opts.actorId) {
      throw new ForbiddenError('You can only edit your own comments.');
    }

    await query(
      `UPDATE comments SET body = $1, updated_at = NOW() WHERE id = $2`,
      [opts.body, opts.commentId],
    );

    const updated = await CommentsService.findById(opts.commentId);
    if (!updated) throw new NotFoundError('Comment');
    return updated;
  },

  async delete(opts: {
    commentId:   string;
    actorId:     string;
    actorRole:   UserRole;
    actorCampusId: string | null;
  }): Promise<void> {
    const { rows } = await query<{
      author_id: string;
      post_id: string;
      campus_id: string;
      status: string;
    }>(`
      SELECT c.author_id, c.post_id, c.status, p.campus_id
      FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = $1
      LIMIT 1
    `, [opts.commentId]);

    if (!rows[0]) throw new NotFoundError('Comment');
    if (rows[0].status !== 'visible') return;

    const isOwner = rows[0].author_id === opts.actorId;
    const isSuperAdmin = opts.actorRole === 'super_admin';
    const isCampusAdmin =
      opts.actorRole === 'campus_admin' &&
      opts.actorCampusId === rows[0].campus_id;

    if (!isOwner && !isSuperAdmin && !isCampusAdmin) {
      throw new ForbiddenError('You can only delete your own comments.');
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE comments SET status = 'deleted', updated_at = NOW() WHERE id = $1`,
        [opts.commentId],
      );

      await client.query(
        `UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1`,
        [rows[0].post_id],
      );
    });
  },

  async findById(commentId: string, client?: PoolClient): Promise<CommentFull | null> {
    const run = client
      ? (sql: string, params: unknown[]) => client.query<CommentFull>(sql, params)
      : (sql: string, params: unknown[]) => query<CommentFull>(sql, params);

    const { rows } = await run(`
      SELECT ${COMMENT_SELECT}
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.id = $1
      LIMIT 1
    `, [commentId]);

    return rows[0] ?? null;
  },

  async ensureCommentablePost(postId: string): Promise<void> {
    const { rows } = await query<{ id: string }>(
      `SELECT id FROM posts WHERE id = $1 AND status = 'published' LIMIT 1`,
      [postId],
    );

    if (!rows[0]) throw new NotFoundError('Post');
  },
};
