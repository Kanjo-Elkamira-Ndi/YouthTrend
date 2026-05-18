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
  last_post_at: string | null;
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
  created_at: string;
  actor_name: string | null;
}

export interface GlobalContentRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  published_at: string | null;
  created_at: string;
  author_id: string;
  campus_id: string;
  author_name: string | null;
  author_username: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  report_count: number;
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
  updated_at: string;
  updated_by: string | null;
}
