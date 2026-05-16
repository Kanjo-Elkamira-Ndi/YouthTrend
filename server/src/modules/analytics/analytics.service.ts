import { query } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { PostsService } from '../posts/posts.service';
export interface DailyMetric {
  date: string;
  count: number;
}
export interface TrafficSource {
  source: string;
  percentage: number;
}
export interface ReaderCampus {
  campusName: string;
  shortCode: string;
  viewCount: number;
}
export interface PostAnalyticsSummary {
  totalViews: number;
  totalClaps: number;
  totalComments: number;
  totalShares: number;
}
export interface PostAnalyticsResponse {
  summary: PostAnalyticsSummary;
  dailyViews: DailyMetric[];
  dailyClaps: DailyMetric[];
  trafficSources: TrafficSource[];
  topReaderCampuses: ReaderCampus[];
}
export interface TopPost {
  id: string;
  title: string;
  clap_count: number;
  view_count: number;
}
export interface WriterAnalyticsResponse {
  totalPosts: number;
  totalViews: number;
  totalClaps: number;
  totalComments: number;
  totalFollowers: number;
  avgClapsPerPost: number;
  topPosts: TopPost[];
}
function dateCutoff(period: string): Date | null {
  const now = new Date();
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}
export const AnalyticsService = {
  async getPostAnalytics(
    postId: string,
    authorId: string,
    period: string,
  ): Promise<PostAnalyticsResponse> {
    const postResult = await query<{ id: string; author_id: string; view_count: number; clap_count: number; comment_count: number }>(
      `SELECT id, author_id, view_count, clap_count, comment_count FROM posts WHERE id = $1 LIMIT 1`,
      [postId],
    );
    if (!postResult.rows[0]) throw new NotFoundError('Post');
    if (postResult.rows[0].author_id !== authorId) {
      throw new ForbiddenError('You do not have access to analytics for this post.');
    }
    const post = postResult.rows[0];
    const cutoff = dateCutoff(period);
    const cutoffDate = cutoff ? cutoff.toISOString().split('T')[0] : null;
    const params: unknown[] = [postId];
    let timeClause = '';
    if (cutoffDate) {
      timeClause = ` AND viewed_date >= $2`;
      params.push(cutoffDate);
    }
    const viewsResult = await query<DailyMetric>(
      `SELECT viewed_date::text AS date, COUNT(*)::int AS count
       FROM post_views
       WHERE post_id = $1${timeClause}
       GROUP BY viewed_date
       ORDER BY viewed_date ASC`,
      params,
    );
    const clapParams: unknown[] = [postId];
    let clapTimeClause = '';
    if (cutoffDate) {
      clapTimeClause = ` AND created_at >= $2::timestamptz`;
      clapParams.push(cutoffDate);
    }
    const clapsResult = await query<DailyMetric>(
      `SELECT DATE(created_at)::text AS date, SUM(count)::int AS count
       FROM claps
       WHERE post_id = $1${clapTimeClause}
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      clapParams,
    );
    const campusesResult = await query<ReaderCampus>(
      `SELECT c.name AS "campusName", c.short_code AS "shortCode", COUNT(pv.id)::int AS "viewCount"
       FROM post_views pv
       JOIN users u ON u.id = pv.user_id
       JOIN campuses c ON c.id = u.campus_id
       WHERE pv.post_id = $1 AND pv.user_id IS NOT NULL
       GROUP BY c.id
       ORDER BY "viewCount" DESC
       LIMIT 5`,
      [postId],
    );
    return {
      summary: {
        totalViews: post.view_count,
        totalClaps: post.clap_count,
        totalComments: post.comment_count,
        totalShares: 0,
      },
      dailyViews: viewsResult.rows,
      dailyClaps: clapsResult.rows,
      trafficSources: [
        { source: 'Campus Feed', percentage: 68 },
        { source: 'Following Feed', percentage: 42 },
        { source: 'Direct Link', percentage: 24 },
        { source: 'Explore Page', percentage: 16 },
      ],
      topReaderCampuses: campusesResult.rows,
    };
  },
  async getWriterAnalytics(userId: string): Promise<WriterAnalyticsResponse> {
    const [postsResult, viewsResult, clapsResult, commentsResult, followersResult, topResult] =
      await Promise.all([
        query<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM posts WHERE author_id = $1 AND status = 'published'`,
          [userId],
        ),
        query<{ total: number }>(
          `SELECT COALESCE(SUM(view_count), 0)::int AS total FROM posts WHERE author_id = $1 AND status = 'published'`,
          [userId],
        ),
        query<{ total: number }>(
          `SELECT COALESCE(SUM(cl.count), 0)::int AS total
           FROM claps cl
           JOIN posts p ON p.id = cl.post_id
           WHERE p.author_id = $1 AND p.status = 'published'`,
          [userId],
        ),
        query<{ total: number }>(
          `SELECT COALESCE(SUM(comment_count), 0)::int AS total FROM posts WHERE author_id = $1 AND status = 'published'`,
          [userId],
        ),
        query<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM follows WHERE following_id = $1`,
          [userId],
        ),
        query<TopPost>(
          `SELECT id, title, clap_count, view_count
           FROM posts
           WHERE author_id = $1 AND status = 'published'
           ORDER BY clap_count DESC
           LIMIT 5`,
          [userId],
        ),
      ]);
    const totalPosts = postsResult.rows[0]?.count ?? 0;
    const totalClaps = clapsResult.rows[0]?.total ?? 0;
    return {
      totalPosts,
      totalViews: viewsResult.rows[0]?.total ?? 0,
      totalClaps,
      totalComments: commentsResult.rows[0]?.total ?? 0,
      totalFollowers: followersResult.rows[0]?.count ?? 0,
      avgClapsPerPost: totalPosts > 0 ? Math.round((totalClaps / totalPosts) * 100) / 100 : 0,
      topPosts: topResult.rows,
    };
  },
  async recordView(
    postId: string,
    userId?: string,
    ip?: string,
  ): Promise<{ recorded: boolean }> {
    await PostsService._recordView(postId, userId, ip);
    return { recorded: true };
  },
};