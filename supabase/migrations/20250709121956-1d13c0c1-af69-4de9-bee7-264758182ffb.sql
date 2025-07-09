-- Clean up duplicate contestants and fix data consistency
DELETE FROM public.contestants 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, pool_id ORDER BY created_at DESC) as rn
    FROM public.contestants
  ) t 
  WHERE rn > 1
);

-- Update Jimmy's status to inactive since he was evicted in week 1
UPDATE public.contestants 
SET is_active = false 
WHERE name LIKE '%Jimmy%' AND is_active = true;

-- Insert special event scoring rules if they don't exist
INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
SELECT 'special_events', 'self_evicted', 'Self-Evicted', -2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.detailed_scoring_rules 
  WHERE category = 'special_events' AND subcategory = 'self_evicted'
);

INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
SELECT 'special_events', 'removed_production', 'Removed by Production', -2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.detailed_scoring_rules 
  WHERE category = 'special_events' AND subcategory = 'removed_production'
);

INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
SELECT 'special_events', 'came_back_evicted', 'Came Back After Evicted', 2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.detailed_scoring_rules 
  WHERE category = 'special_events' AND subcategory = 'came_back_evicted'
);