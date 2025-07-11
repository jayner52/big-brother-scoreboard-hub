export interface UserRegistration {
  id: string;
  user_id: string;
  display_name: string | null;
  registration_date: string;
  email: string | null;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
  email_opt_in: boolean;
  email_subscription_status: string | null;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
}

export interface DashboardStats {
  total_registrations: number;
  terms_accepted_count: number;
  email_opted_in_count: number;
  active_pool_members: number;
  email_subscribers: number;
}

export interface EnhancedUserData {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url?: string | null;
  background_color?: string | null;
  registration_date: string;
  email_source: 'google_oauth' | 'manual_signup' | 'email_list' | 'unknown';
  email_verified: boolean;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
  email_opt_in: boolean;
  email_subscription_status: string | null;
  account_age_days: number;
  profile_completion: number;
  last_login: string | null;
  chat_messages_count?: number;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
  total_points?: number;
  pools_owned?: number;
  feedback_count?: number;
}

export interface EnhancedStats {
  total_registrations: number;
  terms_accepted_count: number;
  email_opted_in_count: number;
  active_pool_members: number;
  email_subscribers: number;
  google_oauth_users: number;
  manual_signup_users: number;
  verified_emails: number;
  total_chat_messages: number;
  total_pool_entries: number;
  total_feedback_items: number;
}