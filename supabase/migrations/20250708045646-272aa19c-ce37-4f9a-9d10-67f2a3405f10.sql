-- Final cleanup - remove inconsistent entries and ensure exact match with config
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'special_events' 
AND subcategory IN ('comes_back_evicted', 'granted_safety', 'leaves_not_eviction', 'power_from_hg');

-- Update won_safety_comp entry to match our config
UPDATE public.detailed_scoring_rules 
SET 
  subcategory = 'won_safety_comp',
  description = 'Won Safety Competition',
  points = 1
WHERE category = 'special_events' AND description = 'Won Safety Competition';

-- Ensure all costume_punishment entries match
UPDATE public.detailed_scoring_rules 
SET 
  description = 'Costume Punishment',
  points = -1
WHERE category = 'special_events' AND subcategory = 'costume_punishment';