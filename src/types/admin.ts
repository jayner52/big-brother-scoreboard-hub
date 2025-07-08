export interface WeeklyEvent {
  id: string;
  week_number: number;
  contestant_id: string;
  event_type: string;
  event_details: Record<string, any>;
  points_awarded: number;
  created_at: Date;
  updated_at: Date;
}

export interface SpecialEvent {
  id: string;
  week_number: number;
  contestant_id: string;
  event_type: string;
  description?: string;
  points_awarded: number;
  created_at: Date;
}

export interface DetailedScoringRule {
  id: string;
  category: string;
  subcategory?: string;
  points: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
}

export interface ContestantWithBio {
  id: string;
  name: string;
  isActive: boolean;
  group_id?: string;
  sort_order?: number;
  bio?: string;
  photo_url?: string;
  hometown?: string;
  age?: number;
  occupation?: string;
  // Additional database fields
  personality_traits?: string[] | any;
  family_info?: string;
  relationship_status?: string;
  gameplay_strategy?: string;
  backstory?: string;
  current_hoh?: boolean;
  current_pov_winner?: boolean;
  currently_nominated?: boolean;
  times_on_block_at_eviction?: number;
  times_saved_by_veto?: number;
  final_placement?: number;
  americas_favorite?: boolean;
  physical_description?: any;
  ai_generated?: boolean;
  generation_metadata?: any;
  season_number?: number;
  data_source?: string;
}

export interface ContestantGroup {
  id: string;
  group_name: string;
  sort_order: number;
}

export interface EnhancedPoolSettings {
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
  number_of_groups: number;
  picks_per_team: number;
  enable_free_pick: boolean;
  group_names: string[];
}

export interface WeeklyEventForm {
  week: number;
  nominees: string[];
  hohWinner: string;
  povWinner: string;
  povUsed: boolean;
  povUsedOn?: string;
  replacementNominee?: string;
  evicted: string;
  isDoubleEviction: boolean;
  isTripleEviction: boolean;
  isFinalWeek: boolean;
  isJuryPhase: boolean;
  aiArenaEnabled?: boolean;
  aiArenaWinner?: string;
  secondHohWinner?: string;
  secondNominees: string[];
  secondPovWinner?: string;
  secondPovUsed: boolean;
  secondPovUsedOn?: string;
  secondReplacementNominee?: string;
  secondEvicted?: string;
  thirdHohWinner?: string;
  thirdNominees?: string[];
  thirdPovWinner?: string;
  thirdPovUsed?: boolean;
  thirdPovUsedOn?: string;
  thirdReplacementNominee?: string;
  thirdEvicted?: string;
  maxNominees: number;
  winner?: string;
  runnerUp?: string;
  americasFavorite?: string;
  specialEvents: Array<{
    id?: string;
    contestant: string;
    eventType: string;
    description?: string;
    customPoints?: number;
    customDescription?: string;
    customEmoji?: string;
  }>;
}