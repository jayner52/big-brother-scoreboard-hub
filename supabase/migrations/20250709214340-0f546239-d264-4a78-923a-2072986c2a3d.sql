-- Deactivate redundant "weekly" category scoring rules
-- These are duplicates of the "weekly_events" category rules that are actually used
UPDATE public.detailed_scoring_rules 
SET is_active = false 
WHERE category = 'weekly' 
AND subcategory IN ('pov_used_on', 'saved_by_veto', 'survival', 'bb_arena_winner', 'nominee', 'replacement_nominee');