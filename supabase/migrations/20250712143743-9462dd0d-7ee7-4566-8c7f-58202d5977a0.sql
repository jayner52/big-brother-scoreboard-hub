-- Restore missing special events and revert point values to original configuration

-- First, add the missing special events to all existing pools
INSERT INTO public.detailed_scoring_rules (
  pool_id, category, subcategory, description, emoji, points, is_active
)
SELECT DISTINCT 
  dsr.pool_id,
  'special_events' as category,
  missing_events.subcategory,
  missing_events.description,
  missing_events.emoji,
  missing_events.points,
  missing_events.is_active
FROM public.detailed_scoring_rules dsr
CROSS JOIN (
  VALUES 
    ('in_showmance', 'In a Showmance', '💕', 2, true),
    ('leaves_not_eviction', 'Leaves Not at Eviction', '🚪', -3, true),
    ('comes_back_evicted', 'Comes Back After Being Evicted', '🔄', 5, true),
    ('special_power', 'Given/Wins Special Power', '⚡', 2, true),
    ('power_from_hg', 'Given Power/Prize from Other HG', '🤝', 1, true),
    ('granted_safety', 'Granted Safety for Week/Team Wins Comp', '🛡️', 1, true)
) AS missing_events(subcategory, description, emoji, points, is_active)
WHERE dsr.pool_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.detailed_scoring_rules existing
    WHERE existing.pool_id = dsr.pool_id 
      AND existing.category = 'special_events'
      AND existing.subcategory = missing_events.subcategory
  )
GROUP BY dsr.pool_id;

-- Revert point values back to original configuration
UPDATE public.detailed_scoring_rules 
SET points = CASE subcategory
  WHEN 'hoh_winner' THEN 3
  WHEN 'pov_winner' THEN 3
  WHEN 'survival' THEN 1
  WHEN 'jury_member' THEN 2
  WHEN 'winner' THEN 10
  WHEN 'runner_up' THEN 5
  WHEN 'americas_favorite' THEN 3
  ELSE points
END
WHERE subcategory IN ('hoh_winner', 'pov_winner', 'survival', 'jury_member', 'winner', 'runner_up', 'americas_favorite');

-- Update the seeding function to include all special events
CREATE OR REPLACE FUNCTION public.seed_pool_scoring_rules_clean(target_pool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  inserted_count INTEGER;
BEGIN
  RAISE NOTICE 'SEED_SCORING_RULES_CLEAN: Starting for pool_id: %', target_pool_id;
  
  -- Insert the complete set of default scoring rules for a new pool
  INSERT INTO public.detailed_scoring_rules (
    pool_id, category, subcategory, description, emoji, points, is_active
  ) VALUES
  -- Competition events
  (target_pool_id, 'competition', 'hoh_winner', 'Head of Household Winner', '👑', 3, true),
  (target_pool_id, 'competition', 'pov_winner', 'Power of Veto Winner', '🛡️', 3, true),
  
  -- Weekly events  
  (target_pool_id, 'weekly_events', 'nominee', 'Nominated for Eviction', '🎯', 3, true),
  (target_pool_id, 'weekly_events', 'pov_used_on', 'Saved by Power of Veto', '🛡️', 5, true),
  (target_pool_id, 'weekly_events', 'replacement_nominee', 'Replacement Nominee', '🔄', 2, true),
  (target_pool_id, 'weekly_events', 'survival', 'Survived the Week', '✅', 1, true),
  (target_pool_id, 'weekly_events', 'bb_arena_winner', 'BB Arena Competition Winner', '🏟️', 5, true),
  
  -- Final placement
  (target_pool_id, 'final_placement', 'winner', 'Season Winner', '🏆', 10, true),
  (target_pool_id, 'final_placement', 'runner_up', 'Runner-up (2nd Place)', '🥈', 5, true),
  (target_pool_id, 'final_placement', 'americas_favorite', 'America''s Favorite Player', '❤️', 3, true),
  
  -- Jury phase
  (target_pool_id, 'jury', 'jury_member', 'Jury Member', '⚖️', 2, true),
  
  -- Special achievements
  (target_pool_id, 'special_achievements', 'block_survival_2_weeks', 'Survived 2 Weeks on the Block', '💪', 3, true),
  (target_pool_id, 'special_achievements', 'block_survival_4_weeks', 'Survived 4 Weeks on the Block', '🛡️', 5, true),
  (target_pool_id, 'special_achievements', 'floater_achievement', 'Floater Achievement', '🎈', 3, true),
  
  -- Special events (all original events included)
  (target_pool_id, 'special_events', 'costume_punishment', 'Costume Punishment', '🎭', 2, true),
  (target_pool_id, 'special_events', 'received_penalty', 'Received Penalty Vote', '⚠️', -2, true),
  (target_pool_id, 'special_events', 'removed_production', 'Removed by Production', '🚨', -5, true),
  (target_pool_id, 'special_events', 'used_special_power', 'Used Special Power', '⚡', 3, true),
  (target_pool_id, 'special_events', 'won_prize', 'Won Competition Prize', '🎁', 2, true),
  (target_pool_id, 'special_events', 'won_safety_comp', 'Won Safety Competition', '🛡️', 5, true),
  (target_pool_id, 'special_events', 'won_special_power', 'Won Special Power', '⚡', 5, true),
  (target_pool_id, 'special_events', 'in_showmance', 'In a Showmance', '💕', 2, true),
  (target_pool_id, 'special_events', 'leaves_not_eviction', 'Leaves Not at Eviction', '🚪', -3, true),
  (target_pool_id, 'special_events', 'comes_back_evicted', 'Comes Back After Being Evicted', '🔄', 5, true),
  (target_pool_id, 'special_events', 'special_power', 'Given/Wins Special Power', '⚡', 2, true),
  (target_pool_id, 'special_events', 'power_from_hg', 'Given Power/Prize from Other HG', '🤝', 1, true),
  (target_pool_id, 'special_events', 'granted_safety', 'Granted Safety for Week/Team Wins Comp', '🛡️', 1, true),
  (target_pool_id, 'special_events', 'self_evicted', 'Self-Evicted', '🚪', -5, true),
  (target_pool_id, 'special_events', 'came_back_evicted', 'Came Back After Evicted', '🔄', 5, true),
  (target_pool_id, 'special_events', 'custom_event', 'Custom Event', '⭐', 1, false);
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'SEED_SCORING_RULES_CLEAN: Successfully inserted % scoring rules for pool %', inserted_count, target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_SCORING_RULES_CLEAN: ERROR - %', SQLERRM;
    RAISE;
END;
$function$;