-- Fix Isaiah's eviction status - convert draft to actual eviction
UPDATE public.weekly_results 
SET is_draft = false 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND week_number = 1 
  AND evicted_contestant = 'Isaiah "Zae" Frederich'
  AND is_draft = true;

-- Manually update Isaiah's status to evicted
UPDATE public.contestants 
SET is_active = false 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND name = 'Isaiah "Zae" Frederich';