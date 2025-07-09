-- Clean up incorrect eviction data and logic

-- 1. Remove incorrect manual eviction events for Ava Pearl and Isaiah that don't match weekly_results
DELETE FROM public.weekly_events 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
AND week_number = 3
AND event_type IN (
  SELECT id::text FROM detailed_scoring_rules 
  WHERE subcategory = 'evicted'
)
AND contestant_id IN (
  SELECT id FROM contestants 
  WHERE name IN ('Ava Pearl', 'Isaiah "Zae" Frederich')
  AND pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
);

-- 2. Reset contestants who shouldn't be marked as evicted back to active
-- Kelley Jorgensen has no eviction events at all
-- Ava Pearl and Isaiah have no legitimate eviction in weekly_results
UPDATE public.contestants 
SET is_active = true
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
AND name IN ('Kelley Jorgensen', 'Ava Pearl', 'Isaiah "Zae" Frederich');