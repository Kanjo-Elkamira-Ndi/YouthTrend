/**
 * ModerationService — report filing, queue management, and moderation actions.
 *
 * Flow:
 *   User files report → status: pending → appears in campus queue
 *   Campus Moderator / Admin actions:
 *     - take_down  → post/comment hidden, author notified
 *     - dismiss    → report cleared, no action on content
 *     - escalate   → status: escalated, appears in Super Admin queue
 *   Super Admin actions:
 *     - take_down_platform → overrides any campus decision
 *     - return_to_campus   → sends back to campus queue
 *     - dismiss
 *
 * All actions written to audit_logs.
 * Authors are notified when their content is taken down.
 */

import { query, withTransaction }   from '../../config/db';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '../../shared/errors/AppError';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';
import { NotificationService } from '../notifications/notifications.service';
import { writeAuditLog }            from '../../shared/utils/audit';

export type ReportReason =
  | 'hate_speech' | 'misinformation' | 'spam'
  | 'explicit_content' | 'harassment' | 'other';

export type ReportStatus = 'pending' | 'taken_down' | 'dismissed' | 'escalated';
export type ReportTarget = 'post' | 'comment';

export interface ReportRow {
  id:              string;
  reporter_id:     string;
  campus_id:       string;
  target_type:     ReportTarget;
  target_id:       string;
  reason:          ReportReason;
  description:     string | null;
  status:          ReportStatus;
  actioned_by:     string | null;
  moderator_note:  string | null;
  escalated_to:    string | null;
  created_at:      Date;
  actioned_at:     Date | null;
  // joined
  reporter_name?:     string | null;
  reporter_username?: string | null;
  moderator_name?:    string | null;
  // target content preview
  target_title?:      string | null;   // post title or comment excerpt
  target_author_id?:  string | null;
  target_author_name?: string | null;
  campus_name?:       string | null;
}

interface PostResult {
  id: string;
  author_id: string;
  title: string;
  campus_id: string;
}

interface CommentResult {
  id: string;
  author_id: string;
}

