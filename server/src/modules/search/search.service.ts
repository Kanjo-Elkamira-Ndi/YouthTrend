import { query } from '../../config/db';
import { BadRequestError } from '../../shared/errors/AppError';
import { parsePagination, buildMeta, PaginationMeta } from '../../shared/utils/response';

export type SearchScope = 'campus' | 'global';
export type SearchType = 'all' | 'posts' | 'writers' | 'campuses';

export interface SearchOpts {
  q: string;
  type: SearchType;
  campusId?: string;
  viewerId?: string;
  scope: SearchScope;
  queryParams: Record<string, unknown>;
}

export interface SearchPostResult {
  id: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  visibility: string;
  is_anonymous: boolean;
  published_at: Date | null;
  view_count: number;
  clap_count: number;
  comment_count: number;
  campus_id: string;
  author_id: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  campus_name: string | null;
  campus_slug: string | null;
}

export interface SearchWriterResult {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  year_of_study: string | null;
  post_count: number;
  follower_count: number;
}

export interface SearchCampusResult {
  id: string;
  name: string;
  slug: string;
  short_code: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  member_count: number;
  post_count: number;
}

export interface SearchAllResult {
  posts: SearchPostResult[];
  writers: SearchWriterResult[];
  campuses: SearchCampusResult[];
}

