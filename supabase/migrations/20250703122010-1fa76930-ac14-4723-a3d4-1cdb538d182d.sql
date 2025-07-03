-- Fix the generate_weekly_snapshots function for proper cumulative scoring and deltas
-- This addresses the critical issues with cumulative points and week-to-week changes

DROP FUNCTION IF EXISTS public.generate_weekly_snapshots(integer);

CREATE OR REPLACE FUNCTION public.generate_weekly_snapshots(week_num integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete existing snapshots for this week (in case of re-generation)
  DELETE FROM public.weekly_team_snapshots WHERE week_number = week_num;
  
  -- Generate new snapshots with proper cumulative points calculation
  WITH team_cumulative_stats AS (
    SELECT 
      pe.id as pool_entry_id,
      pe.participant_name,
      pe.team_name,
      pe.player_1,
      pe.player_2,
      pe.player_3,
      pe.player_4,
      pe.player_5,
      pe.payment_confirmed,
      
      -- Calculate cumulative weekly points from week 1 through the selected week
      COALESCE((
        SELECT SUM(we.points_awarded)
        FROM weekly_events we
        WHERE we.contestant_id IN (
          SELECT c.id FROM contestants c 
          WHERE c.name IN (pe.player_1, pe.player_2, pe.player_3, pe.player_4, pe.player_5)
        )
        AND we.week_number >= 1 
        AND we.week_number <= week_num
      ), 0) as cumulative_weekly_points,
      
      -- Calculate cumulative bonus points through the selected week
      COALESCE((
        SELECT SUM(bq.points_value)
        FROM bonus_questions bq
        WHERE bq.answer_revealed = true
        AND bq.created_at <= (
          SELECT COALESCE(MAX(wr.created_at), now()) 
          FROM weekly_results wr 
          WHERE wr.week_number <= week_num 
          AND wr.is_draft = false
        )
        AND (
          -- Handle different question types for correct answers
          (bq.question_type = 'player_select' AND pe.bonus_answers->>bq.id = bq.correct_answer) OR
          (bq.question_type = 'dual_player_select' AND pe.bonus_answers->>bq.id = bq.correct_answer) OR
          (bq.question_type = 'yes_no' AND pe.bonus_answers->>bq.id = bq.correct_answer) OR
          (bq.question_type = 'number' AND pe.bonus_answers->>bq.id = bq.correct_answer)
        )
      ), 0) as cumulative_bonus_points,
      
      -- Calculate points earned ONLY in this specific week (for delta calculation)
      COALESCE((
        SELECT SUM(we.points_awarded)
        FROM weekly_events we
        WHERE we.contestant_id IN (
          SELECT c.id FROM contestants c 
          WHERE c.name IN (pe.player_1, pe.player_2, pe.player_3, pe.player_4, pe.player_5)
        )
        AND we.week_number = week_num
      ), 0) as current_week_points
      
    FROM public.pool_entries pe
  ),
  ranked_teams AS (
    SELECT 
      *,
      (cumulative_weekly_points + cumulative_bonus_points) as total_cumulative_points,
      ROW_NUMBER() OVER (ORDER BY (cumulative_weekly_points + cumulative_bonus_points) DESC, pool_entry_id) as current_rank
    FROM team_cumulative_stats
  ),
  previous_week_stats AS (
    SELECT 
      wts.pool_entry_id,
      wts.total_points as prev_total_points,
      wts.rank_position as prev_rank
    FROM public.weekly_team_snapshots wts
    WHERE wts.week_number = week_num - 1
  )
  INSERT INTO public.weekly_team_snapshots (
    pool_entry_id,
    week_number,
    weekly_points,
    bonus_points,
    total_points,
    rank_position,
    points_change,
    rank_change
  )
  SELECT 
    rt.pool_entry_id,
    week_num,
    rt.cumulative_weekly_points,
    rt.cumulative_bonus_points,
    rt.total_cumulative_points,
    rt.current_rank::integer,
    -- Points change: for week 1, show total points earned; for other weeks, show increase from previous week
    CASE 
      WHEN week_num = 1 THEN rt.total_cumulative_points
      ELSE rt.total_cumulative_points - COALESCE(pws.prev_total_points, 0)
    END as points_change,
    -- Rank change: positive means rank improved (moved up), negative means rank dropped
    CASE 
      WHEN week_num = 1 THEN 0  -- No rank change for first week
      ELSE COALESCE(pws.prev_rank::integer - rt.current_rank::integer, 0)
    END as rank_change
  FROM ranked_teams rt
  LEFT JOIN previous_week_stats pws ON rt.pool_entry_id = pws.pool_entry_id
  ORDER BY rt.current_rank;
END;
$function$;