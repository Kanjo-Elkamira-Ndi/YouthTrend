export type CommentStatus = 'visible' | 'hidden' | 'deleted';

export interface CommentRow {
  id:         string;
  post_id:    string;
  author_id:  string;
  parent_id:  string | null;
  body:       string;
  status:     CommentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CommentFull extends CommentRow {
  author_name:       string | null;
  author_username:   string | null;
  author_avatar_url: string | null;
}

export interface CommentThread extends CommentFull {
  replies: CommentFull[];
}
