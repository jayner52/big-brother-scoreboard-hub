-- Clean up duplicate and inconsistent scoring rules
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'special_events' AND subcategory IN (
  'special_power', 'won_secret_power', 'wins_prize', 'receives_punishment'
);

-- Add all missing special events to scoring rules to match configuration
INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active) VALUES
  ('special_events', 'used_special_power', 'Used Special Power', 1, true),
  ('special_events', 'won_prize', 'Won Prize/Reward', 2, true),
  ('special_events', 'received_penalty', 'Received Penalty/Punishment', -2, true),
  ('special_events', 'costume_punishment', 'Costume Punishment', -1, true),
  ('special_events', 'custom_event', 'Custom Event', 1, true)
ON CONFLICT (category, subcategory) DO UPDATE SET
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  is_active = EXCLUDED.is_active;

-- Update existing scoring rules to match exact configuration
UPDATE public.detailed_scoring_rules 
SET 
  description = 'Won Special Power/Advantage',
  points = 2
WHERE category = 'special_events' AND subcategory = 'won_special_power';

UPDATE public.detailed_scoring_rules 
SET 
  description = 'Won Safety Competition',
  points = 1
WHERE category = 'special_events' AND subcategory = 'won_safety_comp';