-- Phase 1: Fix eviction status database consistency

-- First, convert Isaiah's week 1 eviction from draft to final (assuming it's a real eviction)
UPDATE public.weekly_results 
SET is_draft = false 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND week_number = 1 
  AND evicted_contestant = 'Isaiah "Zae" Frederich'
  AND is_draft = true;

-- Now manually trigger the status update for all contestants to sync with weekly_results
-- This will set Isaiah and any other evicted contestants to is_active = false
UPDATE public.contestants 
SET is_active = CASE 
  WHEN contestants.id IN (
    -- Check for special eviction events (self-evicted, removed by production)
    SELECT we.contestant_id 
    FROM public.weekly_events we
    JOIN public.detailed_scoring_rules dsr ON we.event_type = dsr.id::text
    WHERE dsr.subcategory IN ('self_evicted', 'removed_production')
      AND we.pool_id = contestants.pool_id
  ) OR contestants.name IN (
    -- Check for weekly evictions in results table - first evicted contestant
    SELECT wr.evicted_contestant
    FROM public.weekly_results wr
    WHERE wr.pool_id = contestants.pool_id
      AND wr.is_draft = false
      AND wr.evicted_contestant IS NOT NULL
    UNION
    -- Check for weekly evictions in results table - second evicted contestant  
    SELECT wr.second_evicted_contestant
    FROM public.weekly_results wr
    WHERE wr.pool_id = contestants.pool_id
      AND wr.is_draft = false
      AND wr.second_evicted_contestant IS NOT NULL
    UNION
    -- Check for weekly evictions in results table - third evicted contestant
    SELECT wr.third_evicted_contestant
    FROM public.weekly_results wr
    WHERE wr.pool_id = contestants.pool_id
      AND wr.is_draft = false
      AND wr.third_evicted_contestant IS NOT NULL
  ) THEN false
  -- Check for revival events - contestant can be reactivated if they came back
  WHEN contestants.id IN (
    SELECT se.contestant_id
    FROM public.special_events se
    JOIN public.detailed_scoring_rules dsr ON se.event_type = dsr.id::text
    WHERE dsr.subcategory = 'came_back_evicted'
      AND se.pool_id = contestants.pool_id
  ) THEN true
  ELSE true
END;