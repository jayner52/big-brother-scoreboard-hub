export interface Contestant {
  id: string;
  name: string;
  isActive: boolean;
  group_id?: string;
  sort_order?: number;
}

export interface ContestantGroup {
  id: string;
  group_name: string;
  sort_order: number;
  contestants?: Contestant[];
}

export interface PoolSettings {
  id: string;
  season_name: string;
  entry_fee_amount: number;
  entry_fee_currency: string;
  payment_method_1: string;
  payment_details_1: string;
  payment_method_2?: string;
  payment_details_2?: string;
  registration_deadline?: string;
  draft_open: boolean;
  season_active: boolean;
  enable_bonus_questions?: boolean;
  picks_per_team?: number;
}

export interface BonusQuestion {
  id: string;
  question_text: string;
  question_type: 'player_select' | 'dual_player_select' | 'yes_no' | 'number' | 'creature_select';
  sort_order: number;
  is_active: boolean;
  correct_answer?: string;
  points_value: number;
  answer_revealed: boolean;
}

export interface PoolEntry {
  id: string;
  user_id: string;
  pool_id: string;
  participant_name: string;
  team_name: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  bonus_answers: Record<string, any>;
  weekly_points: number;
  bonus_points: number;
  total_points: number;
  current_rank?: number;
  payment_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WeeklyTeamScores {
  id: string;
  pool_entry_id: string;
  week_number: number;
  survival_points: number;
  competition_points: number;
  bonus_points_earned: number;
  total_week_points: number;
}

export interface ScoringRules {
  hoh: number;
  pov: number;
  evicted: number;
  bonus: number;
  survival: number;
}

export interface WeeklyResults {
  week: number;
  hohWinner?: string;
  povWinner?: string;
  evicted?: string;
  bonusWinners?: string[];
}

export interface TeamRoster {
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
}

export interface Pool {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
  entry_fee_amount: number;
  entry_fee_currency: string;
  payment_method_1: string;
  payment_details_1: string;
  payment_method_2?: string;
  payment_details_2?: string;
  registration_deadline?: string;
  draft_open: boolean;
  draft_locked: boolean;
  enable_bonus_questions: boolean;
  picks_per_team: number;
  jury_phase_started: boolean;
  jury_start_week?: number;
  jury_start_timestamp?: string;
  has_buy_in: boolean;
  buy_in_description?: string;
}

export interface PoolMembership {
  id: string;
  user_id: string;
  pool_id: string;
  role: 'owner' | 'admin' | 'member';
  active: boolean;
  joined_at: string;
  pool?: Pool;
}

export interface PoolInvite {
  id: string;
  pool_id: string;
  invited_by: string;
  invite_code: string;
  email?: string;
  used: boolean;
  used_by?: string;
  used_at?: string;
  expires_at: string;
  created_at: string;
}