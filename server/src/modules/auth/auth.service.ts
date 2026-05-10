/**
 * Auth Service — YouthTrend application-layer auth logic.
 *
 * Better Auth handles credential validation, sessions, and OAuth.
 * This service handles everything that happens AFTER Better Auth
 * authenticates a user:
 *
 *   1. Creating the application users row linked to the better_auth user
 *   2. Assigning the campus on signup
 *   3. Generating a unique username
 */

import { query, withTransaction } from '../../config/db';
import { ConflictError }          from '../../shared/errors/AppError';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProvisionUserInput {
  betterAuthId: string;
  email:        string;
  fullName:     string;
  campusId?:    string;      // optional at signup — student can set later
  avatarUrl?:   string;      // from OAuth profile photo
}

export interface AppUser {
  id:        string;
  email:     string;
  fullName:  string;
  username:  string;
  role:      string;
  status:    string;
  campusId:  string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a unique username from a full name.
 * e.g. "Amara Ngono" → "amara.ngono" (or "amara.ngono.2" if taken)
 */
async function generateUsername(fullName: string): Promise<string> {
  const base = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .join('.');

  // Check if base is available
  const { rows } = await query(
    'SELECT username FROM users WHERE username LIKE $1 ORDER BY username',
    [`${base}%`],
  );

  if (rows.length === 0) return base;

  // Find the next available suffix
  const taken = new Set(rows.map((r) => (r as { username: string }).username));
  if (!taken.has(base)) return base;

  for (let i = 2; i <= 999; i++) {
    const candidate = `${base}.${i}`;
    if (!taken.has(candidate)) return candidate;
  }

  // Absolute fallback — append timestamp fragment
  return `${base}.${Date.now().toString(36)}`;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AuthService = {

  /**
   * Called after Better Auth creates a user (signup or first OAuth login).
   * Creates the corresponding row in our application `users` table.
   *
   * Idempotent — safe to call multiple times for the same betterAuthId.
   */
  async provisionUser(input: ProvisionUserInput): Promise<AppUser> {
    return withTransaction(async (client) => {
      // Check if already provisioned
      const existing = await client.query<AppUser>(
        'SELECT * FROM users WHERE better_auth_id = $1 LIMIT 1',
        [input.betterAuthId],
      );
      if (existing.rows[0]) return existing.rows[0];

      // Validate campus exists if provided
      if (input.campusId) {
        const campus = await client.query(
          `SELECT id FROM campuses
           WHERE id = $1 AND status = 'active' LIMIT 1`,
          [input.campusId],
        );
        if (campus.rows.length === 0) {
          throw new ConflictError('The selected campus does not exist or is inactive.');
        }
      }

      const username = await generateUsername(input.fullName);

      const { rows } = await client.query<AppUser>(`
        INSERT INTO users
          (better_auth_id, email, password_hash, full_name, username,
           campus_id, avatar_url, role, status)
        VALUES
          ($1, $2, '', $3, $4, $5, $6, 'reader', 'active')
        RETURNING *
      `, [
        input.betterAuthId,
        input.email,
        input.fullName,
        username,
        input.campusId ?? null,
        input.avatarUrl ?? null,
      ]);

      return rows[0];
    });
  },

  /**
   * Look up an application user by their Better Auth user ID.
   */
  async findByBetterAuthId(betterAuthId: string): Promise<AppUser | null> {
    const { rows } = await query<AppUser>(
      'SELECT * FROM users WHERE better_auth_id = $1 LIMIT 1',
      [betterAuthId],
    );
    return rows[0] ?? null;
  },

  /**
   * Look up an application user by email.
   */
  async findByEmail(email: string): Promise<AppUser | null> {
    const { rows } = await query<AppUser>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    return rows[0] ?? null;
  },

  /**
   * Assign or update a user's campus after signup.
   */
  async assignCampus(userId: string, campusId: string): Promise<void> {
    const campus = await query(
      `SELECT id FROM campuses WHERE id = $1 AND status = 'active' LIMIT 1`,
      [campusId],
    );
    if (campus.rows.length === 0) {
      throw new ConflictError('Campus not found or inactive.');
    }

    await query(
      'UPDATE users SET campus_id = $1, updated_at = NOW() WHERE id = $2',
      [campusId, userId],
    );
  },
};