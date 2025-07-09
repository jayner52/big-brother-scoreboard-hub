-- Fixed trigger function without UNNEST in WHERE clauses
CREATE OR REPLACE FUNCTION public.maintain_contestant_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contestant status based on eviction events and weekly results
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
  END
  WHERE contestants.pool_id = COALESCE(NEW.pool_id, OLD.pool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;