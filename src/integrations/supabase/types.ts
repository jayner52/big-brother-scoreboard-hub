export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bonus_questions: {
        Row: {
          answer_revealed: boolean
          correct_answer: string | null
          created_at: string
          id: string
          is_active: boolean
          points_value: number
          pool_id: string | null
          question_text: string
          question_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_revealed?: boolean
          correct_answer?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          points_value?: number
          pool_id?: string | null
          question_text: string
          question_type: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          answer_revealed?: boolean
          correct_answer?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          points_value?: number
          pool_id?: string | null
          question_text?: string
          question_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_questions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bonus_questions_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          mentioned_user_ids: string[] | null
          message: string
          parent_message_id: string | null
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          mentioned_user_ids?: string[] | null
          message: string
          parent_message_id?: string | null
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          mentioned_user_ids?: string[] | null
          message?: string
          parent_message_id?: string | null
          pool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_read_status: {
        Row: {
          created_at: string | null
          id: string
          last_read_at: string | null
          pool_id: string
          unread_count: number | null
          unread_mentions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          pool_id: string
          unread_count?: number | null
          unread_mentions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          pool_id?: string
          unread_count?: number | null
          unread_mentions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_read_status_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      contestant_groups: {
        Row: {
          created_at: string
          group_name: string
          id: string
          pool_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          pool_id?: string | null
          sort_order: number
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          pool_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "contestant_groups_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contestant_groups_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      contestant_nominations: {
        Row: {
          contestant_id: string
          created_at: string
          id: string
          nomination_type: string
          survived: boolean | null
          week_number: number
        }
        Insert: {
          contestant_id: string
          created_at?: string
          id?: string
          nomination_type: string
          survived?: boolean | null
          week_number: number
        }
        Update: {
          contestant_id?: string
          created_at?: string
          id?: string
          nomination_type?: string
          survived?: boolean | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contestant_nominations_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
        ]
      }
      contestants: {
        Row: {
          age: number | null
          ai_generated: boolean | null
          americas_favorite: boolean
          backstory: Json | null
          bio: string | null
          block_survival_bonus_2_weeks: boolean | null
          block_survival_bonus_4_weeks: boolean | null
          consecutive_weeks_no_wins: number | null
          created_at: string
          current_hoh: boolean
          current_pov_winner: boolean
          currently_nominated: boolean
          data_source: string | null
          family_info: string | null
          final_placement: number | null
          floater_achievement_earned: boolean | null
          gameplay_strategy: Json | null
          generation_metadata: Json | null
          group_id: string | null
          hometown: string | null
          id: string
          is_active: boolean
          last_competition_win_week: number | null
          name: string
          occupation: string | null
          personality_traits: Json | null
          photo_url: string | null
          physical_description: Json | null
          pool_id: string | null
          pov_used_on: boolean
          relationship_status: string | null
          season_number: number | null
          sort_order: number | null
          times_on_block_at_eviction: number | null
          times_saved_by_veto: number | null
        }
        Insert: {
          age?: number | null
          ai_generated?: boolean | null
          americas_favorite?: boolean
          backstory?: Json | null
          bio?: string | null
          block_survival_bonus_2_weeks?: boolean | null
          block_survival_bonus_4_weeks?: boolean | null
          consecutive_weeks_no_wins?: number | null
          created_at?: string
          current_hoh?: boolean
          current_pov_winner?: boolean
          currently_nominated?: boolean
          data_source?: string | null
          family_info?: string | null
          final_placement?: number | null
          floater_achievement_earned?: boolean | null
          gameplay_strategy?: Json | null
          generation_metadata?: Json | null
          group_id?: string | null
          hometown?: string | null
          id?: string
          is_active?: boolean
          last_competition_win_week?: number | null
          name: string
          occupation?: string | null
          personality_traits?: Json | null
          photo_url?: string | null
          physical_description?: Json | null
          pool_id?: string | null
          pov_used_on?: boolean
          relationship_status?: string | null
          season_number?: number | null
          sort_order?: number | null
          times_on_block_at_eviction?: number | null
          times_saved_by_veto?: number | null
        }
        Update: {
          age?: number | null
          ai_generated?: boolean | null
          americas_favorite?: boolean
          backstory?: Json | null
          bio?: string | null
          block_survival_bonus_2_weeks?: boolean | null
          block_survival_bonus_4_weeks?: boolean | null
          consecutive_weeks_no_wins?: number | null
          created_at?: string
          current_hoh?: boolean
          current_pov_winner?: boolean
          currently_nominated?: boolean
          data_source?: string | null
          family_info?: string | null
          final_placement?: number | null
          floater_achievement_earned?: boolean | null
          gameplay_strategy?: Json | null
          generation_metadata?: Json | null
          group_id?: string | null
          hometown?: string | null
          id?: string
          is_active?: boolean
          last_competition_win_week?: number | null
          name?: string
          occupation?: string | null
          personality_traits?: Json | null
          photo_url?: string | null
          physical_description?: Json | null
          pool_id?: string | null
          pov_used_on?: boolean
          relationship_status?: string | null
          season_number?: number | null
          sort_order?: number | null
          times_on_block_at_eviction?: number | null
          times_saved_by_veto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contestants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contestant_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contestants_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contestants_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      current_game_week: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: []
      }
      detailed_scoring_rules: {
        Row: {
          category: string
          config_params: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          points: number
          subcategory: string | null
        }
        Insert: {
          category: string
          config_params?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          points: number
          subcategory?: string | null
        }
        Update: {
          category?: string
          config_params?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          points?: number
          subcategory?: string | null
        }
        Relationships: []
      }
      pool_entries: {
        Row: {
          bonus_answers: Json
          bonus_points: number
          created_at: string
          current_rank: number | null
          email: string | null
          id: string
          participant_name: string
          payment_confirmed: boolean
          player_1: string
          player_2: string
          player_3: string
          player_4: string
          player_5: string
          pool_id: string
          team_name: string
          total_points: number
          updated_at: string
          user_id: string
          weekly_points: number
        }
        Insert: {
          bonus_answers?: Json
          bonus_points?: number
          created_at?: string
          current_rank?: number | null
          email?: string | null
          id?: string
          participant_name: string
          payment_confirmed?: boolean
          player_1: string
          player_2: string
          player_3: string
          player_4: string
          player_5: string
          pool_id: string
          team_name: string
          total_points?: number
          updated_at?: string
          user_id: string
          weekly_points?: number
        }
        Update: {
          bonus_answers?: Json
          bonus_points?: number
          created_at?: string
          current_rank?: number | null
          email?: string | null
          id?: string
          participant_name?: string
          payment_confirmed?: boolean
          player_1?: string
          player_2?: string
          player_3?: string
          player_4?: string
          player_5?: string
          pool_id?: string
          team_name?: string
          total_points?: number
          updated_at?: string
          user_id?: string
          weekly_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_entries_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_entries_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_invites: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invite_code: string
          invited_by: string
          pool_id: string
          used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code: string
          invited_by: string
          pool_id: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by?: string
          pool_id?: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_invites_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_memberships: {
        Row: {
          active: boolean
          id: string
          joined_at: string
          pool_id: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean
          id?: string
          joined_at?: string
          pool_id: string
          role?: string
          user_id: string
        }
        Update: {
          active?: boolean
          id?: string
          joined_at?: string
          pool_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_memberships_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_settings: {
        Row: {
          buy_in_description: string | null
          created_at: string
          draft_locked: boolean
          draft_open: boolean
          enable_bonus_questions: boolean | null
          enable_free_pick: boolean | null
          entry_fee_amount: number
          entry_fee_currency: string
          group_names: string[] | null
          has_buy_in: boolean
          id: string
          jury_phase_active: boolean | null
          jury_phase_started: boolean
          jury_start_timestamp: string | null
          jury_start_week: number | null
          number_of_groups: number | null
          payment_details_1: string
          payment_details_2: string | null
          payment_method_1: string
          payment_method_2: string | null
          picks_per_team: number | null
          registration_deadline: string | null
          season_active: boolean
          season_name: string
          updated_at: string
        }
        Insert: {
          buy_in_description?: string | null
          created_at?: string
          draft_locked?: boolean
          draft_open?: boolean
          enable_bonus_questions?: boolean | null
          enable_free_pick?: boolean | null
          entry_fee_amount?: number
          entry_fee_currency?: string
          group_names?: string[] | null
          has_buy_in?: boolean
          id?: string
          jury_phase_active?: boolean | null
          jury_phase_started?: boolean
          jury_start_timestamp?: string | null
          jury_start_week?: number | null
          number_of_groups?: number | null
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          picks_per_team?: number | null
          registration_deadline?: string | null
          season_active?: boolean
          season_name?: string
          updated_at?: string
        }
        Update: {
          buy_in_description?: string | null
          created_at?: string
          draft_locked?: boolean
          draft_open?: boolean
          enable_bonus_questions?: boolean | null
          enable_free_pick?: boolean | null
          entry_fee_amount?: number
          entry_fee_currency?: string
          group_names?: string[] | null
          has_buy_in?: boolean
          id?: string
          jury_phase_active?: boolean | null
          jury_phase_started?: boolean
          jury_start_timestamp?: string | null
          jury_start_week?: number | null
          number_of_groups?: number | null
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          picks_per_team?: number | null
          registration_deadline?: string | null
          season_active?: boolean
          season_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pool_winners: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_submitted: boolean | null
          place: number
          pool_id: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_submitted?: boolean | null
          place: number
          pool_id: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_submitted?: boolean | null
          place?: number
          pool_id?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_winners_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_winners_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "pool_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          allow_duplicate_picks: boolean | null
          buy_in_description: string | null
          created_at: string
          description: string | null
          draft_configuration_locked: boolean | null
          draft_locked: boolean
          draft_open: boolean
          enable_bonus_questions: boolean
          enabled_special_events: string[] | null
          entry_fee_amount: number
          entry_fee_currency: string
          finale_week_enabled: boolean | null
          has_buy_in: boolean
          hide_picks_until_draft_closed: boolean | null
          id: string
          invite_code: string
          jury_phase_started: boolean
          jury_start_timestamp: string | null
          jury_start_week: number | null
          name: string
          number_of_free_picks: number | null
          owner_id: string
          payment_details_1: string
          payment_details_2: string | null
          payment_method_1: string
          payment_method_2: string | null
          picks_per_team: number
          prize_configuration: Json | null
          prize_distribution: Json | null
          prize_mode: string | null
          registration_deadline: string | null
          season_complete: boolean | null
          season_locked: boolean | null
          show_prize_amounts: boolean | null
          show_prize_total: boolean | null
          updated_at: string
        }
        Insert: {
          allow_duplicate_picks?: boolean | null
          buy_in_description?: string | null
          created_at?: string
          description?: string | null
          draft_configuration_locked?: boolean | null
          draft_locked?: boolean
          draft_open?: boolean
          enable_bonus_questions?: boolean
          enabled_special_events?: string[] | null
          entry_fee_amount?: number
          entry_fee_currency?: string
          finale_week_enabled?: boolean | null
          has_buy_in?: boolean
          hide_picks_until_draft_closed?: boolean | null
          id?: string
          invite_code?: string
          jury_phase_started?: boolean
          jury_start_timestamp?: string | null
          jury_start_week?: number | null
          name: string
          number_of_free_picks?: number | null
          owner_id: string
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          picks_per_team?: number
          prize_configuration?: Json | null
          prize_distribution?: Json | null
          prize_mode?: string | null
          registration_deadline?: string | null
          season_complete?: boolean | null
          season_locked?: boolean | null
          show_prize_amounts?: boolean | null
          show_prize_total?: boolean | null
          updated_at?: string
        }
        Update: {
          allow_duplicate_picks?: boolean | null
          buy_in_description?: string | null
          created_at?: string
          description?: string | null
          draft_configuration_locked?: boolean | null
          draft_locked?: boolean
          draft_open?: boolean
          enable_bonus_questions?: boolean
          enabled_special_events?: string[] | null
          entry_fee_amount?: number
          entry_fee_currency?: string
          finale_week_enabled?: boolean | null
          has_buy_in?: boolean
          hide_picks_until_draft_closed?: boolean | null
          id?: string
          invite_code?: string
          jury_phase_started?: boolean
          jury_start_timestamp?: string | null
          jury_start_week?: number | null
          name?: string
          number_of_free_picks?: number | null
          owner_id?: string
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          picks_per_team?: number
          prize_configuration?: Json | null
          prize_distribution?: Json | null
          prize_mode?: string | null
          registration_deadline?: string | null
          season_complete?: boolean | null
          season_locked?: boolean | null
          show_prize_amounts?: boolean | null
          show_prize_total?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      prize_pools: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          place_number: number
          prize_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          place_number: number
          prize_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          place_number?: number
          prize_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      special_events: {
        Row: {
          contestant_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          points_awarded: number | null
          pool_id: string | null
          week_number: number
        }
        Insert: {
          contestant_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          points_awarded?: number | null
          pool_id?: string | null
          week_number: number
        }
        Update: {
          contestant_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          points_awarded?: number | null
          pool_id?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_special_events_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_events_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_events: {
        Row: {
          contestant_id: string
          created_at: string
          event_details: Json | null
          event_type: string
          eviction_round: number | null
          id: string
          points_awarded: number | null
          pool_id: string | null
          updated_at: string
          week_number: number
        }
        Insert: {
          contestant_id: string
          created_at?: string
          event_details?: Json | null
          event_type: string
          eviction_round?: number | null
          id?: string
          points_awarded?: number | null
          pool_id?: string | null
          updated_at?: string
          week_number: number
        }
        Update: {
          contestant_id?: string
          created_at?: string
          event_details?: Json | null
          event_type?: string
          eviction_round?: number | null
          id?: string
          points_awarded?: number | null
          pool_id?: string | null
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_weekly_events_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_events_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_events_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_results: {
        Row: {
          ai_arena_enabled: boolean | null
          ai_arena_winner: string | null
          created_at: string
          draft_special_events: string | null
          evicted_contestant: string | null
          hoh_winner: string | null
          id: string
          is_double_eviction: boolean | null
          is_draft: boolean | null
          is_triple_eviction: boolean | null
          jury_phase_started: boolean | null
          nominees: string[] | null
          pool_id: string | null
          pov_used: boolean | null
          pov_used_on: string | null
          pov_winner: string | null
          replacement_nominee: string | null
          second_evicted_contestant: string | null
          second_hoh_winner: string | null
          second_nominees: string[] | null
          second_pov_used: boolean | null
          second_pov_used_on: string | null
          second_pov_winner: string | null
          second_replacement_nominee: string | null
          third_evicted_contestant: string | null
          third_hoh_winner: string | null
          third_pov_winner: string | null
          week_number: number
        }
        Insert: {
          ai_arena_enabled?: boolean | null
          ai_arena_winner?: string | null
          created_at?: string
          draft_special_events?: string | null
          evicted_contestant?: string | null
          hoh_winner?: string | null
          id?: string
          is_double_eviction?: boolean | null
          is_draft?: boolean | null
          is_triple_eviction?: boolean | null
          jury_phase_started?: boolean | null
          nominees?: string[] | null
          pool_id?: string | null
          pov_used?: boolean | null
          pov_used_on?: string | null
          pov_winner?: string | null
          replacement_nominee?: string | null
          second_evicted_contestant?: string | null
          second_hoh_winner?: string | null
          second_nominees?: string[] | null
          second_pov_used?: boolean | null
          second_pov_used_on?: string | null
          second_pov_winner?: string | null
          second_replacement_nominee?: string | null
          third_evicted_contestant?: string | null
          third_hoh_winner?: string | null
          third_pov_winner?: string | null
          week_number: number
        }
        Update: {
          ai_arena_enabled?: boolean | null
          ai_arena_winner?: string | null
          created_at?: string
          draft_special_events?: string | null
          evicted_contestant?: string | null
          hoh_winner?: string | null
          id?: string
          is_double_eviction?: boolean | null
          is_draft?: boolean | null
          is_triple_eviction?: boolean | null
          jury_phase_started?: boolean | null
          nominees?: string[] | null
          pool_id?: string | null
          pov_used?: boolean | null
          pov_used_on?: string | null
          pov_winner?: string | null
          replacement_nominee?: string | null
          second_evicted_contestant?: string | null
          second_hoh_winner?: string | null
          second_nominees?: string[] | null
          second_pov_used?: boolean | null
          second_pov_used_on?: string | null
          second_pov_winner?: string | null
          second_replacement_nominee?: string | null
          third_evicted_contestant?: string | null
          third_hoh_winner?: string | null
          third_pov_winner?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_weekly_results_pool"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_results_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_team_scores: {
        Row: {
          bonus_points_earned: number
          competition_points: number
          created_at: string
          id: string
          pool_entry_id: string
          survival_points: number
          total_week_points: number
          week_number: number
        }
        Insert: {
          bonus_points_earned?: number
          competition_points?: number
          created_at?: string
          id?: string
          pool_entry_id: string
          survival_points?: number
          total_week_points?: number
          week_number: number
        }
        Update: {
          bonus_points_earned?: number
          competition_points?: number
          created_at?: string
          id?: string
          pool_entry_id?: string
          survival_points?: number
          total_week_points?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_team_scores_pool_entry_id_fkey"
            columns: ["pool_entry_id"]
            isOneToOne: false
            referencedRelation: "pool_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_team_snapshots: {
        Row: {
          bonus_points: number
          created_at: string
          id: string
          points_change: number | null
          pool_entry_id: string
          pool_id: string
          rank_change: number | null
          rank_position: number
          total_points: number
          week_number: number
          weekly_points: number
        }
        Insert: {
          bonus_points?: number
          created_at?: string
          id?: string
          points_change?: number | null
          pool_entry_id: string
          pool_id: string
          rank_change?: number | null
          rank_position: number
          total_points?: number
          week_number: number
          weekly_points?: number
        }
        Update: {
          bonus_points?: number
          created_at?: string
          id?: string
          points_change?: number | null
          pool_entry_id?: string
          pool_id?: string
          rank_change?: number | null
          rank_position?: number
          total_points?: number
          week_number?: number
          weekly_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_team_snapshots_pool_entry_id_fkey"
            columns: ["pool_entry_id"]
            isOneToOne: false
            referencedRelation: "pool_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_team_snapshots_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      winner_payment_details: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_info: string
          place: number
          pool_id: string
          preferred_method: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_info: string
          place: number
          pool_id: string
          preferred_method: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_info?: string
          place?: number
          pool_id?: string
          preferred_method?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winner_payment_details_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_contestant_points: {
        Args: { contestant_id_param: string }
        Returns: number
      }
      format_event_type: {
        Args: { event_type_input: string }
        Returns: string
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_weekly_snapshots: {
        Args: { week_num: number }
        Returns: undefined
      }
      get_user_pool_admin_status: {
        Args: { target_pool_id: string }
        Returns: boolean
      }
      increment_unread_counts: {
        Args: {
          target_user_id: string
          target_pool_id: string
          is_mention?: boolean
        }
        Returns: undefined
      }
      join_pool_by_invite: {
        Args: { invite_code_param: string }
        Returns: Json
      }
      seed_new_pool_defaults: {
        Args: { target_pool_id: string }
        Returns: undefined
      }
      seed_pool_bonus_questions: {
        Args: { target_pool_id: string }
        Returns: undefined
      }
      seed_pool_contestant_groups: {
        Args: { target_pool_id: string }
        Returns: undefined
      }
      seed_pool_contestants: {
        Args: { target_pool_id: string }
        Returns: undefined
      }
      update_current_game_week: {
        Args: { new_week_number: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
