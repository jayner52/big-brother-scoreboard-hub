-- Phase 1: Clean up global template rules
-- Since each pool now has its own copy of scoring rules, we can safely remove the global templates

-- First, let's check for any orphaned global rules that might break the system
-- Remove all global template rules (pool_id IS NULL) since they're no longer needed
DELETE FROM public.detailed_scoring_rules 
WHERE pool_id IS NULL;

-- Update the seed_pool_scoring_rules function to work with a cleaner template system
-- Instead of copying from global rules, we'll use a hardcoded set of defaults

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
  (target_pool_id, 'competition', 'hoh_winner', 'Head of Household Winner', '👑', 10, true),
  (target_pool_id, 'competition', 'pov_winner', 'Power of Veto Winner', '🛡️', 7, true),
  
  -- Weekly events  
  (target_pool_id, 'weekly_events', 'nominee', 'Nominated for Eviction', '🎯', 3, true),
  (target_pool_id, 'weekly_events', 'pov_used_on', 'Saved by Power of Veto', '🛡️', 5, true),
  (target_pool_id, 'weekly_events', 'replacement_nominee', 'Replacement Nominee', '🔄', 2, true),
  (target_pool_id, 'weekly_events', 'survival', 'Survived the Week', '✅', 2, true),
  (target_pool_id, 'weekly_events', 'bb_arena_winner', 'BB Arena Competition Winner', '🏟️', 5, true),
  
  -- Final placement
  (target_pool_id, 'final_placement', 'winner', 'Season Winner', '🏆', 25, true),
  (target_pool_id, 'final_placement', 'runner_up', 'Runner-up (2nd Place)', '🥈', 15, true),
  (target_pool_id, 'final_placement', 'americas_favorite', 'America''s Favorite Player', '❤️', 10, true),
  
  -- Jury phase
  (target_pool_id, 'jury', 'jury_member', 'Jury Member', '⚖️', 5, true),
  
  -- Special achievements
  (target_pool_id, 'special_achievements', 'block_survival_2_weeks', 'Survived 2 Weeks on the Block', '💪', 3, true),
  (target_pool_id, 'special_achievements', 'block_survival_4_weeks', 'Survived 4 Weeks on the Block', '🛡️', 5, true),
  (target_pool_id, 'special_achievements', 'floater_achievement', 'Floater Achievement', '🎈', 3, true),
  
  -- Special events
  (target_pool_id, 'special_events', 'costume_punishment', 'Costume Punishment', '🎭', 2, true),
  (target_pool_id, 'special_events', 'received_penalty', 'Received Penalty Vote', '⚠️', -2, true),
  (target_pool_id, 'special_events', 'removed_production', 'Removed by Production', '🚨', -5, true),
  (target_pool_id, 'special_events', 'used_special_power', 'Used Special Power', '⚡', 3, true),
  (target_pool_id, 'special_events', 'won_prize', 'Won Competition Prize', '🎁', 2, true),
  (target_pool_id, 'special_events', 'won_safety_comp', 'Won Safety Competition', '🛡️', 5, true),
  (target_pool_id, 'special_events', 'won_special_power', 'Won Special Power', '⚡', 5, true);
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'SEED_SCORING_RULES_CLEAN: Successfully inserted % scoring rules for pool %', inserted_count, target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_SCORING_RULES_CLEAN: ERROR - %', SQLERRM;
    RAISE;
END;
$function$;

-- Update the main seeding function to use the new clean version
CREATE OR REPLACE FUNCTION public.seed_new_pool_defaults(target_pool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== STARTING POOL SEEDING FOR % =====', target_pool_id;
  
  -- Validate target pool exists
  IF NOT EXISTS (SELECT 1 FROM public.pools WHERE id = target_pool_id) THEN
    RAISE EXCEPTION 'SEED_NEW_POOL_DEFAULTS: ERROR - Pool % does not exist!', target_pool_id;
  END IF;
  
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ✓ Target pool exists';
  
  -- Seed contestant groups first
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 1 - Seeding contestant groups...';
  PERFORM seed_pool_contestant_groups(target_pool_id);
  
  -- Seed BB27 contestants
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 2 - Seeding BB27 contestants...';
  PERFORM seed_pool_bb27_contestants(target_pool_id);
  
  -- Seed bonus questions
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 3 - Seeding bonus questions...';
  PERFORM seed_pool_bonus_questions(target_pool_id);
  
  -- Use the new clean scoring rules seeding
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 4 - Seeding scoring rules (clean version)...';
  PERFORM seed_pool_scoring_rules_clean(target_pool_id);
  
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== COMPLETED POOL SEEDING FOR % =====', target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== FATAL ERROR - % =====', SQLERRM;
    RAISE;
END;
$function$;