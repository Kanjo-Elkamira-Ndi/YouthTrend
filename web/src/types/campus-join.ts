export type CampusJoinStatus = 'pending' | 'approved' | 'declined';

export interface CampusJoinRequest {
  id: string;
  user_id: string;
  campus_id: string;
  status: CampusJoinStatus;
  reviewed_by: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CampusJoinFull extends CampusJoinRequest {
  requester_full_name: string;
  requester_username: string;
  requester_email: string;
  requester_avatar_url: string | null;
  campus_name: string;
  campus_short_code: string;
}
