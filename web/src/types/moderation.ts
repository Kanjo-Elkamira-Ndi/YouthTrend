export type ReportReason = 'hate_speech' | 'misinformation' | 'spam' | 'explicit_content' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'taken_down' | 'dismissed' | 'escalated';

export interface Report {
  id: string;
  reporter_id: string;
  campus_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  actioned_by: string | null;
  moderator_note: string | null;
  escalated_to: string | null;
  created_at: string;
  actioned_at: string | null;
  reporter_name?: string | null;
  reporter_username?: string | null;
  moderator_name?: string | null;
  target_title?: string | null;
  target_author_id?: string | null;
  target_author_name?: string | null;
  campus_name?: string | null;
}
