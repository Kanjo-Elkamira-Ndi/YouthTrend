/**
 * UsersService — all database logic for the users module.
 *
 * Covers:
 *   - Public profile lookup by username
 *   - Follow / unfollow
 *   - Followers / following lists (paginated)
 *   - Campus-Admin scoped: list campus users, change role, suspend/activate
 *   - Super Admin: global user list, platform-wide ban, delete account
 */

import { query, withTransaction } from '../../config/db';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../../shared/errors/AppError';
import {
  parsePagination,
  buildMeta,
  PaginationMeta,
} from '../../shared/utils/response';
import { NotificationService } from '../notifications/notifications.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole   = 'super_admin' | 'campus_admin' | 'moderator' | 'writer' | 'reader';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'unverified';

export interface PublicProfile {
  id:                string;
  full_name:         string;
  username:          string;
  role:              UserRole;
  avatar_url:        string | null;
  bio:               string | null;
  department:        string | null;
  year_of_study:     number | null;
  created_at:        Date;
  campus_id:         string | null;
  campus_name:       string | null;
  campus_short_code: string | null;
  post_count:        number;
  follower_count:    number;
  following_count:   number;
  total_claps_received: number;
  is_following?:     boolean;   // set when viewed by an authenticated user
}

export interface UserListItem {
  id:            string;
  full_name:     string;
  username:      string;
  email:         string;
  role:          UserRole;
  status:        UserStatus;
  campus_id:     string | null;
  campus_name:   string | null;
  campus_short_code: string | null;
  avatar_url:    string | null;
  department:    string | null;
  created_at:    Date;
  last_active_at: Date | null;
  post_count:    number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const UsersService = {

  // ── Public profile by username ────────────────────────────────────────────
  async getPublicProfile(
    username:           string,
    viewerUserId?:      string,
  ): Promise<PublicProfile> {
    const { rows } = await query<PublicProfile>(`
      SELECT
        u.id,             u.full_name,       u.username,
        u.role,           u.avatar_url,      u.bio,
        u.department,     u.year_of_study,   u.created_at,
        c.id         AS campus_id,
        c.name       AS campus_name,
        c.short_code AS campus_short_code,
        (SELECT COUNT(*)::int FROM posts
         WHERE author_id = u.id AND status = 'published')          AS post_count,
        (SELECT COUNT(*)::int FROM follows
         WHERE following_id = u.id)                                 AS follower_count,
        (SELECT COUNT(*)::int FROM follows
         WHERE follower_id  = u.id)                                 AS following_count,
        (SELECT COALESCE(SUM(cl.count),0)::int
         FROM claps cl
         JOIN posts p ON p.id = cl.post_id
         WHERE p.author_id = u.id)                                  AS total_claps_received
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  u.username = $1
        AND  u.status   = 'active'
      LIMIT  1
    `, [username]);

    if (!rows[0]) throw new NotFoundError('User');

    // Check if the viewing user follows this profile
    if (viewerUserId) {
      const { rows: fRows } = await query(
        `SELECT 1 FROM follows
         WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
        [viewerUserId, rows[0].id],
      );
      rows[0].is_following = fRows.length > 0;
    }

    return rows[0];
  },

  // ── Follow a user ─────────────────────────────────────────────────────────
  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself.');
    }

    // Verify target exists and is active
    const { rows } = await query(
      `SELECT id FROM users WHERE id = $1 AND status = 'active' LIMIT 1`,
      [followingId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    try {
      await withTransaction(async (client) => {
        await client.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
        [followerId, followingId],
        );

        await NotificationService.createNotification(followingId, 'follow', {
          actorId:    followerId,
          targetType: 'user',
          targetId:   followerId,
          message:    'Someone followed you.',
        }, client);
      });
    } catch (err: unknown) {
      const pg = err as { code?: string };
      if (pg.code === '23505') {
        throw new ConflictError('You are already following this user.');
      }
      throw err;
    }
  },

  // ── Unfollow a user ───────────────────────────────────────────────────────
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const { rowCount } = await query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId],
    );
    if (rowCount === 0) {
      throw new NotFoundError('Follow relationship');
    }
  },

  // ── List followers (paginated) ────────────────────────────────────────────
  async getFollowers(
    userId:    string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: PublicProfile[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM follows WHERE following_id = $1`,
      [userId],
    );

    const { rows } = await query<PublicProfile>(`
      SELECT
        u.id,             u.full_name,   u.username,
        u.role,           u.avatar_url,  u.bio,
        u.department,     u.created_at,
        c.id         AS campus_id,
        c.name       AS campus_name,
        c.short_code AS campus_short_code
      FROM   follows f
      JOIN   users u ON u.id = f.follower_id
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  f.following_id = $1
        AND  u.status       = 'active'
      ORDER  BY f.created_at DESC
      LIMIT  $2 OFFSET $3
    `, [userId, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── List following (paginated) ────────────────────────────────────────────
  async getFollowing(
    userId:      string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: PublicProfile[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM follows WHERE follower_id = $1`,
      [userId],
    );

    const { rows } = await query<PublicProfile>(`
      SELECT
        u.id,             u.full_name,   u.username,
        u.role,           u.avatar_url,  u.bio,
        u.department,     u.created_at,
        c.id         AS campus_id,
        c.name       AS campus_name,
        c.short_code AS campus_short_code
      FROM   follows f
      JOIN   users u ON u.id = f.following_id
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  f.follower_id = $1
        AND  u.status      = 'active'
      ORDER  BY f.created_at DESC
      LIMIT  $2 OFFSET $3
    `, [userId, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ═════════════════════════════════════════════════════════════════════════
  // Campus Admin — scoped to one campus
  // ═════════════════════════════════════════════════════════════════════════

  // ── List users on a campus (paginated, filterable) ───────────────────────
  async listCampusUsers(
    campusId:    string,
    queryParams: Record<string, unknown>,
  ): Promise<{ data: UserListItem[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);

    const conditions = [`u.campus_id = $1`];
    const params: unknown[] = [campusId];
    let idx = 2;

    if (queryParams.role) {
      conditions.push(`u.role = $${idx++}`);
      params.push(queryParams.role);
    }

    if (queryParams.status) {
      conditions.push(`u.status = $${idx++}`);
      params.push(queryParams.status);
    }

    if (queryParams.search) {
      conditions.push(
        `(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.username ILIKE $${idx})`,
      );
      params.push(`%${queryParams.search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users u ${where}`,
      params,
    );

    const { rows } = await query<UserListItem>(`
      SELECT
        u.id,             u.full_name,     u.username,
        u.email,          u.role,          u.status,
        u.campus_id,      u.avatar_url,    u.department,
        u.created_at,     u.last_active_at,
        c.name       AS campus_name,
        c.short_code AS campus_short_code,
        (SELECT COUNT(*)::int FROM posts
         WHERE author_id = u.id AND status = 'published') AS post_count
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      ${where}
      ORDER  BY u.created_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Change a campus user's role ───────────────────────────────────────────
  async changeCampusUserRole(
    campusId:  string,
    userId:    string,
    newRole:   UserRole,
    actorId:   string,
  ): Promise<void> {
    if (userId === actorId) {
      throw new BadRequestError('You cannot change your own role.');
    }

    const { rows } = await query(
      `SELECT id, role FROM users WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [userId, campusId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    const currentRole = (rows[0] as { role: UserRole }).role;
    if (currentRole === 'super_admin') {
      throw new ForbiddenError('Super Admin role cannot be changed.');
    }

    // Campus Admin cannot grant campus_admin or super_admin
    const allowedRoles: UserRole[] = ['moderator', 'writer', 'reader'];
    if (!allowedRoles.includes(newRole)) {
      throw new ForbiddenError(
        'Campus Admins can only assign: moderator, writer, or reader.',
      );
    }

    await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`,
      [newRole, userId],
    );
  },

  // ── Suspend or activate a campus user ─────────────────────────────────────
  async setCampusUserStatus(
    campusId: string,
    userId:   string,
    status:   'active' | 'suspended',
    actorId:  string,
  ): Promise<void> {
    if (userId === actorId) {
      throw new BadRequestError('You cannot change your own status.');
    }

    const { rows } = await query(
      `SELECT id, role, status FROM users
       WHERE id = $1 AND campus_id = $2 LIMIT 1`,
      [userId, campusId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    const user = rows[0] as { role: UserRole; status: UserStatus };

    if (user.role === 'super_admin') {
      throw new ForbiddenError('Super Admin accounts cannot be suspended.');
    }
    if (user.status === status) {
      throw new BadRequestError(`User is already ${status}.`);
    }

    await query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, userId],
    );
  },

  // ── Send campus invite email ──────────────────────────────────────────────
  // Returns the emails that were not already registered
  async validateInviteEmails(
    emails: string[],
  ): Promise<{ valid: string[]; alreadyRegistered: string[] }> {
    if (emails.length === 0) return { valid: [], alreadyRegistered: [] };

    const placeholders = emails
      .map((_, i) => `$${i + 1}`)
      .join(', ');

    const { rows } = await query<{ email: string }>(
      `SELECT email FROM users WHERE email = ANY(ARRAY[${placeholders}])`,
      emails,
    );

    const registered = new Set(rows.map((r) => r.email));
    return {
      valid:             emails.filter((e) => !registered.has(e)),
      alreadyRegistered: emails.filter((e) =>  registered.has(e)),
    };
  },

  // ═════════════════════════════════════════════════════════════════════════
  // Super Admin — global scope
  // ═════════════════════════════════════════════════════════════════════════

  // ── Global user list (all campuses, all roles) ────────────────────────────
  async listAllUsers(
    queryParams: Record<string, unknown>,
  ): Promise<{ data: UserListItem[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(queryParams);

    const conditions: string[] = [];
    const params: unknown[]    = [];
    let   idx = 1;

    if (queryParams.campusId) {
      conditions.push(`u.campus_id = $${idx++}`);
      params.push(queryParams.campusId);
    }
    if (queryParams.role) {
      conditions.push(`u.role = $${idx++}`);
      params.push(queryParams.role);
    }
    if (queryParams.status) {
      conditions.push(`u.status = $${idx++}`);
      params.push(queryParams.status);
    }
    if (queryParams.search) {
      conditions.push(
        `(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.username ILIKE $${idx})`,
      );
      params.push(`%${queryParams.search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const { rows: total } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users u ${where}`,
      params,
    );

    const { rows } = await query<UserListItem>(`
      SELECT
        u.id,             u.full_name,     u.username,
        u.email,          u.role,          u.status,
        u.campus_id,      u.avatar_url,    u.department,
        u.created_at,     u.last_active_at,
        c.name       AS campus_name,
        c.short_code AS campus_short_code,
        (SELECT COUNT(*)::int FROM posts
         WHERE author_id = u.id AND status = 'published') AS post_count
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      ${where}
      ORDER  BY u.created_at DESC
      LIMIT  $${idx} OFFSET $${idx + 1}
    `, [...params, perPage, offset]);

    return {
      data: rows,
      meta: buildMeta(page, perPage, parseInt(total[0]?.count ?? '0', 10)),
    };
  },

  // ── Change any user's role (Super Admin) ──────────────────────────────────
  async changeUserRole(
    userId:  string,
    newRole: UserRole,
    actorId: string,
  ): Promise<void> {
    if (userId === actorId) {
      throw new BadRequestError('You cannot change your own role.');
    }

    const { rows } = await query(
      `SELECT id, role FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`,
      [newRole, userId],
    );
  },

  // ── Platform-wide ban ─────────────────────────────────────────────────────
  async banUser(userId: string, actorId: string): Promise<void> {
    if (userId === actorId) {
      throw new BadRequestError('You cannot ban yourself.');
    }

    const { rows } = await query(
      `SELECT id, role FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    if ((rows[0] as { role: UserRole }).role === 'super_admin') {
      throw new ForbiddenError('Super Admin accounts cannot be banned.');
    }

    await query(
      `UPDATE users SET status = 'banned', updated_at = NOW() WHERE id = $1`,
      [userId],
    );
  },

  // ── Delete user account ───────────────────────────────────────────────────
  async deleteUser(
    userId:       string,
    actorId:      string,
    confirmation: string,
  ): Promise<void> {
    if (confirmation !== 'DELETE') {
      throw new BadRequestError(
        'Delete confirmation required. Send { "confirm": "DELETE" } in the request body.',
      );
    }
    if (userId === actorId) {
      throw new BadRequestError('You cannot delete your own account this way.');
    }

    const { rows } = await query(
      `SELECT id, role FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows[0]) throw new NotFoundError('User');

    if ((rows[0] as { role: UserRole }).role === 'super_admin') {
      throw new ForbiddenError('Super Admin accounts cannot be deleted.');
    }

    await withTransaction(async (client) => {
      // Anonymise posts rather than cascade-delete them
      await client.query(
        `UPDATE posts SET is_anonymous = TRUE WHERE author_id = $1`,
        [userId],
      );
      await client.query(
        `DELETE FROM users WHERE id = $1`,
        [userId],
      );
    });
  },
};
