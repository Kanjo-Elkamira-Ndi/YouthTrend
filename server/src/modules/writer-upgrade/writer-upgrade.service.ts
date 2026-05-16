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

export type WriterUpgradeStatus = 'pending' | 'approved' | 'declined';

export interface WriterUpgradeRow {
  id: string;
  user_id: string;
  campus_id: string;
  topics: string[];
  motivation: string;
  sample_title: string;
  sample_body: string;
  external_link: string | null;
  status: WriterUpgradeStatus;
  reviewed_by: string | null;
  reviewer_note: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

export interface WriterUpgradeFull extends WriterUpgradeRow {
  requester_full_name: string;
  requester_username: string;
  requester_email: string;
  requester_avatar_url: string | null;
}

interface CampusNameRow {
  name: string;
}

export const WriterUpgradeService = {

  async submit(input: {
    userId: string;
    campusId: string;
    topics: string[];
    motivation: string;
    sampleTitle: string;
    sampleBody: string;
    externalLink?: string;
  }): Promise<WriterUpgradeRow> {
    const userResult = await query<{ role: string; full_name: string }>(
      `SELECT role, full_name FROM users WHERE id = $1 LIMIT 1`,
      [input.userId],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');
    if (userResult.rows[0].role !== 'reader') {
      throw new BadRequestError('Only users with the reader role can submit a writer upgrade request.');
    }

    const pendingResult = await query<{ id: string }>(
      `SELECT id FROM writer_upgrade_requests
       WHERE user_id = $1 AND status = 'pending'
       LIMIT 1`,
      [input.userId],
    );
    if (pendingResult.rows[0]) {
      throw new ConflictError('You already have a pending writer upgrade request.');
    }

    const declinedResult = await query<{ created_at: Date }>(
      `SELECT created_at FROM writer_upgrade_requests
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
          `You must wait ${remaining} more day(s) before reapplying for a writer upgrade.`,
        );
      }
    }

    const { rows } = await query<WriterUpgradeRow>(`
      INSERT INTO writer_upgrade_requests
        (user_id, campus_id, topics, motivation, sample_title, sample_body, external_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      input.userId,
      input.campusId,
      input.topics,
      input.motivation,
      input.sampleTitle,
      input.sampleBody,
      input.externalLink ?? null,
    ]);

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
          message: `New writer upgrade request from ${fullName}`,
        },
      ).catch(() => {});
    }

