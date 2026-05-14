export type PostStatus     = 'draft' | 'scheduled' | 'published' | 'taken_down';
export type PostVisibility = 'public' | 'campus_only';

export interface PostRow {
  id:            string;
  author_id:     string;
  campus_id:     string;
  title:         string;
  subtitle:      string | null;
  slug:          string;
  body:          string;
  cover_url:     string | null;
  category:      string;
  status:        PostStatus;
  visibility:    PostVisibility;
  is_anonymous:  boolean;
  is_pinned:     boolean;
  scheduled_at:  Date | null;
  published_at:  Date | null;
  view_count:    number;
  clap_count:    number;
  comment_count: number;
  created_at:    Date;
  updated_at:    Date;
}

/** Full post as returned by feed/detail queries — includes author + campus */
export interface PostFull extends PostRow {
  // Author (null when anonymous)
  author_name?:         string | null;
  author_username?:     string | null;
  author_avatar_url?:   string | null;
  // Campus
  campus_name?:         string | null;
  campus_short_code?:   string | null;
  campus_slug?:         string | null;
  // Tags
  tags?:                string[];
  // Viewer context (added when authenticated)
  has_clapped?:         boolean;
  clap_count_by_viewer?: number;
  has_bookmarked?:      boolean;
}