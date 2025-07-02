-- Add enhanced tracking for block survival and veto saves
ALTER TABLE public.contestants 
ADD COLUMN times_on_block_at_eviction INTEGER DEFAULT 0,
ADD COLUMN times_saved_by_veto INTEGER DEFAULT 0,
ADD COLUMN block_survival_bonus_2_weeks BOOLEAN DEFAULT false,
ADD COLUMN block_survival_bonus_4_weeks BOOLEAN DEFAULT false;

-- Add function to format event types to human readable
CREATE OR REPLACE FUNCTION public.format_event_type(event_type_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE event_type_input
    WHEN 'hoh_winner' THEN 'Head of Household Winner'
    WHEN 'pov_winner' THEN 'Power of Veto Winner'
    WHEN 'nominee' THEN 'Nominated for Eviction'
    WHEN 'replacement_nominee' THEN 'Replacement Nominee'
    WHEN 'evicted' THEN 'Evicted from House'
    WHEN 'survival' THEN 'Survived the Week'
    WHEN 'jury_member' THEN 'Jury Member'
    WHEN 'block_survival_2_weeks' THEN '2-Week Block Survival Bonus'
    WHEN 'block_survival_4_weeks' THEN '4-Week Block Survival Bonus'
    WHEN 'prize_won' THEN 'Prize Winner'
    WHEN 'punishment' THEN 'Punishment Received'
    WHEN 'americas_favorite' THEN 'America''s Favorite Player'
    WHEN 'winner' THEN 'Season Winner'
    WHEN 'runner_up' THEN 'Runner-up'
    ELSE REPLACE(INITCAP(REPLACE(event_type_input, '_', ' ')), ' ', ' ')
  END;
END;
$$;