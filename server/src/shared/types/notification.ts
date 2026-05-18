export type NotificationType =
  | 'clap'
  | 'comment'
  | 'comment_reply'
  | 'follow'
  | 'post_pinned'
  | 'post_taken_down'
  | 'post_approved'
  | 'campus_announcement'
  | 'writer_upgrade_approved'
  | 'writer_upgrade_declined'
  | 'system';

export type NotificationTargetType =
  | 'post'
  | 'comment'
  | 'user'
  | 'announcement';

export interface NotificationRow {
  id:          string;
  user_id:     string;
  type:        NotificationType;
  actor_id:    string | null;
  target_type: NotificationTargetType | null;
  target_id:   string | null;
  message:     string;
  read:        boolean;
  created_at:  Date;
  meta:        Record<string, unknown> | null;
}

export interface NotificationFull extends NotificationRow {
  actor_name:       string | null;
  actor_username:   string | null;
  actor_avatar_url: string | null;
}
