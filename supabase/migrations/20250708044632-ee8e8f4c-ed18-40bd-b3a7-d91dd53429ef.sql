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

-- Add missing special events to scoring rules (using individual inserts to avoid conflicts)
DO $$
BEGIN
  -- won_special_power
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'won_special_power') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'won_special_power', 'Won Special Power/Advantage', 2, true);
  END IF;
  
  -- in_showmance
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'in_showmance') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'in_showmance', 'In a Showmance', 1, true);
  END IF;
  
  -- came_back_evicted
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'came_back_evicted') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'came_back_evicted', 'Came Back After Evicted', 5, true);
  END IF;
  
  -- self_evicted
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'self_evicted') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'self_evicted', 'Self-Evicted/Quit', -5, true);
  END IF;
  
  -- removed_production
  IF NOT EXISTS (SELECT 1 FROM public.detailed_scoring_rules WHERE category = 'special_events' AND subcategory = 'removed_production') THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
    VALUES ('special_events', 'removed_production', 'Removed by Production', -5, true);
  END IF;
END $$;