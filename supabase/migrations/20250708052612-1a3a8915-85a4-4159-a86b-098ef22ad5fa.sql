-- Phase 1: Remove enabled_special_events from pools table since we'll use scoring rules instead
ALTER TABLE public.pools 
DROP COLUMN IF EXISTS enabled_special_events;

-- Phase 2: Ensure all special events are properly in scoring rules table
-- First, let's clean up any duplicates and ensure consistent data

-- Delete any old inconsistent entries
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

-- Insert any missing special events that should be configurable
INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active) VALUES
  ('special_events', 'won_special_power', '🔮 Won Special Power/Advantage', 2, true),
  ('special_events', 'used_special_power', '⚡ Used Special Power', 1, true),
  ('special_events', 'won_prize', '🎁 Won Prize/Reward', 2, true),
  ('special_events', 'in_showmance', '💕 In a Showmance', 1, true),
  ('special_events', 'received_penalty', '⚠️ Received Penalty/Punishment', -2, true),
  ('special_events', 'costume_punishment', '🤡 Costume Punishment', -1, true),
  ('special_events', 'came_back_evicted', '🔄 Came Back After Evicted', 5, true),
  ('special_events', 'self_evicted', '🚪 Self-Evicted/Quit', -5, true),
  ('special_events', 'removed_production', '❌ Removed by Production', -5, true),
  ('special_events', 'won_safety_comp', '🔒 Won Safety Competition', 1, true),
  ('special_events', 'custom_event', '✨ Custom Event', 1, true)
ON CONFLICT (category, subcategory) DO UPDATE SET
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  is_active = EXCLUDED.is_active;