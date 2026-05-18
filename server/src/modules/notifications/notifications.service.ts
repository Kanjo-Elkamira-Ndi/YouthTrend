/**
 * NotificationService — user notification queries and internal event creation.
 */

import { PoolClient, QueryResultRow } from 'pg';
import { query } from '../../config/db';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';
import { buildMeta, PaginationMeta, parsePagination } from '../../shared/utils/response';
import {
  NotificationFull,
  NotificationTargetType,
  NotificationType,
} from '../../shared/types/notification';

const NOTIFICATION_SELECT = `
  n.id,          n.user_id,       n.type,
  n.actor_id,    n.target_type,   n.target_id,
  n.message,     n.read,          n.created_at,
  n.meta,
  actor.full_name AS actor_name,
  actor.username AS actor_username,
  actor.avatar_url AS actor_avatar_url
`;

export interface CreateNotificationPayload {
  actorId?:    string | null;
  targetType?: NotificationTargetType;
  targetId?:   string;
  message?:    string;
  meta?:       Record<string, unknown> | null;
}

function runQuery<T extends QueryResultRow>(
  client: PoolClient | undefined,
  sql: string,
  params: unknown[],
) {
  return client ? client.query<T>(sql, params) : query<T>(sql, params);
}

function defaultMessage(type: NotificationType): string {
  switch (type) {
    case 'clap':
      return 'Someone clapped for your post.';
    case 'comment':
      return 'Someone commented on your post.';
    case 'comment_reply':
      return 'Someone replied to your comment.';
    case 'follow':
      return 'Someone followed you.';
    case 'post_pinned':
      return 'Your post was pinned.';
    case 'post_taken_down':
      return 'Your post was taken down.';
    default:
      return 'You have a new notification.';
  }
}

export const NotificationService = {

  async listForUser(opts: {
    userId:      string;
    read?:       boolean;
    type?:       NotificationType;
    queryParams: Record<string, unknown>;
  }): Promise<{ data: NotificationFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);
    const conditions = [`n.user_id = $1`];
    const params: unknown[] = [opts.userId];
    let idx = 2;

    if (opts.read !== undefined) {
      conditions.push(`n.read = $${idx++}`);
      params.push(opts.read);
    }

    if (opts.type) {
      conditions.push(`n.type = $${idx++}`);
      params.push(opts.type);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notifications n ${where}`,
      params,
    );

    const { rows } = await query<NotificationFull>(`
      SELECT ${NOTIFICATION_SELECT}
      FROM notifications n
      LEFT JOIN users actor ON actor.id = n.actor_id
      ${where}
      ORDER BY n.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  async unreadCount(userId: string): Promise<{ unreadCount: number }> {
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM notifications
       WHERE user_id = $1
         AND read = FALSE`,
      [userId],
    );

    return { unreadCount: parseInt(rows[0]?.count ?? '0', 10) };
  },

  async markRead(userId: string, notificationId: string): Promise<NotificationFull> {
    const { rowCount } = await query(
      `UPDATE notifications
       SET read = TRUE
       WHERE id = $1
         AND user_id = $2`,
      [notificationId, userId],
    );

    if (rowCount === 0) throw new NotFoundError('Notification');

    const notification = await NotificationService.findOwned(userId, notificationId);
    if (!notification) throw new NotFoundError('Notification');
    return notification;
  },

  async markAllRead(userId: string): Promise<{ updatedCount: number }> {
    const { rowCount } = await query(
      `UPDATE notifications
       SET read = TRUE
       WHERE user_id = $1
         AND read = FALSE`,
      [userId],
    );

    return { updatedCount: rowCount ?? 0 };
  },

  async delete(userId: string, notificationId: string): Promise<void> {
    const { rowCount } = await query(
      `DELETE FROM notifications
       WHERE id = $1
         AND user_id = $2`,
      [notificationId, userId],
    );

    if (rowCount === 0) throw new NotFoundError('Notification');
  },

  async createNotification(
    userId: string,
    type: NotificationType,
    payload: CreateNotificationPayload,
    client?: PoolClient,
  ): Promise<void> {
    if (payload.actorId && payload.actorId === userId) return;

    await runQuery(client, `
      INSERT INTO notifications
        (user_id, type, actor_id, target_type, target_id, message, meta)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      type,
      payload.actorId ?? null,
      payload.targetType ?? null,
      payload.targetId ?? null,
      payload.message ?? defaultMessage(type),
      payload.meta ? JSON.stringify(payload.meta) : null,
    ]);
  },

  async notifyPostPinned(
    postAuthorId: string,
    actorId: string,
    postId: string,
    client?: PoolClient,
  ): Promise<void> {
    await NotificationService.createNotification(postAuthorId, 'post_pinned', {
      actorId,
      targetType: 'post',
      targetId: postId,
      message: 'Your post was pinned by a campus admin.',
    }, client);
  },

  async notifyPostTakenDown(
    postAuthorId: string,
    actorId: string,
    postId: string,
    client?: PoolClient,
  ): Promise<void> {
    await NotificationService.createNotification(postAuthorId, 'post_taken_down', {
      actorId,
      targetType: 'post',
      targetId: postId,
      message: 'Your post was taken down.',
    }, client);
  },

  async findOwned(
    userId: string,
    notificationId: string,
  ): Promise<NotificationFull | null> {
    const { rows } = await query<NotificationFull>(`
      SELECT ${NOTIFICATION_SELECT}
      FROM notifications n
      LEFT JOIN users actor ON actor.id = n.actor_id
      WHERE n.id = $1
        AND n.user_id = $2
      LIMIT 1
    `, [notificationId, userId]);

    return rows[0] ?? null;
  },

  parseType(type: string): NotificationType {
    const known = new Set<NotificationType>([
      'clap',
      'comment',
      'comment_reply',
      'follow',
      'post_pinned',
      'post_taken_down',
      'post_approved',
      'campus_announcement',
      'writer_upgrade_approved',
      'writer_upgrade_declined',
      'system',
    ]);

    if (!known.has(type as NotificationType)) {
      throw new BadRequestError('Invalid notification type filter.');
    }

    return type as NotificationType;
  },
};
