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
}

export interface WeeklyEventForm {
  week: number;
  nominees: string[];
  hohWinner: string;
  povWinner: string;
  povUsed: boolean;
  replacementNominee?: string;
  evicted: string;
  isDoubleEviction: boolean;
  secondHohWinner?: string;
  secondNominees: string[];
  secondPovWinner?: string;
  secondPovUsed: boolean;
  secondReplacementNominee?: string;
  secondEvicted?: string;
  maxNominees: number;
  specialEvents: Array<{
    contestant: string;
    eventType: string;
    description?: string;
    customPoints?: number;
  }>;
}