function sanitizeSearchQuery(q: string): string {
  return q.trim().replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function buildLikePattern(q: string): string {
  return `%${q}%`;
}

export const SearchService = {

  async search(opts: SearchOpts): Promise<SearchAllResult | { data: unknown[]; meta: PaginationMeta }> {
    const raw = opts.q.trim();
    if (raw.length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters.');
    }

    const sanitized = sanitizeSearchQuery(raw);
    const likePattern = buildLikePattern(sanitized);

    if (opts.type === 'all') {
      return SearchService.searchAll({ ...opts, q: sanitized, likePattern });
    }

    return SearchService.searchTyped({ ...opts, q: sanitized, likePattern });
  },

  async searchAll(opts: SearchOpts & { likePattern: string }): Promise<SearchAllResult> {
    const [posts, writers, campuses] = await Promise.all([
      SearchService.queryPosts(opts, 10),
      SearchService.queryWriters(opts, 6),
      SearchService.queryCampuses(opts, 3),
    ]);

    return { posts, writers, campuses };
  },

  async searchTyped(
    opts: SearchOpts & { likePattern: string },
  ): Promise<{ data: unknown[]; meta: PaginationMeta }> {
    const { page, perPage, offset } = parsePagination(opts.queryParams);

    let data: unknown[] = [];
    let total = 0;

    if (opts.type === 'posts') {
      const countResult = await SearchService.countPosts(opts);
      total = countResult;
      data = await SearchService.queryPosts(opts, perPage, offset);
    } else if (opts.type === 'writers') {
      const countResult = await SearchService.countWriters(opts);
      total = countResult;
      data = await SearchService.queryWriters(opts, perPage, offset);
    } else if (opts.type === 'campuses') {
      const countResult = await SearchService.countCampuses(opts);
      total = countResult;
      data = await SearchService.queryCampuses(opts, perPage, offset);
    }

    return { data, meta: buildMeta(page, perPage, total) };
  },

  // ── Post search ─────────────────────────────────────────────────────────

  postConditions(opts: { likePattern: string } & SearchOpts): { where: string[]; params: unknown[] } {
    const where: string[] = [
      `p.status = 'published'`,
      `(p.title ILIKE $1 OR p.body ILIKE $1 OR EXISTS (SELECT 1 FROM post_tags WHERE post_id = p.id AND tag ILIKE $1))`,
    ];
    const params: unknown[] = [opts.likePattern];

    if (opts.scope === 'campus') {
      where.push(`p.campus_id = $2`);
      params.push(opts.campusId ?? '');
    } else {
      where.push(`p.visibility = 'public'`);
    }

    return { where, params };
  },

  async countPosts(opts: { likePattern: string } & SearchOpts): Promise<number> {
    const { where, params } = SearchService.postConditions(opts);
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM posts p WHERE ${where.join(' AND ')}`,
      params,
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  },

  async queryPosts(
    opts: { likePattern: string } & SearchOpts,
    limit: number,
    offset = 0,
  ): Promise<SearchPostResult[]> {
    const { where, params } = SearchService.postConditions(opts);
    const exactQ = opts.q;

    const { rows } = await query<SearchPostResult>(`
      SELECT
        p.id, p.title, p.slug, p.body, p.category, p.visibility,
        p.is_anonymous, p.published_at, p.view_count, p.clap_count, p.comment_count,
        p.campus_id, p.author_id,
        u.full_name       AS author_name,
        u.username        AS author_username,
        u.avatar_url      AS author_avatar_url,
        c.name            AS campus_name,
        c.slug            AS campus_slug
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN campuses c ON c.id = p.campus_id
      WHERE ${where.join(' AND ')}
      ORDER BY
        CASE WHEN p.title ILIKE $${params.length + 1} THEN 2 ELSE 1 END DESC,
        p.published_at DESC
      LIMIT $${params.length + 2} OFFSET $${params.length + 3}
    `, [...params, exactQ, limit, offset]);

    return rows;
  },

  // ── Writer search ───────────────────────────────────────────────────────

  writerConditions(opts: { likePattern: string } & SearchOpts): { where: string[]; params: unknown[] } {
    const where: string[] = [
      `u.status = 'active'`,
      `u.role IN ('writer', 'campus_admin')`,
      `(u.full_name ILIKE $1 OR u.username ILIKE $1 OR COALESCE(u.bio, '') ILIKE $1)`,
    ];
    const params: unknown[] = [opts.likePattern];

    if (opts.scope === 'campus') {
      where.push(`u.campus_id = $2`);
      params.push(opts.campusId ?? '');
    }

    return { where, params };
  },

  async countWriters(opts: { likePattern: string } & SearchOpts): Promise<number> {
    const { where, params } = SearchService.writerConditions(opts);
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM users u WHERE ${where.join(' AND ')}`,
      params,
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  },

  async queryWriters(
    opts: { likePattern: string } & SearchOpts,
    limit: number,
    offset = 0,
  ): Promise<SearchWriterResult[]> {
    const { where, params } = SearchService.writerConditions(opts);

    const { rows } = await query<SearchWriterResult>(`
      SELECT
        u.id, u.full_name, u.username, u.avatar_url, u.bio, u.department, u.year_of_study,
        COUNT(DISTINCT p.id)::int AS post_count,
        COUNT(DISTINCT f.follower_id)::int AS follower_count
      FROM users u
      LEFT JOIN posts p ON p.author_id = u.id AND p.status = 'published'
      LEFT JOIN follows f ON f.following_id = u.id
      WHERE ${where.join(' AND ')}
      GROUP BY u.id
      ORDER BY post_count DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    return rows;
  },

  // ── Campus search ──────────────────────────────────────────────────────

  campusConditions(opts: { likePattern: string } & SearchOpts): { where: string[]; params: unknown[] } {
    const where: string[] = [
      `c.status = 'active'`,
      `(c.name ILIKE $1 OR c.short_code ILIKE $1 OR COALESCE(c.description, '') ILIKE $1)`,
    ];
    const params: unknown[] = [opts.likePattern];

    return { where, params };
  },

  async countCampuses(opts: { likePattern: string } & SearchOpts): Promise<number> {
    const { where, params } = SearchService.campusConditions(opts);
    const { rows } = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM campuses c WHERE ${where.join(' AND ')}`,
      params,
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  },

  async queryCampuses(
    opts: { likePattern: string } & SearchOpts,
    limit: number,
    offset = 0,
  ): Promise<SearchCampusResult[]> {
    const { where, params } = SearchService.campusConditions(opts);

    const { rows } = await query<SearchCampusResult>(`
      SELECT
        c.id, c.name, c.slug, c.short_code, c.description, c.logo_url, c.cover_url,
        COUNT(DISTINCT u.id)::int AS member_count,
        COUNT(DISTINCT p.id)::int AS post_count
      FROM campuses c
      LEFT JOIN users u ON u.campus_id = c.id AND u.status = 'active'
      LEFT JOIN posts p ON p.campus_id = c.id AND p.status = 'published'
      WHERE ${where.join(' AND ')}
      GROUP BY c.id
      ORDER BY member_count DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    return rows;
  },

  // ── Trending ────────────────────────────────────────────────────────────

  async getTrendingSearches(): Promise<string[]> {
    const { rows } = await query<{ category: string }>(`
      SELECT category
      FROM posts
      WHERE status = 'published'
      GROUP BY category
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `);

    return rows.map(r => r.category);
  },
};
