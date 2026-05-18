export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  reply_count?: number;
  replies: Comment[];
}
