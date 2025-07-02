export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          question_text?: string
          question_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contestant_groups: {
        Row: {
          created_at: string
          group_name: string
          id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          sort_order: number
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      contestants: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          group_id: string | null
          hometown: string | null
          id: string
          is_active: boolean
          name: string
          occupation: string | null
          photo_url: string | null
          sort_order: number | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          group_id?: string | null
          hometown?: string | null
          id?: string
          is_active?: boolean
          name: string
          occupation?: string | null
          photo_url?: string | null
          sort_order?: number | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          group_id?: string | null
          hometown?: string | null
          id?: string
          is_active?: boolean
          name?: string
          occupation?: string | null
          photo_url?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contestants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contestant_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      detailed_scoring_rules: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          points: number
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          points: number
          subcategory?: string | null
        }
        Update: {
          category?: string
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
          id: string
          participant_name: string
          payment_confirmed: boolean
          player_1: string
          player_2: string
          player_3: string
          player_4: string
          player_5: string
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
          id?: string
          participant_name: string
          payment_confirmed?: boolean
          player_1: string
          player_2: string
          player_3: string
          player_4: string
          player_5: string
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
          id?: string
          participant_name?: string
          payment_confirmed?: boolean
          player_1?: string
          player_2?: string
          player_3?: string
          player_4?: string
          player_5?: string
          team_name?: string
          total_points?: number
          updated_at?: string
          user_id?: string
          weekly_points?: number
        }
        Relationships: []
      }
      pool_settings: {
        Row: {
          created_at: string
          draft_open: boolean
          entry_fee_amount: number
          entry_fee_currency: string
          id: string
          jury_phase_active: boolean | null
          jury_start_week: number | null
          payment_details_1: string
          payment_details_2: string | null
          payment_method_1: string
          payment_method_2: string | null
          registration_deadline: string | null
          season_active: boolean
          season_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft_open?: boolean
          entry_fee_amount?: number
          entry_fee_currency?: string
          id?: string
          jury_phase_active?: boolean | null
          jury_start_week?: number | null
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          registration_deadline?: string | null
          season_active?: boolean
          season_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft_open?: boolean
          entry_fee_amount?: number
          entry_fee_currency?: string
          id?: string
          jury_phase_active?: boolean | null
          jury_start_week?: number | null
          payment_details_1?: string
          payment_details_2?: string | null
          payment_method_1?: string
          payment_method_2?: string | null
          registration_deadline?: string | null
          season_active?: boolean
          season_name?: string
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
          week_number: number
        }
        Insert: {
          contestant_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          points_awarded?: number | null
          week_number: number
        }
        Update: {
          contestant_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          points_awarded?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "special_events_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
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
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_events_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_results: {
        Row: {
          created_at: string
          evicted_contestant: string | null
          hoh_winner: string | null
          id: string
          is_double_eviction: boolean | null
          pov_winner: string | null
          second_evicted_contestant: string | null
          second_hoh_winner: string | null
          second_pov_winner: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          evicted_contestant?: string | null
          hoh_winner?: string | null
          id?: string
          is_double_eviction?: boolean | null
          pov_winner?: string | null
          second_evicted_contestant?: string | null
          second_hoh_winner?: string | null
          second_pov_winner?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          evicted_contestant?: string | null
          hoh_winner?: string | null
          id?: string
          is_double_eviction?: boolean | null
          pov_winner?: string | null
          second_evicted_contestant?: string | null
          second_hoh_winner?: string | null
          second_pov_winner?: string | null
          week_number?: number
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_contestant_points: {
        Args: { contestant_id_param: string }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