    return request;
  },

  async listForCampus(
    campusId: string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: WriterUpgradeFull[]; meta: PaginationMeta }> {
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
      `SELECT COUNT(*)::text AS count FROM writer_upgrade_requests r ${where}`,
      params,
    );

    const { rows } = await query<WriterUpgradeFull>(`
      SELECT
        r.*,
        u.full_name  AS requester_full_name,
        u.username   AS requester_username,
        u.email      AS requester_email,
        u.avatar_url AS requester_avatar_url
      FROM writer_upgrade_requests r
      JOIN users u ON u.id = r.user_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },

  async getById(requestId: string, campusId: string): Promise<WriterUpgradeFull> {
    const { rows } = await query<WriterUpgradeFull>(`
      SELECT
        r.*,
        u.full_name  AS requester_full_name,
        u.username   AS requester_username,
        u.email      AS requester_email,
        u.avatar_url AS requester_avatar_url
      FROM writer_upgrade_requests r
      JOIN users u ON u.id = r.user_id
      WHERE r.id = $1 AND r.campus_id = $2
      LIMIT 1
    `, [requestId, campusId]);

    if (!rows[0]) throw new NotFoundError('Writer upgrade request');
    return rows[0];
  },

  async approve(
    requestId: string,
    reviewerId: string,
    campusId: string,
  ): Promise<WriterUpgradeRow> {
    const requestResult = await query<WriterUpgradeRow>(
      `SELECT * FROM writer_upgrade_requests WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [requestId, campusId],
    );
    if (!requestResult.rows[0]) throw new NotFoundError('Writer upgrade request');
    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request has already been ${request.status}.`);
    }

    const userResult = await query<{ email: string; full_name: string }>(
      `SELECT email, full_name FROM users WHERE id = $1 LIMIT 1`,
      [request.user_id],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');

    const campusResult = await query<CampusNameRow>(
      `SELECT name FROM campuses WHERE id = $1 LIMIT 1`,
      [campusId],
    );
    const campusName = campusResult.rows[0]?.name ?? 'your campus';

    const updated = await withTransaction(async (client) => {
      await client.query(
        `UPDATE writer_upgrade_requests
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [reviewerId, requestId],
      );

      await client.query(
        `UPDATE users SET role = 'writer' WHERE id = $1`,
        [request.user_id],
      );

      const updatedResult = await client.query<WriterUpgradeRow>(
        `SELECT * FROM writer_upgrade_requests WHERE id = $1`,
        [requestId],
      );
      return updatedResult.rows[0];
    });

    NotificationService.createNotification(
      request.user_id,
      'writer_upgrade_approved',
      {
        actorId: reviewerId,
        targetType: 'user',
        targetId: request.user_id,
        message: `Your writer upgrade request has been approved! You can now publish posts on ${campusName}.`,
      },
    ).catch(() => {});

    EmailService.sendWriterUpgradeApproved({
      to: userResult.rows[0].email,
      name: userResult.rows[0].full_name,
      campusName,
    }).catch(() => {});

    writeAuditLog({
      actorId: reviewerId,
      actorRole: 'campus_admin',
      action: 'writer_upgrade.approve',
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
  ): Promise<WriterUpgradeRow> {
    const requestResult = await query<WriterUpgradeRow>(
      `SELECT * FROM writer_upgrade_requests WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [requestId, campusId],
    );
    if (!requestResult.rows[0]) throw new NotFoundError('Writer upgrade request');
    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      throw new BadRequestError(`Request has already been ${request.status}.`);
    }

    const userResult = await query<{ email: string; full_name: string }>(
      `SELECT email, full_name FROM users WHERE id = $1 LIMIT 1`,
      [request.user_id],
    );
    if (!userResult.rows[0]) throw new NotFoundError('User');

    const campusResult = await query<CampusNameRow>(
      `SELECT name FROM campuses WHERE id = $1 LIMIT 1`,
      [campusId],
    );
    const campusName = campusResult.rows[0]?.name ?? 'your campus';

    await query(
      `UPDATE writer_upgrade_requests
       SET status = 'declined', reviewed_by = $1, reviewer_note = $2, reviewed_at = NOW()
       WHERE id = $3`,
      [reviewerId, reviewerNote ?? null, requestId],
    );

    NotificationService.createNotification(
      request.user_id,
      'writer_upgrade_declined',
      {
        actorId: reviewerId,
        targetType: 'user',
        targetId: request.user_id,
        message: 'Your writer upgrade request was not approved.',
      },
    ).catch(() => {});

    EmailService.sendWriterUpgradeDeclined({
      to: userResult.rows[0].email,
      name: userResult.rows[0].full_name,
      campusName,
      note: reviewerNote,
    }).catch(() => {});

    writeAuditLog({
      actorId: reviewerId,
      actorRole: 'campus_admin',
      action: 'writer_upgrade.decline',
      targetType: 'user',
      targetId: request.user_id,
      campusId,
      meta: { requestId, reviewerNote },
    });

    const { rows } = await query<WriterUpgradeRow>(
      `SELECT * FROM writer_upgrade_requests WHERE id = $1`,
      [requestId],
    );
    return rows[0];
  },

  async getOwnRequests(userId: string): Promise<WriterUpgradeRow[]> {
    const { rows } = await query<WriterUpgradeRow>(`
      SELECT * FROM writer_upgrade_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return rows;
  },
};
