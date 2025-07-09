-- Weekly Events Scoring Rules Cleanup
-- Update the 5 weekly_events rules we're keeping with correct points/emojis/states

-- Update bb_arena_winner
UPDATE public.detailed_scoring_rules 
SET points = 2, emoji = '🏟️', is_active = true
WHERE category = 'weekly_events' AND subcategory = 'bb_arena_winner';

-- Update nominee  
UPDATE public.detailed_scoring_rules 
SET points = -1, emoji = '🟥', is_active = true
WHERE category = 'weekly_events' AND subcategory = 'nominee';

-- Update pov_used_on
UPDATE public.detailed_scoring_rules 
SET points = 1, emoji = '✅', is_active = true
WHERE category = 'weekly_events' AND subcategory = 'pov_used_on';

-- Update replacement_nominee
UPDATE public.detailed_scoring_rules 
SET points = -1, emoji = '🔄', is_active = true
WHERE category = 'weekly_events' AND subcategory = 'replacement_nominee';

-- Update survival (keep existing, add emoji)
UPDATE public.detailed_scoring_rules 
SET points = 1, emoji = '❤️', is_active = true
WHERE category = 'weekly_events' AND subcategory = 'survival';

-- Deactivate the 3 rules we're removing from weekly_events
UPDATE public.detailed_scoring_rules 
SET is_active = false 
WHERE category = 'weekly_events' 
AND subcategory IN ('hoh_winner', 'pov_winner', 'jury_member');