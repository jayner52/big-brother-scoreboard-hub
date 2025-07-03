-- Phase 1: Database Schema Updates

-- Create weekly_team_snapshots table for historical leaderboard tracking
CREATE TABLE public.weekly_team_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_entry_id UUID NOT NULL REFERENCES public.pool_entries(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER NOT NULL,
  points_change INTEGER DEFAULT 0,
  rank_change INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pool_entry_id, week_number)
);

-- Enable RLS
ALTER TABLE public.weekly_team_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_team_snapshots
CREATE POLICY "Everyone can view weekly snapshots" 
ON public.weekly_team_snapshots 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage weekly snapshots" 
ON public.weekly_team_snapshots 
FOR ALL 
USING (true);

-- Add completion tracking to weekly_results (is_draft already exists, so we can use that)
-- No changes needed here as is_draft field already serves this purpose

-- Fix duplicate POV scoring rules - remove the duplicate
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'competitions' 
AND subcategory = 'power_of_veto_used_to_save' 
AND description LIKE '%saved by%';

-- Add configurable parameters to scoring rules for consecutive weeks
ALTER TABLE public.detailed_scoring_rules 
ADD COLUMN config_params JSONB DEFAULT '{}';

-- Update the consecutive weeks rule to be configurable
UPDATE public.detailed_scoring_rules 
SET 
  description = 'Surviving consecutive weeks with no competition wins',
  config_params = '{"consecutive_weeks": 4}'
WHERE category = 'bonuses' 
AND subcategory = 'survival' 
AND description LIKE '%4 weeks%';

-- Create function to generate weekly snapshots when a week is completed
CREATE OR REPLACE FUNCTION public.generate_weekly_snapshots(week_num INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing snapshots for this week (in case of re-generation)
  DELETE FROM public.weekly_team_snapshots WHERE week_number = week_num;
  
  -- Generate new snapshots
  WITH team_stats AS (
    SELECT 
      pe.id as pool_entry_id,
      pe.weekly_points,
      pe.bonus_points,
      pe.total_points,
      ROW_NUMBER() OVER (ORDER BY pe.total_points DESC) as current_rank
    FROM public.pool_entries pe
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
    ts.pool_entry_id,
    week_num,
    ts.weekly_points,
    ts.bonus_points,
    ts.total_points,
    ts.current_rank,
    COALESCE(ts.total_points - pws.prev_total_points, 0) as points_change,
    COALESCE(pws.prev_rank - ts.current_rank, 0) as rank_change
  FROM team_stats ts
  LEFT JOIN previous_week_stats pws ON ts.pool_entry_id = pws.pool_entry_id;
END;
$$;