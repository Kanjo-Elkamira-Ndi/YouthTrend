/**
 * AuthService — application-layer auth logic.
 *
 * Better Auth owns: credential validation, sessions, OAuth tokens.
 * This service owns: provisioning the users row, campus assignment,
 * username generation, profile updates, and user lookups.
 */

import { PoolClient }             from 'pg';
import { query, withTransaction } from '../../config/db';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../../shared/errors/AppError';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProvisionInput {
  betterAuthId: string;
  email:        string;
  fullName:     string;
  campusId?:    string;
  avatarUrl?:   string;
}

export interface UpdateProfileInput {
  fullName?:    string;
  bio?:         string;
  department?:  string;
  yearOfStudy?: number;
  avatarUrl?:   string;
  matricule?:   string;
}

export interface AppUser {
  id:             string;
  email:          string;
  full_name:      string;
  username:       string;
  role:           string;
  status:         string;
  campus_id:      string | null;
  avatar_url:     string | null;
  bio:            string | null;
  department:     string | null;
  year_of_study:  number | null;
  language_pref:  string;
  matricule:      string | null;
  better_auth_id: string;
  created_at:     Date;
  last_active_at: Date | null;
}

export interface AppUserWithCampus extends AppUser {
  campus_name:       string | null;
  campus_short_code: string | null;
  campus_slug:       string | null;
}

// ── Username generator ────────────────────────────────────────────────────────

