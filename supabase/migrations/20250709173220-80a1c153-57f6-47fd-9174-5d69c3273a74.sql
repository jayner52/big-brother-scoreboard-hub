-- Fix eviction status inconsistencies for pool 1164288f-70b3-43c5-b19d-b57e115b8710

-- Step 1: Convert Week 2 from draft to final status to activate Keanu's eviction
UPDATE public.weekly_results 
SET is_draft = false 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND week_number = 2 
  AND evicted_contestant = 'Keanu Soto'
  AND is_draft = true;

-- Step 2: Add missing "removed_production" special event for Rylie Jeffries
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
  2 as week_number,
  dsr.id::text as event_type,
  'Removed by production' as description,
  dsr.points as points_awarded
FROM public.contestants c
JOIN public.detailed_scoring_rules dsr ON dsr.subcategory = 'removed_production' AND dsr.category = 'special_events'
WHERE c.name = 'Rylie Jeffries' 
  AND c.pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
  AND NOT EXISTS (
    SELECT 1 FROM public.special_events se2
    JOIN public.detailed_scoring_rules dsr2 ON se2.event_type = dsr2.id::text
    WHERE se2.contestant_id = c.id 
      AND dsr2.subcategory = 'removed_production'
      AND se2.week_number = 2
  );

-- Step 3: Fix Vince's active status (should be inactive due to removed_production event)
UPDATE public.contestants 
SET is_active = false 
WHERE name = 'Vince Parara' 
  AND pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
  AND is_active = true;

-- Step 4: Fix pool payment configuration - disable buy-in for pool with 0 fee
UPDATE public.pools 
SET has_buy_in = false 
WHERE id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND entry_fee_amount = 0 
  AND has_buy_in = true;

-- Step 5: Trigger the maintain_contestant_status() function to ensure all statuses are correct
-- This will update all contestants based on weekly_results and special_events
UPDATE public.contestants 
SET is_active = CASE 
  WHEN contestants.id IN (
    -- Check for special eviction events (self-evicted, removed by production)
    SELECT we.contestant_id 
    FROM public.weekly_events we
    JOIN public.detailed_scoring_rules dsr ON we.event_type = dsr.id::text
    WHERE dsr.subcategory IN ('self_evicted', 'removed_production')
      AND we.pool_id = contestants.pool_id
    UNION
    SELECT se.contestant_id 
    FROM public.special_events se
    JOIN public.detailed_scoring_rules dsr ON se.event_type = dsr.id::text
    WHERE dsr.subcategory IN ('self_evicted', 'removed_production')
      AND se.pool_id = contestants.pool_id
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
END
WHERE contestants.pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710';

-- Step 6: Verify the results - show evicted contestants
SELECT 
  c.name,
  c.is_active,
  'Weekly eviction' as eviction_type,
  wr.week_number,
  wr.evicted_contestant
FROM public.contestants c
JOIN public.weekly_results wr ON c.name = wr.evicted_contestant
WHERE c.pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
  AND wr.is_draft = false
  AND wr.evicted_contestant IS NOT NULL

UNION ALL

SELECT 
  c.name,
  c.is_active,
  'Special event: ' || dsr.subcategory as eviction_type,
  se.week_number,
  c.name
FROM public.contestants c
JOIN public.special_events se ON c.id = se.contestant_id
JOIN public.detailed_scoring_rules dsr ON se.event_type = dsr.id::text
WHERE c.pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710'
  AND dsr.subcategory IN ('self_evicted', 'removed_production')

ORDER BY week_number, name;