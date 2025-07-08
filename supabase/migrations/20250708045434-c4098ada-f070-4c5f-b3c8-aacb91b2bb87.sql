-- Clean up duplicate and inconsistent scoring rules
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'special_events' AND subcategory IN (
  'special_power', 'won_secret_power', 'wins_prize', 'receives_punishment'
);

-- Add missing special events to scoring rules
DO $$
BEGIN
  -- used_special_power
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'used_special_power') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'used_special_power', 'Used Special Power', 1, true);
  END IF;
  
  -- won_prize
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'won_prize') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'won_prize', 'Won Prize/Reward', 2, true);
  END IF;
  
  -- received_penalty
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'received_penalty') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'received_penalty', 'Received Penalty/Punishment', -2, true);
  END IF;
  
  -- costume_punishment
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'costume_punishment') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'costume_punishment', 'Costume Punishment', -1, true);
  END IF;
  
  -- custom_event
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'custom_event') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'custom_event', 'Custom Event', 1, true);
  END IF;
END $$;

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