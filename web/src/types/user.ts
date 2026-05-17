export interface PublicProfile {
  id: string;
  full_name: string;
  username: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  year_of_study: number | null;
  created_at: string;
  campus_id: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  post_count: number;
  follower_count: number;
  following_count: number;
  total_claps_received: number;
  is_following?: boolean;
}

export interface UserListItem {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  campus_id: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  avatar_url: string | null;
  department: string | null;
  created_at: string;
  last_active_at: string | null;
  post_count: number;
}

export interface FollowListItem {
  id: string;
  full_name: string;
  username: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  department: string | null;
  campus_name: string | null;
  campus_short_code: string | null;
  created_at: string;
}
