import { query } from '../../config/db';
import {
  BadRequestError,
  NotFoundError,
} from '../../shared/errors/AppError';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';
import { writeAuditLog } from '../../shared/utils/audit';
import { UserRole } from '../../shared/types/express';

export type AnnouncementVisibility = 'all_students' | 'writers_only' | 'moderators_only';

export interface AnnouncementRow {
  id: string;
  campus_id: string;
  author_id: string;
  title: string;
  body: string;
  visibility: AnnouncementVisibility;
  is_pinned: boolean;
  view_count: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
}

function visibilityFilter(viewerRole: UserRole | undefined): { clause: string } {
  if (!viewerRole || viewerRole === 'reader') {
    return { clause: `a.visibility = 'all_students'` };
  }
  if (viewerRole === 'writer') {
    return { clause: `a.visibility IN ('all_students', 'writers_only')` };
  }
  return { clause: 'TRUE' };
}

export const AnnouncementsService = {

  async listForCampus(
    campusId: string,
    viewerRole: UserRole | undefined,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: AnnouncementRow[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);
    const params: unknown[] = [campusId];
    const vis = visibilityFilter(viewerRole);

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM announcements a
       WHERE a.campus_id = $1
         AND ${vis.clause}`,
      params,
    );

    const { rows } = await query<AnnouncementRow>(`
      SELECT a.*
      FROM announcements a
      WHERE a.campus_id = $1
        AND ${vis.clause}
      ORDER BY a.is_pinned DESC, a.published_at DESC
      LIMIT $2 OFFSET $3
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(countResult.rows[0]?.count ?? '0', 10)),
    };
  },

  async getById(
    id: string,
    campusId: string,
    viewerRole: UserRole | undefined,
  ): Promise<AnnouncementRow> {
    const vis = visibilityFilter(viewerRole);

    const { rows } = await query<AnnouncementRow>(`
      SELECT a.*
      FROM announcements a
      WHERE a.id = $1
        AND a.campus_id = $2
        AND ${vis.clause}
      LIMIT 1
    `, [id, campusId]);

    if (!rows[0]) throw new NotFoundError('Announcement');

    query(
      `UPDATE announcements SET view_count = view_count + 1 WHERE id = $1`,
      [id],
    ).catch(() => {});

    return rows[0];
  },

  async create(input: {
    campusId: string;
    authorId: string;
    title: string;
    body: string;
    visibility: AnnouncementVisibility;
    isPinned?: boolean;
  }): Promise<AnnouncementRow> {
    if (input.isPinned) {
      const pinResult = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM announcements
         WHERE campus_id = $1 AND is_pinned = TRUE`,
        [input.campusId],
      );
      if (parseInt(pinResult.rows[0]?.count ?? '0', 10) >= 5) {
        throw new BadRequestError('Maximum 5 announcements can be pinned per campus.');
      }
    }

    const { rows } = await query<AnnouncementRow>(`
      INSERT INTO announcements
        (campus_id, author_id, title, body, visibility, is_pinned)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      input.campusId,
      input.authorId,
      input.title,
      input.body,
      input.visibility,
      input.isPinned ?? false,
    ]);

    const announcement = rows[0];

    if (input.visibility === 'all_students') {
      const membersResult = await query<{ id: string }>(
        `SELECT id FROM users
         WHERE campus_id = $1 AND status = 'active' AND role != 'super_admin'`,
        [input.campusId],
      );

      const userIds = membersResult.rows.map(r => r.id);

      for (let i = 0; i < userIds.length; i += 500) {
        const batch = userIds.slice(i, i + 500);
        const values = batch.map((_, j) => {
          const base = j * 6;
          return `($${base + 1}, 'campus_announcement', $${base + 2}, 'announcement', $${base + 3}, $${base + 4}, NOW())`;
        }).join(', ');

        const flatParams: unknown[] = [];
        for (const uid of batch) {
          flatParams.push(uid, input.authorId, announcement.id, `New announcement: ${input.title}`);
        }

        await query(
          `INSERT INTO notifications
             (user_id, type, actor_id, target_type, target_id, message, created_at)
           VALUES ${values}`,
          flatParams,
        ).catch((err: Error) => {
          console.error('[Announcements] Failed to bulk-notify:', err.message);
        });
      }
    }

    writeAuditLog({
      actorId: input.authorId,
      actorRole: 'campus_admin',
      action: 'announcement.create',
      targetType: 'announcement',
      targetId: announcement.id,
      campusId: input.campusId,
      meta: { title: input.title, visibility: input.visibility },
    });

    return announcement;
  },

  async update(
    id: string,
    campusId: string,
    actorId: string,
    input: {
      title?: string;
      body?: string;
      visibility?: AnnouncementVisibility;
      isPinned?: boolean;
    },
  ): Promise<AnnouncementRow> {
    const existing = await query<AnnouncementRow>(
      `SELECT * FROM announcements WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [id, campusId],
    );
    if (!existing.rows[0]) throw new NotFoundError('Announcement');

    if (input.isPinned === true && !existing.rows[0].is_pinned) {
      const pinResult = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM announcements
         WHERE campus_id = $1 AND is_pinned = TRUE AND id != $2`,
        [campusId, id],
      );
      if (parseInt(pinResult.rows[0]?.count ?? '0', 10) >= 5) {
        throw new BadRequestError('Maximum 5 announcements can be pinned per campus.');
      }
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      sets.push(`title = $${idx++}`);
      params.push(input.title);
    }
    if (input.body !== undefined) {
      sets.push(`body = $${idx++}`);
      params.push(input.body);
    }
    if (input.visibility !== undefined) {
      sets.push(`visibility = $${idx++}`);
      params.push(input.visibility);
    }
    if (input.isPinned !== undefined) {
      sets.push(`is_pinned = $${idx++}`);
      params.push(input.isPinned);
    }

    if (sets.length === 0) {
      throw new BadRequestError('No fields provided to update.');
    }

    params.push(id);
    await query(
      `UPDATE announcements SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
      params,
    );

    const { rows } = await query<AnnouncementRow>(
      `SELECT * FROM announcements WHERE id = $1`,
      [id],
    );

    return rows[0];
  },

  async delete(
    id: string,
    campusId: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    const existing = await query<AnnouncementRow>(
      `SELECT * FROM announcements WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [id, campusId],
    );
    if (!existing.rows[0]) throw new NotFoundError('Announcement');

    await query(
      `DELETE FROM announcements WHERE id = $1`,
      [id],
    );

    writeAuditLog({
      actorId,
      actorRole,
      action: 'announcement.delete',
      targetType: 'announcement',
      targetId: id,
      campusId,
      meta: { title: existing.rows[0].title },
    });
  },
};
