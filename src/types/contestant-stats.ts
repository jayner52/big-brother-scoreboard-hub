export interface ContestantStats {
  contestant_name: string;
  total_points_earned: number;
  weeks_active: number;
  hoh_wins: number;
  veto_wins: number;
  times_on_block: number;
  times_on_block_at_eviction: number;
  times_saved_by_veto: number;
  times_selected: number;
  elimination_week?: number;
  group_name?: string;
  current_hoh?: boolean;
  current_pov_winner?: boolean;
  currently_nominated?: boolean;
  pov_used_on?: boolean;
  final_placement?: number;
  americas_favorite?: boolean;
  special_events: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
  }>;
}