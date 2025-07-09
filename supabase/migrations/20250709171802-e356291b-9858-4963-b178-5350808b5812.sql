-- Test the maintain_contestant_status() trigger with removed by production event
-- This will verify the trigger correctly marks contestants as inactive

-- First, let's create a test special event for "removed by production"
INSERT INTO public.special_events (
  contestant_id,
  pool_id,
  week_number,
  event_type,
  description,
  points_awarded
)
SELECT 
  c.id as contestant_id,
  c.pool_id,
  1 as week_number,
  dsr.id::text as event_type,
  'Test removed by production event' as description,
  dsr.points as points_awarded
FROM public.contestants c
JOIN public.detailed_scoring_rules dsr ON dsr.subcategory = 'removed_production' AND dsr.category = 'special_events'
WHERE c.name = 'Isaiah Washington' 
  AND c.pool_id IS NOT NULL
  AND c.is_active = true
LIMIT 1;

-- Verify the trigger worked - Isaiah should now be inactive
SELECT 
  c.name,
  c.is_active as contestant_is_active,
  se.description as special_event,
  dsr.subcategory as event_subcategory
FROM public.contestants c
LEFT JOIN public.special_events se ON se.contestant_id = c.id
LEFT JOIN public.detailed_scoring_rules dsr ON se.event_type = dsr.id::text
WHERE c.name = 'Isaiah Washington' 
  AND c.pool_id IS NOT NULL;