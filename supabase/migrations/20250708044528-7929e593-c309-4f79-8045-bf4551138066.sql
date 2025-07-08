-- Update scoring rules to match the special events configuration
UPDATE public.detailed_scoring_rules 
SET points = 2 
WHERE category = 'special_events' AND subcategory = 'won_secret_power';

UPDATE public.detailed_scoring_rules 
SET points = 2 
WHERE category = 'special_events' AND subcategory = 'wins_prize';

UPDATE public.detailed_scoring_rules 
SET points = 1 
WHERE category = 'special_events' AND subcategory = 'won_safety_comp';

-- Add missing special events to scoring rules
INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
VALUES 
  ('special_events', 'won_special_power', 'Won Special Power/Advantage', 2, true),
  ('special_events', 'in_showmance', 'In a Showmance', 1, true),
  ('special_events', 'came_back_evicted', 'Came Back After Evicted', 5, true),
  ('special_events', 'self_evicted', 'Self-Evicted/Quit', -5, true),
  ('special_events', 'removed_production', 'Removed by Production', -5, true)
ON CONFLICT (category, subcategory) DO UPDATE SET
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;