export const ModerationService = {

  // ── File a report ─────────────────────────────────────────────────────────
  async fileReport(opts: {
    reporterId:  string;
    campusId:    string;
    targetType:  ReportTarget;
    targetId:    string;
    reason:      ReportReason;
    description?: string;
  }): Promise<ReportRow> {
    // Verify target exists and get author info
    let targetAuthorId: string | null = null;
    
    if (opts.targetType === 'post') {
      const result = await query<PostResult>(
        `SELECT id, author_id FROM posts WHERE id = $1 AND status = 'published' LIMIT 1`,
        [opts.targetId],
      );
      if (!result.rows[0]) throw new NotFoundError('Post');
      targetAuthorId = result.rows[0].author_id;
    } else {
      const result = await query<CommentResult>(
        `SELECT id, author_id FROM comments WHERE id = $1 AND status = 'visible' LIMIT 1`,
        [opts.targetId],
      );
      if (!result.rows[0]) throw new NotFoundError('Comment');
      targetAuthorId = result.rows[0].author_id;
    }

    // Prevent duplicate reports
    try {
      const result = await query<ReportRow>(`
        INSERT INTO reports
          (reporter_id, campus_id, target_type, target_id, reason, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        opts.reporterId,
        opts.campusId,
        opts.targetType,
        opts.targetId,
        opts.reason,
        opts.description ?? null,
      ]);
      
      // Add target_author_id to the returned row for notification purposes
      const reportRow = result.rows[0];
      (reportRow as any).target_author_id = targetAuthorId;
      
      return reportRow;
    } catch (err: unknown) {
      const pg = err as { code?: string };
      if (pg.code === '23505') {
        throw new ConflictError('You have already reported this content.');
      }
      throw err;
    }
  },

  // ── Campus moderation queue ───────────────────────────────────────────────
  async getCampusQueue(opts: {
    campusId:    string;
    status?:     ReportStatus;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: ReportRow[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const params: unknown[]   = [opts.campusId];
    const conditions          = [`r.campus_id = $1`, `r.status != 'escalated'`];
    let   idx = 2;

    if (opts.status) {
      conditions.push(`r.status = $${idx++}`);
      params.push(opts.status);
    } else {
      // Default: pending first
      conditions.push(`r.status = 'pending'`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM reports r ${where}`,
      params,
    );

    const result = await query<ReportRow>(`
      SELECT
        r.*,
        reporter.full_name  AS reporter_name,
        reporter.username   AS reporter_username,
        mod.full_name       AS moderator_name,
        c.name              AS campus_name,
        CASE
          WHEN r.target_type = 'post'
          THEN (SELECT p.title FROM posts p WHERE p.id = r.target_id)
          ELSE (SELECT LEFT(cm.body, 100) FROM comments cm WHERE cm.id = r.target_id)
        END AS target_title,
        CASE
          WHEN r.target_type = 'post'
          THEN (SELECT p.author_id FROM posts p WHERE p.id = r.target_id)
          ELSE (SELECT cm.author_id FROM comments cm WHERE cm.id = r.target_id)
        END AS target_author_id,
        CASE
          WHEN r.target_type = 'post'
          THEN (SELECT u.full_name FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = r.target_id)
          ELSE (SELECT u.full_name FROM comments cm JOIN users u ON u.id = cm.author_id WHERE cm.id = r.target_id)
        END AS target_author_name
      FROM   reports r
      JOIN   users reporter ON reporter.id = r.reporter_id
      LEFT   JOIN users mod ON mod.id = r.actioned_by
      JOIN   campuses c     ON c.id  = r.campus_id
      ${where}
      ORDER  BY r.created_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: result.rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },

  // ── Super Admin: global escalated queue ───────────────────────────────────
  async getGlobalQueue(opts: {
    status?:     ReportStatus;
    campusId?:   string;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: ReportRow[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const params: unknown[]  = [];
    const conditions: string[] = [];
    let   idx = 1;

    if (opts.status) {
      conditions.push(`r.status = $${idx++}`);
      params.push(opts.status);
    } else {
      // Default: escalated + pending (SA sees everything)
      conditions.push(`r.status IN ('pending', 'escalated')`);
    }

    if (opts.campusId) {
      conditions.push(`r.campus_id = $${idx++}`);
      params.push(opts.campusId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM reports r ${where}`,
      params,
    );

    const result = await query<ReportRow>(`
      SELECT
        r.*,
        reporter.full_name AS reporter_name,
        reporter.username  AS reporter_username,
        mod.full_name      AS moderator_name,
        c.name             AS campus_name,
        CASE
          WHEN r.target_type = 'post'
          THEN (SELECT p.title FROM posts p WHERE p.id = r.target_id)
          ELSE (SELECT LEFT(cm.body, 100) FROM comments cm WHERE cm.id = r.target_id)
        END AS target_title,
        CASE
          WHEN r.target_type = 'post'
          THEN (SELECT p.author_id FROM posts p WHERE p.id = r.target_id)
          ELSE (SELECT cm.author_id FROM comments cm WHERE cm.id = r.target_id)
        END AS target_author_id
      FROM   reports r
      JOIN   users reporter ON reporter.id = r.reporter_id
      LEFT   JOIN users mod ON mod.id = r.actioned_by
      JOIN   campuses c     ON c.id  = r.campus_id
      ${where}
      ORDER  BY r.created_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: result.rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },

  // ── Action a report (Campus Moderator / Admin) ────────────────────────────
  async actionReport(opts: {
    reportId:      string;
    actorId:       string;
    actorRole:     string;
    campusId:      string;
    action:        'take_down' | 'dismiss' | 'escalate';
    moderatorNote?: string;
  }): Promise<ReportRow> {
    const reportResult = await query<ReportRow>(
      `SELECT * FROM reports WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [opts.reportId, opts.campusId],
    );
    if (!reportResult.rows[0]) throw new NotFoundError('Report');

    const report = reportResult.rows[0];
    if (report.status !== 'pending') {
      throw new BadRequestError(`Report has already been ${report.status}.`);
    }

    // Get target author info for notification
    let targetAuthorId: string | null = null;
    let targetTitle: string | null = null;
    
    if (report.target_type === 'post') {
      const postResult = await query<PostResult>(
        `SELECT author_id, title FROM posts WHERE id = $1 LIMIT 1`,
        [report.target_id],
      );
      if (postResult.rows[0]) {
        targetAuthorId = postResult.rows[0].author_id;
        targetTitle = postResult.rows[0].title;
      }
    } else {
      const commentResult = await query<CommentResult>(
        `SELECT author_id FROM comments WHERE id = $1 LIMIT 1`,
        [report.target_id],
      );
      if (commentResult.rows[0]) {
        targetAuthorId = commentResult.rows[0].author_id;
      }
    }

    return withTransaction(async (client) => {
      const newStatus: ReportStatus =
        opts.action === 'take_down' ? 'taken_down'
        : opts.action === 'escalate' ? 'escalated'
        : 'dismissed';

      await client.query(`
        UPDATE reports
        SET    status         = $1,
               actioned_by   = $2,
               moderator_note = $3,
               actioned_at   = NOW()
        WHERE  id = $4
      `, [newStatus, opts.actorId, opts.moderatorNote ?? null, opts.reportId]);

      // Take down the content
      if (opts.action === 'take_down') {
        if (report.target_type === 'post') {
          await client.query(
            `UPDATE posts SET status = 'taken_down' WHERE id = $1`,
            [report.target_id],
          );
        } else {
          await client.query(
            `UPDATE comments SET status = 'hidden' WHERE id = $1`,
            [report.target_id],
          );
        }

        // Notify the content author using NotificationService
        if (targetAuthorId && targetAuthorId !== opts.actorId) {
          const message = targetTitle 
            ? `Your post "${targetTitle}" has been taken down by a campus moderator.`
            : `Your ${report.target_type} has been taken down by a campus moderator.`;
          
          await NotificationService.createNotification(
            targetAuthorId,
            'post_taken_down',
            {
              actorId: opts.actorId,
              targetType: report.target_type,
              targetId: report.target_id,
              message,
            },
            client
          );
        }
      }

      writeAuditLog({
        actorId:    opts.actorId,
        actorRole:  opts.actorRole,
        action:     `report.${opts.action}`,
        targetType: 'report',
        targetId:   opts.reportId,
        campusId:   opts.campusId,
        meta:       {
          targetType:    report.target_type,
          targetId:      report.target_id,
          moderatorNote: opts.moderatorNote,
        },
      });

      const updatedResult = await client.query<ReportRow>(
        `SELECT * FROM reports WHERE id = $1`,
        [opts.reportId],
      );
      return updatedResult.rows[0];
    });
  },

  // ── Super Admin: platform-wide action ────────────────────────────────────
  async adminActionReport(opts: {
    reportId:       string;
    actorId:        string;
    action:         'take_down_platform' | 'return_to_campus' | 'dismiss';
    moderatorNote?: string;
  }): Promise<ReportRow> {
    const reportResult = await query<ReportRow>(
      `SELECT * FROM reports WHERE id = $1 LIMIT 1`,
      [opts.reportId],
    );
    if (!reportResult.rows[0]) throw new NotFoundError('Report');

    const report = reportResult.rows[0];
    
    // Get target author info for notification
    let targetAuthorId: string | null = null;
    let targetTitle: string | null = null;
    
    if (report.target_type === 'post') {
      const postResult = await query<PostResult>(
        `SELECT author_id, title FROM posts WHERE id = $1 LIMIT 1`,
        [report.target_id],
      );
      if (postResult.rows[0]) {
        targetAuthorId = postResult.rows[0].author_id;
        targetTitle = postResult.rows[0].title;
      }
    } else {
      const commentResult = await query<CommentResult>(
        `SELECT author_id FROM comments WHERE id = $1 LIMIT 1`,
        [report.target_id],
      );
      if (commentResult.rows[0]) {
        targetAuthorId = commentResult.rows[0].author_id;
      }
    }

    return withTransaction(async (client) => {
      let newStatus: ReportStatus;

      if (opts.action === 'take_down_platform') {
        newStatus = 'taken_down';

        if (report.target_type === 'post') {
          await client.query(
            `UPDATE posts SET status = 'taken_down' WHERE id = $1`,
            [report.target_id],
          );
        } else {
          await client.query(
            `UPDATE comments SET status = 'hidden' WHERE id = $1`,
            [report.target_id],
          );
        }

        // Notify the content author using NotificationService
        if (targetAuthorId && targetAuthorId !== opts.actorId) {
          const message = targetTitle
            ? `Your post "${targetTitle}" has been taken down by the platform.`
            : `Your ${report.target_type} has been taken down by the platform.`;
          
          await NotificationService.createNotification(
            targetAuthorId,
            'post_taken_down',
            {
              actorId: opts.actorId,
              targetType: report.target_type,
              targetId: report.target_id,
              message,
            },
            client
          );
        }
      } else if (opts.action === 'return_to_campus') {
        newStatus = 'pending'; // back to campus queue
      } else {
        newStatus = 'dismissed';
      }

      await client.query(`
        UPDATE reports
        SET    status          = $1,
               actioned_by    = $2,
               moderator_note = $3,
               actioned_at    = NOW(),
               escalated_to   = CASE WHEN $1 = 'taken_down' THEN $2 ELSE escalated_to END
        WHERE  id = $4
      `, [newStatus, opts.actorId, opts.moderatorNote ?? null, opts.reportId]);

      writeAuditLog({
        actorId:    opts.actorId,
        actorRole:  'super_admin',
        action:     `report.admin.${opts.action}`,
        targetType: 'report',
        targetId:   opts.reportId,
        campusId:   report.campus_id,
        meta:       { targetType: report.target_type, targetId: report.target_id },
      });

      const updatedResult = await client.query<ReportRow>(
        `SELECT * FROM reports WHERE id = $1`,
        [opts.reportId],
      );
      return updatedResult.rows[0];
    });
  },

  // ── Campus Admin: pin / unpin a post ─────────────────────────────────────
  async setPinned(opts: {
    postId:    string;
    campusId:  string;
    pinned:    boolean;
    actorId:   string;
    actorRole: string;
  }): Promise<void> {
    // Max 5 pinned per campus
    if (opts.pinned) {
      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM posts WHERE campus_id = $1 AND is_pinned = TRUE`,
        [opts.campusId],
      );
      if (parseInt(countResult.rows[0]?.count ?? '0', 10) >= 5) {
        throw new BadRequestError('Maximum 5 posts can be pinned per campus.');
      }
    }

    const postResult = await query<PostResult>(
      `SELECT id, campus_id, author_id, title FROM posts WHERE id = $1 AND status = 'published' LIMIT 1`,
      [opts.postId],
    );
    if (!postResult.rows[0]) throw new NotFoundError('Post');
    if (postResult.rows[0].campus_id !== opts.campusId) {
      throw new NotFoundError('Post');
    }

    await query(
      `UPDATE posts SET is_pinned = $1 WHERE id = $2`,
      [opts.pinned, opts.postId],
    );

    // Notify author when post is pinned
    if (opts.pinned) {
      const post = postResult.rows[0];
      if (post.author_id !== opts.actorId) {
        await NotificationService.createNotification(
          post.author_id,
          'post_pinned',
          {
            actorId: opts.actorId,
            targetType: 'post',
            targetId: opts.postId,
            message: `Your post "${post.title}" has been pinned by a campus admin.`,
          }
        );
      }
    }

    writeAuditLog({
      actorId:    opts.actorId,
      actorRole:  opts.actorRole,
      action:     opts.pinned ? 'post.pin' : 'post.unpin',
      targetType: 'post',
      targetId:   opts.postId,
      campusId:   opts.campusId,
    });
  },

  // ── Campus Admin: force-takedown without a report ─────────────────────────
  async takedownPost(opts: {
    postId:    string;
    campusId:  string;
    actorId:   string;
    actorRole: string;
    note?:     string;
  }): Promise<void> {
    const postResult = await query<PostResult>(
      `SELECT author_id, campus_id, title FROM posts WHERE id = $1 LIMIT 1`,
      [opts.postId],
    );
    if (!postResult.rows[0]) throw new NotFoundError('Post');
    if (opts.actorRole !== 'super_admin' && postResult.rows[0].campus_id !== opts.campusId) {
      throw new NotFoundError('Post');
    }

    await query(
      `UPDATE posts SET status = 'taken_down' WHERE id = $1`,
      [opts.postId],
    );

    // Notify author using NotificationService
    const post = postResult.rows[0];
    if (post.author_id !== opts.actorId) {
      await NotificationService.createNotification(
        post.author_id,
        'post_taken_down',
        {
          actorId: opts.actorId,
          targetType: 'post',
          targetId: opts.postId,
          message: `Your post "${post.title}" has been taken down by an admin.`,
        }
      );
    }

    writeAuditLog({
      actorId:    opts.actorId,
      actorRole:  opts.actorRole,
      action:     'post.takedown',
      targetType: 'post',
      targetId:   opts.postId,
      campusId:   opts.campusId,
      meta:       { note: opts.note },
    });
  },
};