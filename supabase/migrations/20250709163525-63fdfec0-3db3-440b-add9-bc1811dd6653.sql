-- Enhanced trigger function to handle all eviction scenarios and revival
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
      -- Check for weekly evictions in results table (including drafts that represent real evictions)
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
  WHERE contestants.pool_id = COALESCE(NEW.pool_id, OLD.pool_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS maintain_contestant_status_weekly_events ON public.weekly_events;
DROP TRIGGER IF EXISTS maintain_contestant_status_weekly_results ON public.weekly_results;
DROP TRIGGER IF EXISTS maintain_contestant_status_special_events ON public.special_events;

-- Create triggers for weekly_events table
CREATE TRIGGER maintain_contestant_status_weekly_events
  AFTER INSERT OR UPDATE OR DELETE ON public.weekly_events
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_contestant_status();

-- Create triggers for weekly_results table  
CREATE TRIGGER maintain_contestant_status_weekly_results
  AFTER INSERT OR UPDATE OR DELETE ON public.weekly_results
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_contestant_status();

-- Create triggers for special_events table (for revivals)
CREATE TRIGGER maintain_contestant_status_special_events
  AFTER INSERT OR UPDATE OR DELETE ON public.special_events
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_contestant_status();