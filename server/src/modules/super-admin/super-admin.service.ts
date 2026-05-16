import { query } from '../../config/db';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';
import { writeAuditLog } from '../../shared/utils/audit';
import { NotFoundError } from '../../shared/errors/AppError';
export interface PlatformStats {
  totalCampuses: number;
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  openReports: number;
  platformGrowth: string;
}
export interface CampusHealth {
  id: string;
  name: string;
  short_code: string;
  status: string;
  member_count: number;
  post_count: number;
  open_report_count: number;
  last_post_at: Date | null;
}
export interface AuditLogRow {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  campus_id: string | null;
  meta: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
  actor_name: string | null;
}
export interface PlatformSettingsRow {
  id: number;
  platform_name: string;
  platform_tagline: string;
  logo_url: string | null;
  default_language: string;
  registration_mode: string;
  require_campus_email: boolean;
  email_verification_required: boolean;
  max_post_length_words: number;
  max_image_size_mb: number;
  auto_profanity_filter: boolean;
  maintenance_mode: boolean;
  updated_at: Date;
  updated_by: string | null;
}
export interface GlobalContentRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  published_at: Date | null;
  created_at: Date;
  author_id: string;
  campus_id: string;
  author_name: string | null;
  author_username: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  report_count: number;
}
export const SuperAdminService = {
  async getPlatformStats(): Promise<PlatformStats> {
    const [campuses, users, posts, views, reports, recentUsers, prevUsers] = await Promise.all([
      query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM campuses WHERE status = 'active'`),
      query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM users WHERE status = 'active'`),
      query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM posts WHERE status = 'published'`),
      query<{ total: number }>(`SELECT COALESCE(SUM(view_count), 0)::int AS total FROM posts`),
      query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM reports WHERE status = 'pending'`),
      query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM users WHERE status = 'active' AND created_at >= NOW() - INTERVAL '30 days'`,
      ),
      query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM users WHERE status = 'active' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'`,
      ),
    ]);
    const currentPeriod = recentUsers.rows[0]?.count ?? 0;
    const priorPeriod = prevUsers.rows[0]?.count ?? 0;
    let growth: string;
    if (priorPeriod === 0) {
      growth = currentPeriod > 0 ? '+100%' : '+0%';
    } else {
      const pct = ((currentPeriod - priorPeriod) / priorPeriod) * 100;
      growth = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    }
    return {
      totalCampuses: campuses.rows[0]?.count ?? 0,
      totalUsers: users.rows[0]?.count ?? 0,
      totalPosts: posts.rows[0]?.count ?? 0,
      totalViews: views.rows[0]?.total ?? 0,
      openReports: reports.rows[0]?.count ?? 0,
      platformGrowth: growth,
    };
  },
  async getCampusHealth(): Promise<CampusHealth[]> {
    const { rows } = await query<CampusHealth>(`
      SELECT
        c.id, c.name, c.short_code, c.status,
        COUNT(DISTINCT u.id)::int AS member_count,
        COUNT(DISTINCT p.id)::int AS post_count,
        COALESCE(r.open_count, 0)::int AS open_report_count,
        MAX(p.published_at) AS last_post_at
      FROM campuses c
      LEFT JOIN users u ON u.campus_id = c.id AND u.status = 'active'
      LEFT JOIN posts p ON p.campus_id = c.id AND p.status = 'published'
      LEFT JOIN (
        SELECT campus_id, COUNT(*)::int AS open_count
        FROM reports WHERE status = 'pending'
        GROUP BY campus_id
      ) r ON r.campus_id = c.id
      GROUP BY c.id, c.name, c.short_code, c.status, r.open_count
      ORDER BY c.name ASC
    `);
    return rows;
  },
  async getAuditLog(
    opts: {
      actorRole?: string;
      action?: string;
      campusId?: string;
      from?: string;
      to?: string;
      queryParams: Record<string, unknown>;
    },
  ): Promise<{ data: AuditLogRow[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams, 100);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (opts.actorRole) {
      conditions.push(`al.actor_role = $${idx++}`);
      params.push(opts.actorRole);
    }
    if (opts.action) {
      conditions.push(`al.action = $${idx++}`);
      params.push(opts.action);
    }
    if (opts.campusId) {
      conditions.push(`al.campus_id = $${idx++}`);
      params.push(opts.campusId);
    }
    if (opts.from) {
      conditions.push(`al.created_at >= $${idx++}`);
      params.push(opts.from);
    }
    if (opts.to) {
      conditions.push(`al.created_at <= $${idx++}`);
      params.push(opts.to);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM audit_logs al ${where}`,
      params,
    );
    const { rows } = await query<AuditLogRow>(`
      SELECT
        al.*,
        u.full_name AS actor_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_id
      ${where}
      ORDER BY al.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);
    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },
  async getPlatformSettings(): Promise<PlatformSettingsRow> {
    const { rows } = await query<PlatformSettingsRow>(
      `SELECT * FROM platform_settings WHERE id = 1 LIMIT 1`,
    );
    if (!rows[0]) throw new NotFoundError('Platform settings');
    return rows[0];
  },
  async updatePlatformSettings(
    input: Record<string, unknown>,
    updatedById: string,
  ): Promise<PlatformSettingsRow> {
    const allowed = [
      'platform_name', 'platform_tagline', 'logo_url',
      'default_language', 'registration_mode', 'require_campus_email',
      'email_verification_required', 'max_post_length_words',
      'max_image_size_mb', 'auto_profanity_filter', 'maintenance_mode',
    ];
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    for (const key of allowed) {
      if (key in input && input[key] !== undefined) {
        const snakeKey = key;
        sets.push(`${snakeKey} = $${idx++}`);
        params.push(input[key]);
      }
    }
    if (sets.length === 0) {
      const existing = await SuperAdminService.getPlatformSettings();
      return existing;
    }
    params.push(updatedById);
    await query(
      `UPDATE platform_settings
       SET ${sets.join(', ')}, updated_at = NOW(), updated_by = $${idx}
       WHERE id = 1`,
      params,
    );
    writeAuditLog({
      actorId: updatedById,
      actorRole: 'super_admin',
      action: 'platform.settings_update',
      targetType: 'platform',
      targetId: '1',
      meta: { updatedFields: Object.keys(input) },
    });
    return SuperAdminService.getPlatformSettings();
  },
  async getGlobalContent(
    queryParams: Record<string, unknown>,
  ): Promise<{ data: GlobalContentRow[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const campusId = queryParams.campusId as string | undefined;
    const status = queryParams.status as string | undefined;
    const category = queryParams.category as string | undefined;
    if (campusId) {
      conditions.push(`p.campus_id = $${idx++}`);
      params.push(campusId);
    }
    if (status) {
      conditions.push(`p.status = $${idx++}`);
      params.push(status);
    }
    if (category) {
      conditions.push(`p.category = $${idx++}`);
      params.push(category);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const totalResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts p ${where}`,
      params,
    );
    const { rows } = await query<GlobalContentRow>(`
      SELECT
        p.id, p.title, p.slug, p.status, p.visibility,
        p.published_at, p.created_at,
        p.author_id, p.campus_id,
        u.full_name AS author_name,
        u.username AS author_username,
        c.name AS campus_name,
        c.short_code AS campus_short_code,
        (SELECT COUNT(*) FROM reports WHERE target_type = 'post' AND target_id = p.id)::int AS report_count
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN campuses c ON c.id = p.campus_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);
    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(totalResult.rows[0]?.count ?? '0', 10)),
    };
  },
};