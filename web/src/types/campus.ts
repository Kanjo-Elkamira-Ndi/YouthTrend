export interface CampusSettings {
  registrationMode: "open" | "invite_only" | "closed";
  postApprovalRequired: boolean;
  anonymousPostingEnabled: boolean;
  autoApproveWriters: boolean;
  moderationSlaHours: number;
}

export interface CampusRow {
  id: string;
  name: string;
  slug: string;
  short_code: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  allowed_domains: string[];
  status: "active" | "inactive";
  settings: CampusSettings;
  created_at: string;
  updated_at: string;
  member_count?: number;
  post_count?: number;
}
