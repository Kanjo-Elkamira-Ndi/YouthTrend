/**
 * Campus settings stored in the JSONB `settings` column.
 * Shared between campus.service.ts and campus.routes.ts.
 */
export interface CampusSettings {
  registrationMode:        'open' | 'invite_only' | 'closed';
  postApprovalRequired:    boolean;
  anonymousPostingEnabled: boolean;
  autoApproveWriters:      boolean;
  moderationSlaHours:      number;  // target review time for moderators
}

export const DEFAULT_CAMPUS_SETTINGS: CampusSettings = {
  registrationMode:        'open',
  postApprovalRequired:    false,
  anonymousPostingEnabled: false,
  autoApproveWriters:      false,
  moderationSlaHours:      24,
};

/** Full campus row as returned from the DB */
export interface CampusRow {
  id:              string;
  name:            string;
  slug:            string;
  short_code:      string;
  description:     string | null;
  logo_url:        string | null;
  cover_url:       string | null;
  allowed_domains: string[];
  status:          'active' | 'inactive';
  settings:        CampusSettings;
  created_at:      Date;
  updated_at:      Date;
  // aggregated counts (added by service queries)
  member_count?:   number;
  post_count?:     number;
}