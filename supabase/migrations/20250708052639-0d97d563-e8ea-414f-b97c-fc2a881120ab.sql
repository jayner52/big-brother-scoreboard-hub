-- Phase 1: Remove enabled_special_events from pools table since we'll use scoring rules instead
ALTER TABLE public.pools 
DROP COLUMN IF EXISTS enabled_special_events;

-- Phase 2: Clean up duplicate and inconsistent entries
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'special_events' 
AND subcategory IN ('special_power', 'won_secret_power', 'wins_prize', 'receives_punishment');

-- Update Won Safety Competition emoji (change from 🛡️ to 🔒 to avoid conflict with BB Arena)
UPDATE public.detailed_scoring_rules 
SET description = '🔒 Won Safety Competition'
WHERE category = 'special_events' AND subcategory = 'won_safety_comp';

-- Ensure BB Arena uses shield emoji consistently  
UPDATE public.detailed_scoring_rules 
SET description = '🛡️ Won BB Arena/AI Arena'
WHERE category = 'special_events' AND subcategory = 'won_bb_arena';

-- Insert missing special events individually to avoid conflicts
DO $$
BEGIN
  -- won_special_power
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'won_special_power') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'won_special_power', '🔮 Won Special Power/Advantage', 2, true);
  END IF;
  
  -- used_special_power
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'used_special_power') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'used_special_power', '⚡ Used Special Power', 1, true);
  END IF;
  
  -- won_prize
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'won_prize') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'won_prize', '🎁 Won Prize/Reward', 2, true);
  END IF;
  
  -- in_showmance
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'in_showmance') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'in_showmance', '💕 In a Showmance', 1, true);
  END IF;
  
  -- received_penalty
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'received_penalty') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'received_penalty', '⚠️ Received Penalty/Punishment', -2, true);
  END IF;
  
  -- costume_punishment
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'costume_punishment') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'costume_punishment', '🤡 Costume Punishment', -1, true);
  END IF;
  
  -- came_back_evicted
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'came_back_evicted') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'came_back_evicted', '🔄 Came Back After Evicted', 5, true);
  END IF;
  
  -- self_evicted
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'self_evicted') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'self_evicted', '🚪 Self-Evicted/Quit', -5, true);
  END IF;
  
  -- removed_production
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'removed_production') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'removed_production', '❌ Removed by Production', -5, true);
  END IF;
  
  -- won_safety_comp
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'won_safety_comp') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'won_safety_comp', '🔒 Won Safety Competition', 1, true);
  END IF;
  
  -- custom_event
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'custom_event') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'custom_event', '✨ Custom Event', 1, true);
  END IF;
END $$;