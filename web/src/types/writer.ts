export type WriterUpgradeStatus = 'pending' | 'approved' | 'declined';

export interface WriterUpgradeRequest {
  id: string;
  user_id: string;
  campus_id: string;
  topics: string[];
  motivation: string;
  sample_title: string;
  sample_body: string;
  external_link: string | null;
  status: WriterUpgradeStatus;
  reviewed_by: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface WriterUpgradeFull extends WriterUpgradeRequest {
  requester_full_name: string;
  requester_username: string;
  requester_email: string;
  requester_avatar_url: string | null;
}