async function generateUsername(
  fullName: string,
  client?: PoolClient,
): Promise<string> {
  const base = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .join('.');

  const run = client
    ? (sql: string, p: unknown[]) => client.query(sql, p)
    : (sql: string, p: unknown[]) => query(sql, p);

  const { rows } = await run(
    `SELECT username FROM users WHERE username LIKE $1 ORDER BY username`,
    [`${base}%`],
  );

  const taken = new Set(
    (rows as { username: string }[]).map((r) => r.username),
  );

  if (!taken.has(base)) return base;

  for (let i = 2; i <= 999; i++) {
    const candidate = `${base}.${i}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${base}.${Date.now().toString(36)}`;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AuthService = {

  /**
   * Creates an application users row linked to a Better Auth user.
   * Idempotent — safe to call multiple times for the same betterAuthId.
   */
  async provisionUser(input: ProvisionInput): Promise<AppUserWithCampus> {
    return withTransaction(async (client) => {
      // Return existing row if already provisioned
      const existing = await client.query<AppUserWithCampus>(`
        SELECT u.*,
               c.name       AS campus_name,
               c.short_code AS campus_short_code,
               c.slug       AS campus_slug
        FROM   users u
        LEFT   JOIN campuses c ON c.id = u.campus_id
        WHERE  u.better_auth_id = $1
        LIMIT  1
      `, [input.betterAuthId]);

      if (existing.rows[0]) return existing.rows[0];

      // Validate campus if provided
      if (input.campusId) {
        const { rows } = await client.query(
          `SELECT id FROM campuses WHERE id = $1 AND status = 'active' LIMIT 1`,
          [input.campusId],
        );
        if (rows.length === 0) {
          throw new ConflictError('The selected campus does not exist or is inactive.');
        }
      }

      const username = await generateUsername(input.fullName, client);

      const { rows } = await client.query<AppUser>(`
        INSERT INTO users
          (better_auth_id, email, password_hash, full_name, username,
           campus_id, avatar_url, role, status)
        VALUES ($1, $2, '', $3, $4, $5, $6, 'reader', 'active')
        RETURNING *
      `, [
        input.betterAuthId,
        input.email,
        input.fullName,
        username,
        input.campusId ?? null,
        input.avatarUrl ?? null,
      ]);

      // Re-query with campus join for full response
      const full = await client.query<AppUserWithCampus>(`
        SELECT u.*,
               c.name       AS campus_name,
               c.short_code AS campus_short_code,
               c.slug       AS campus_slug
        FROM   users u
        LEFT   JOIN campuses c ON c.id = u.campus_id
        WHERE  u.id = $1
        LIMIT  1
      `, [rows[0].id]);

      return full.rows[0];
    });
  },

  /**
   * Full profile with campus join — used by /me and /session.
   */
  async findByBetterAuthId(id: string): Promise<AppUserWithCampus | null> {
    const { rows } = await query<AppUserWithCampus>(`
      SELECT u.*,
             c.name       AS campus_name,
             c.short_code AS campus_short_code,
             c.slug       AS campus_slug
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  u.better_auth_id = $1
      LIMIT  1
    `, [id]);
    return rows[0] ?? null;
  },

  /**
   * Find by application user ID (our own UUID, not Better Auth ID).
   */
  async findById(id: string): Promise<AppUserWithCampus | null> {
    const { rows } = await query<AppUserWithCampus>(`
      SELECT u.*,
             c.name       AS campus_name,
             c.short_code AS campus_short_code,
             c.slug       AS campus_slug
      FROM   users u
      LEFT   JOIN campuses c ON c.id = u.campus_id
      WHERE  u.id = $1
      LIMIT  1
    `, [id]);
    return rows[0] ?? null;
  },

  /**
   * Find by email address.
   */
  async findByEmail(email: string): Promise<AppUser | null> {
    const { rows } = await query<AppUser>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    return rows[0] ?? null;
  },

  /**
   * Update own profile fields (non-sensitive — no password or role).
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<AppUserWithCampus> {
    const sets: string[]  = [];
    const vals: unknown[] = [];
    let   idx             = 1;

    if (input.fullName !== undefined) {
      sets.push(`full_name = $${idx++}`); vals.push(input.fullName);
    }
    if (input.bio !== undefined) {
      sets.push(`bio = $${idx++}`); vals.push(input.bio);
    }
    if (input.department !== undefined) {
      sets.push(`department = $${idx++}`); vals.push(input.department);
    }
    if (input.yearOfStudy !== undefined) {
      if (input.yearOfStudy < 1 || input.yearOfStudy > 10) {
        throw new BadRequestError('Year of study must be between 1 and 10.');
      }
      sets.push(`year_of_study = $${idx++}`); vals.push(input.yearOfStudy);
    }
    if (input.avatarUrl !== undefined) {
      sets.push(`avatar_url = $${idx++}`); vals.push(input.avatarUrl);
    }
    if (input.matricule !== undefined) {
      sets.push(`matricule = $${idx++}`); vals.push(input.matricule);
    }

    if (sets.length === 0) {
      throw new BadRequestError('No fields provided to update.');
    }

    sets.push(`updated_at = NOW()`);
    vals.push(userId);

    await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}`,
      vals,
    );

    const updated = await AuthService.findById(userId);
    if (!updated) throw new NotFoundError('User');
    return updated;
  },

  /**
   * Assign (or change) a user's campus.
   */
  async assignCampus(userId: string, campusId: string): Promise<void> {
    const { rows } = await query(
      `SELECT id FROM campuses WHERE id = $1 AND status = 'active' LIMIT 1`,
      [campusId],
    );
    if (rows.length === 0) throw new NotFoundError('Campus');

    await query(
      `UPDATE users SET campus_id = $1, updated_at = NOW() WHERE id = $2`,
      [campusId, userId],
    );
  },

  /**
   * Update language preference.
   */
  async setLanguage(userId: string, lang: 'en' | 'fr'): Promise<void> {
    await query(
      `UPDATE users SET language_pref = $1, updated_at = NOW() WHERE id = $2`,
      [lang, userId],
    );
  },

  /**
   * Touch last_active_at — called on authenticated requests.
   * Fire-and-forget — never awaited by callers.
   */
  async touchActivity(userId: string): Promise<void> {
    await query(
      `UPDATE users SET last_active_at = NOW() WHERE id = $1`,
      [userId],
    );
  },
};