-- Fix Isaiah's eviction status - convert draft to actual eviction
UPDATE public.weekly_results 
SET is_draft = false 
WHERE pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710' 
  AND week_number = 1 
  AND evicted_contestant = 'Isaiah "Zae" Frederich'
  AND is_draft = true;

-- Manually trigger the contestant status update for this pool
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
    -- Check for weekly evictions in results table (now including Isaiah)
    SELECT unnest(ARRAY[
      wr.evicted_contestant,
      wr.second_evicted_contestant, 
      wr.third_evicted_contestant
    ])
    FROM public.weekly_results wr
    WHERE wr.pool_id = contestants.pool_id
      AND wr.is_draft = false
      AND unnest(ARRAY[
            wr.evicted_contestant,
            wr.second_evicted_contestant, 
            wr.third_evicted_contestant
          ]) IS NOT NULL
  ) THEN false
  -- Check for revival events - contestant can be reactivated if they came back
  WHEN contestants.id IN (
    SELECT se.contestant_id
    FROM public.special_events se
    JOIN public.detailed_scoring_rules dsr ON se.event_type = dsr.id::text
    WHERE dsr.subcategory = 'came_back_evicted'
      AND se.pool_id = contestants.pool_id
      -- Only consider revival if it happened after eviction
      AND se.week_number > COALESCE((
        SELECT MIN(wr.week_number)
        FROM public.weekly_results wr
        WHERE wr.pool_id = contestants.pool_id
          AND wr.is_draft = false
          AND contestants.name IN (wr.evicted_contestant, wr.second_evicted_contestant, wr.third_evicted_contestant)
      ), 0)
  ) THEN true
  ELSE true
END
WHERE contestants.pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710';