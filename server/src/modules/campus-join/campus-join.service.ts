import { query, withTransaction } from '../../config/db';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../shared/errors/AppError';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';
import { NotificationService } from '../notifications/notifications.service';
import { writeAuditLog } from '../../shared/utils/audit';
import { EmailService } from '../../services/email.service';

export type CampusJoinStatus = 'pending' | 'approved' | 'declined';

export interface CampusJoinRow {
  id: string;
  user_id: string;
  campus_id: string;
  status: CampusJoinStatus;
  reviewed_by: string | null;
  reviewer_note: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

export interface CampusJoinFull extends CampusJoinRow {
  requester_full_name: string;
  requester_username: string;
  requester_email: string;
  requester_avatar_url: string | null;
  campus_name: string;
  campus_short_code: string;
}

export const CampusJoinService = {

  async submit(input: {
    userId: string;
    campusId: string;
  }): Promise<CampusJoinRow> {
    const userResult = await query<{ campus_id: string | null; full_name: string }>(
      `SELECT campus_id, full_name FROM users WHERE id = $1 LIMIT 1`,
      [input.userId],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');

    if (userResult.rows[0].campus_id) {
      throw new BadRequestError('You already belong to a campus.');
    }

    const pendingResult = await query<{ id: string }>(
      `SELECT id FROM campus_join_requests
       WHERE user_id = $1 AND status = 'pending'
       LIMIT 1`,
      [input.userId],
    );
    if (pendingResult.rows[0]) {
      throw new ConflictError('You already have a pending campus join request.');
    }

    const declinedResult = await query<{ created_at: Date }>(
      `SELECT created_at FROM campus_join_requests
       WHERE user_id = $1 AND status = 'declined'
       ORDER BY created_at DESC
       LIMIT 1`,
      [input.userId],
    );
    if (declinedResult.rows[0]) {
      const lastDeclined = new Date(declinedResult.rows[0].created_at);
      const now = new Date();
      const diffMs = now.getTime() - lastDeclined.getTime();
      const daysSince = diffMs / (1000 * 60 * 60 * 24);
      if (daysSince < 14) {
        const remaining = Math.ceil(14 - daysSince);
        throw new BadRequestError(
          `You must wait ${remaining} more day(s) before reapplying.`,
        );
      }
    }

    const { rows } = await query<CampusJoinRow>(`
      INSERT INTO campus_join_requests
        (user_id, campus_id)
      VALUES ($1, $2)
      RETURNING *
    `, [input.userId, input.campusId]);

    const request = rows[0];
    const fullName = userResult.rows[0].full_name;

    const adminsResult = await query<{ id: string }>(
      `SELECT id FROM users
       WHERE campus_id = $1 AND role = 'campus_admin' AND status = 'active'`,
      [input.campusId],
    );

    for (const admin of adminsResult.rows) {
      NotificationService.createNotification(
        admin.id,
        'system',
        {
          actorId: input.userId,
          targetType: 'user',
          targetId: input.userId,
          message: `${fullName} requested to join your campus`,
        },
      ).catch(() => {});
    }

    return request;
  },

  async listForCampus(
    campusId: string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: CampusJoinFull[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);
    const params: unknown[] = [campusId];
    const conditions = [`r.campus_id = $1`];
    let idx = 2;

    const statusFilter = queryParams.status as string | undefined;
    if (statusFilter && ['pending', 'approved', 'declined'].includes(statusFilter)) {
      conditions.push(`r.status = $${idx++}`);
      params.push(statusFilter);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM campus_join_requests r ${where}`,
      params,
    );

    const { rows } = await query<CampusJoinFull>(`
      SELECT
        r.*,
        u.full_name   AS requester_full_name,
        u.username    AS requester_username,
        u.email       AS requester_email,
        u.avatar_url  AS requester_avatar_url,
        c.name        AS campus_name,
        c.short_code  AS campus_short_code
      FROM campus_join_requests r
      JOIN users    u ON u.id = r.user_id
      JOIN campuses c ON c.id = r.campus_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },

  async getOwnRequest(userId: string): Promise<CampusJoinFull | null> {
    const { rows } = await query<CampusJoinFull>(`
      SELECT
        r.*,
        u.full_name   AS requester_full_name,
        u.username    AS requester_username,
        u.email       AS requester_email,
        u.avatar_url  AS requester_avatar_url,
        c.name        AS campus_name,
        c.short_code  AS campus_short_code
      FROM campus_join_requests r
      JOIN users    u ON u.id = r.user_id
      JOIN campuses c ON c.id = r.campus_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 1
    `, [userId]);

    return rows[0] ?? null;
  },

  async getById(requestId: string, campusId: string): Promise<CampusJoinFull> {
    const { rows } = await query<CampusJoinFull>(`
      SELECT
        r.*,
        u.full_name   AS requester_full_name,
        u.username    AS requester_username,
        u.email       AS requester_email,
        u.avatar_url  AS requester_avatar_url,
        c.name        AS campus_name,
        c.short_code  AS campus_short_code
      FROM campus_join_requests r
      JOIN users    u ON u.id = r.user_id
      JOIN campuses c ON c.id = r.campus_id
      WHERE r.id = $1 AND r.campus_id = $2
      LIMIT 1
    `, [requestId, campusId]);

    if (!rows[0]) throw new NotFoundError('Campus join request');
    return rows[0];
  },

  async approve(
    requestId: string,
    reviewerId: string,
    campusId: string,
  ): Promise<CampusJoinRow> {
    const requestResult = await query<CampusJoinRow>(
      `SELECT * FROM campus_join_requests WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [requestId, campusId],
    );
    if (!requestResult.rows[0]) throw new NotFoundError('Campus join request');
    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request has already been ${request.status}.`);
    }

    const userResult = await query<{ email: string; full_name: string }>(
      `SELECT email, full_name FROM users WHERE id = $1 LIMIT 1`,
      [request.user_id],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');

    const campusResult = await query<{ name: string }>(
      `SELECT name FROM campuses WHERE id = $1 LIMIT 1`,
      [campusId],
    );
    const campusName = campusResult.rows[0]?.name ?? 'your campus';

    const updated = await withTransaction(async (client) => {
      await client.query(
        `UPDATE campus_join_requests
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [reviewerId, requestId],
      );

      await client.query(
        `UPDATE users SET campus_id = $1, role = CASE WHEN role = 'reader' THEN 'writer' ELSE role END WHERE id = $2`,
        [campusId, request.user_id],
      );

      const updatedResult = await client.query<CampusJoinRow>(
        `SELECT * FROM campus_join_requests WHERE id = $1`,
        [requestId],
      );
      return updatedResult.rows[0];
    });

    NotificationService.createNotification(
      request.user_id,
      'campus_join_approved',
      {
        actorId: reviewerId,
        targetType: 'user',
        targetId: request.user_id,
        message: `Your request to join ${campusName} has been approved!`,
      },
    ).catch(() => {});

    writeAuditLog({
      actorId: reviewerId,
      actorRole: 'campus_admin',
      action: 'campus_join.approve',
      targetType: 'user',
      targetId: request.user_id,
      campusId,
      meta: { requestId },
    });

    return updated;
  },

  async decline(
    requestId: string,
    reviewerId: string,
    campusId: string,
    reviewerNote?: string,
  ): Promise<CampusJoinRow> {
    const requestResult = await query<CampusJoinRow>(
      `SELECT * FROM campus_join_requests WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [requestId, campusId],
    );
    if (!requestResult.rows[0]) throw new NotFoundError('Campus join request');
    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request has already been ${request.status}.`);
    }

    const userResult = await query<{ email: string; full_name: string }>(
      `SELECT email, full_name FROM users WHERE id = $1 LIMIT 1`,
      [request.user_id],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');

    const campusResult = await query<{ name: string }>(
      `SELECT name FROM campuses WHERE id = $1 LIMIT 1`,
      [campusId],
    );
    const campusName = campusResult.rows[0]?.name ?? 'your campus';

    await query(
      `UPDATE campus_join_requests
       SET status = 'declined', reviewed_by = $1, reviewer_note = $2, reviewed_at = NOW()
       WHERE id = $3`,
      [reviewerId, reviewerNote ?? null, requestId],
    );

    NotificationService.createNotification(
      request.user_id,
      'campus_join_declined',
      {
        actorId: reviewerId,
        targetType: 'user',
        targetId: request.user_id,
        message: `Your request to join ${campusName} was declined.`,
      },
    ).catch(() => {});

    writeAuditLog({
      actorId: reviewerId,
      actorRole: 'campus_admin',
      action: 'campus_join.decline',
      targetType: 'user',
      targetId: request.user_id,
      campusId,
      meta: { requestId, reviewerNote },
    });

    const { rows } = await query<CampusJoinRow>(
      `SELECT * FROM campus_join_requests WHERE id = $1`,
      [requestId],
    );
    return rows[0];
  },
};
