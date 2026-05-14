/**
 * CampusService — all database logic for the campus module.
 *
 * Responsibilities:
 *   - List, find, create, update, status-toggle, delete campuses
 *   - Slug + short_code uniqueness enforcement
 *   - Settings JSONB merge
 *   - Member/post count aggregation
 */

import { query, withTransaction } from '../../config/db';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../../shared/errors/AppError';
import {
  CampusRow,
  CampusSettings,
  DEFAULT_CAMPUS_SETTINGS,
} from '../../shared/types/campus';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateCampusInput {
  name:           string;
  shortCode:      string;
  description?:   string;
  allowedDomains?: string[];
}

export interface UpdateCampusInput {
  name?:           string;
  description?:    string;
  logoUrl?:        string;
  coverUrl?:       string;
  allowedDomains?: string[];
  settings?:       Partial<CampusSettings>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── Service ───────────────────────────────────────────────────────────────────

export const CampusService = {

  // ── List all active campuses (public) ────────────────────────────────────────
  async list(opts: {
    includeInactive?: boolean;
    search?:          string;
  } = {}): Promise<CampusRow[]> {
    const conditions: string[]  = [];
    const params:     unknown[] = [];
    let   idx = 1;

    if (!opts.includeInactive) {
      conditions.push(`c.status = 'active'`);
    }

    if (opts.search) {
      conditions.push(
        `(c.name ILIKE $${idx} OR c.short_code ILIKE $${idx})`,
      );
      params.push(`%${opts.search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const { rows } = await query<CampusRow>(`
      SELECT
        c.*,
        COUNT(DISTINCT u.id)::int  AS member_count,
        COUNT(DISTINCT p.id)::int  AS post_count
      FROM  campuses c
      LEFT  JOIN users u ON u.campus_id = c.id AND u.status = 'active'
      LEFT  JOIN posts  p ON p.campus_id = c.id AND p.status = 'published'
      ${where}
      GROUP BY c.id
      ORDER BY c.name ASC
    `, params);

    return rows;
  },

  // ── Find by slug (public) ─────────────────────────────────────────────────
  async findBySlug(slug: string): Promise<CampusRow> {
    const { rows } = await query<CampusRow>(`
      SELECT
        c.*,
        COUNT(DISTINCT u.id)::int  AS member_count,
        COUNT(DISTINCT p.id)::int  AS post_count
      FROM  campuses c
      LEFT  JOIN users u ON u.campus_id = c.id AND u.status = 'active'
      LEFT  JOIN posts  p ON p.campus_id = c.id AND p.status = 'published'
      WHERE c.slug = $1
      GROUP BY c.id
      LIMIT 1
    `, [slug]);

    if (!rows[0]) throw new NotFoundError('Campus');
    return rows[0];
  },

  // ── Find by ID ────────────────────────────────────────────────────────────
  async findById(id: string): Promise<CampusRow> {
    const { rows } = await query<CampusRow>(`
      SELECT
        c.*,
        COUNT(DISTINCT u.id)::int  AS member_count,
        COUNT(DISTINCT p.id)::int  AS post_count
      FROM  campuses c
      LEFT  JOIN users u ON u.campus_id = c.id AND u.status = 'active'
      LEFT  JOIN posts  p ON p.campus_id = c.id AND p.status = 'published'
      WHERE c.id = $1
      GROUP BY c.id
      LIMIT 1
    `, [id]);

    if (!rows[0]) throw new NotFoundError('Campus');
    return rows[0];
  },

  // ── Create campus (Super Admin only) ──────────────────────────────────────
  async create(input: CreateCampusInput): Promise<CampusRow> {
    const slug      = toSlug(input.name);
    const shortCode = input.shortCode.toUpperCase().trim();

    // Uniqueness checks
    const { rows: existing } = await query(
      `SELECT id FROM campuses WHERE slug = $1 OR short_code = $2 LIMIT 1`,
      [slug, shortCode],
    );
    if (existing.length > 0) {
      throw new ConflictError(
        'A campus with this name or short code already exists.',
      );
    }

    const { rows } = await query<CampusRow>(`
      INSERT INTO campuses
        (name, slug, short_code, description, allowed_domains, settings)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      input.name.trim(),
      slug,
      shortCode,
      input.description?.trim() ?? null,
      input.allowedDomains ?? [],
      JSON.stringify(DEFAULT_CAMPUS_SETTINGS),
    ]);

    return rows[0];
  },

  // ── Update campus (Campus Admin of that campus OR Super Admin) ────────────
  async update(id: string, input: UpdateCampusInput): Promise<CampusRow> {
    // Verify campus exists first
    await CampusService.findById(id);

    const sets:   string[]  = [];
    const params: unknown[] = [];
    let   idx = 1;

    if (input.name !== undefined) {
      sets.push(`name = $${idx++}`);
      params.push(input.name.trim());

      // Regenerate slug when name changes
      const newSlug = toSlug(input.name);
      const { rows: slugCheck } = await query(
        `SELECT id FROM campuses WHERE slug = $1 AND id != $2 LIMIT 1`,
        [newSlug, id],
      );
      if (slugCheck.length > 0) {
        throw new ConflictError('A campus with this name already exists.');
      }
      sets.push(`slug = $${idx++}`);
      params.push(newSlug);
    }

    if (input.description !== undefined) {
      sets.push(`description = $${idx++}`);
      params.push(input.description.trim());
    }

    if (input.logoUrl !== undefined) {
      sets.push(`logo_url = $${idx++}`);
      params.push(input.logoUrl);
    }

    if (input.coverUrl !== undefined) {
      sets.push(`cover_url = $${idx++}`);
      params.push(input.coverUrl);
    }

    if (input.allowedDomains !== undefined) {
      sets.push(`allowed_domains = $${idx++}`);
      params.push(input.allowedDomains);
    }

    // Settings: merge with existing JSONB rather than full replace
    if (input.settings !== undefined) {
      const validKeys: (keyof CampusSettings)[] = [
        'registrationMode',
        'postApprovalRequired',
        'anonymousPostingEnabled',
        'autoApproveWriters',
        'moderationSlaHours',
      ];

      // Only write known keys to prevent arbitrary JSON injection
      const safeSettings: Partial<CampusSettings> = {};
      for (const key of validKeys) {
        if (key in input.settings) {
          (safeSettings as Record<string, unknown>)[key] =
            (input.settings as Record<string, unknown>)[key];
        }
      }

      if (Object.keys(safeSettings).length > 0) {
        // jsonb || operator merges — new keys added, existing keys updated
        sets.push(`settings = settings || $${idx++}::jsonb`);
        params.push(JSON.stringify(safeSettings));
      }
    }

    if (sets.length === 0) {
      throw new BadRequestError('No fields provided to update.');
    }

    params.push(id);
    await query(
      `UPDATE campuses SET ${sets.join(', ')} WHERE id = $${idx}`,
      params,
    );

    return CampusService.findById(id);
  },

  // ── Toggle campus status (Super Admin only) ────────────────────────────────
  async setStatus(
    id: string,
    status: 'active' | 'inactive',
  ): Promise<CampusRow> {
    const campus = await CampusService.findById(id);

    if (campus.status === status) {
      throw new BadRequestError(
        `Campus is already ${status}.`,
      );
    }

    await query(
      `UPDATE campuses SET status = $1 WHERE id = $2`,
      [status, id],
    );

    return CampusService.findById(id);
  },

  // ── Delete campus (Super Admin only) ─────────────────────────────────────
  // Requires explicit confirmation string to prevent accidental deletion.
  async delete(id: string, confirmation: string): Promise<void> {
    if (confirmation !== 'DELETE') {
      throw new BadRequestError(
        'Delete confirmation required. Send { "confirm": "DELETE" } in the request body.',
      );
    }

    // Check campus exists
    await CampusService.findById(id);

    // Soft check: warn if campus has active members
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM users WHERE campus_id = $1`,
      [id],
    );
    const memberCount = (rows[0] as { count: number }).count;
    if (memberCount > 0) {
      // Still allow deletion — CASCADE handles FK cleanup — but this is
      // surfaced in the response for Super Admin awareness.
      console.warn(
        `[Campus] Deleting campus ${id} which has ${memberCount} members.`,
      );
    }

    // Hard delete — all related rows cascade via FK ON DELETE CASCADE
    return withTransaction(async (client) => {
      // Null out campus_id on users instead of deleting them
      await client.query(
        `UPDATE users SET campus_id = NULL WHERE campus_id = $1`,
        [id],
      );
      await client.query(
        `DELETE FROM campuses WHERE id = $1`,
        [id],
      );
    });
  },
};