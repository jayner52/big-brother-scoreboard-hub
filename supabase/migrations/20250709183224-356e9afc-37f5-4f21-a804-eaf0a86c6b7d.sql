-- Phase 2: Rebuild Eviction Status Logic - Core Detection Functions (Fixed)
-- Remove duplicate 'evicted' from weekly_events category (conflicts with weekly_results)
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'weekly_events' AND subcategory = 'evicted';

-- Create function to get all evicted contestants for a pool
CREATE OR REPLACE FUNCTION public.get_evicted_contestants(target_pool_id uuid)
RETURNS TABLE(contestant_id uuid, eviction_source text, eviction_week integer) AS $$
BEGIN
  RETURN QUERY
  WITH evicted_from_results AS (
    -- Get evictions from weekly_results (normal evictions)
    SELECT 
      c.id as contestant_id,
      'weekly_results' as eviction_source,
      wr.week_number as eviction_week
    FROM public.weekly_results wr
    JOIN public.contestants c ON c.pool_id = target_pool_id
    WHERE wr.pool_id = target_pool_id
    AND (
      c.name = wr.evicted_contestant OR 
      c.name = wr.second_evicted_contestant OR 
      c.name = wr.third_evicted_contestant
    )
  ),
  evicted_from_events AS (
    -- Get evictions from weekly_events (special evictions)
    SELECT 
      we.contestant_id,
      'special_events' as eviction_source,
      we.week_number as eviction_week
    FROM public.weekly_events we
    JOIN public.detailed_scoring_rules dsr ON dsr.id = we.event_type
    WHERE we.pool_id = target_pool_id
    AND dsr.subcategory IN ('self_evicted', 'removed_production')
  )
  SELECT * FROM evicted_from_results
  UNION ALL
  SELECT * FROM evicted_from_events
  ORDER BY eviction_week ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to update contestant eviction status
CREATE OR REPLACE FUNCTION public.update_contestant_eviction_status(target_pool_id uuid)
RETURNS TABLE(contestant_id uuid, name text, was_evicted boolean) AS $$
DECLARE
  evicted_count INTEGER := 0;
  reactivated_count INTEGER := 0;
BEGIN
  -- Update contestants.is_active based on eviction status
  WITH evicted_contestants AS (
    SELECT DISTINCT ec.contestant_id 
    FROM public.get_evicted_contestants(target_pool_id) ec
  ),
  -- Handle revivals (came_back_evicted events)
  revived_contestants AS (
    SELECT DISTINCT we.contestant_id
    FROM public.weekly_events we
    JOIN public.detailed_scoring_rules dsr ON dsr.id = we.event_type
    WHERE we.pool_id = target_pool_id
    AND dsr.subcategory = 'came_back_evicted'
  ),
  -- Final eviction status: evicted but not revived
  final_evicted AS (
    SELECT ec.contestant_id
    FROM evicted_contestants ec
    LEFT JOIN revived_contestants rc ON ec.contestant_id = rc.contestant_id
    WHERE rc.contestant_id IS NULL
  )
  -- Update contestants table
  UPDATE public.contestants 
  SET is_active = CASE 
    WHEN fe.contestant_id IS NOT NULL THEN false
    ELSE true
  END
  FROM final_evicted fe
  WHERE contestants.pool_id = target_pool_id
  AND (contestants.id = fe.contestant_id OR fe.contestant_id IS NULL);

  -- Get count of changes
  SELECT COUNT(*) INTO evicted_count
  FROM public.contestants c
  WHERE c.pool_id = target_pool_id AND c.is_active = false;

  SELECT COUNT(*) INTO reactivated_count  
  FROM public.contestants c
  WHERE c.pool_id = target_pool_id AND c.is_active = true;

  -- Return summary of affected contestants
  RETURN QUERY
  SELECT 
    c.id as contestant_id,
    c.name,
    NOT c.is_active as was_evicted
  FROM public.contestants c
  WHERE c.pool_id = target_pool_id
  ORDER BY c.name;
  
  -- Log the results
  RAISE NOTICE 'Updated eviction status for pool %: % evicted, % active', 
    target_pool_id, evicted_count, reactivated_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-update eviction status
CREATE OR REPLACE FUNCTION public.trigger_update_eviction_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update eviction status for the affected pool
  PERFORM public.update_contestant_eviction_status(
    COALESCE(NEW.pool_id, OLD.pool_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers on weekly_results
DROP TRIGGER IF EXISTS update_eviction_status_on_weekly_results ON public.weekly_results;
CREATE TRIGGER update_eviction_status_on_weekly_results
  AFTER INSERT OR UPDATE OR DELETE ON public.weekly_results
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_eviction_status();

-- Create triggers on weekly_events (for special evictions)
DROP TRIGGER IF EXISTS update_eviction_status_on_weekly_events ON public.weekly_events;
CREATE TRIGGER update_eviction_status_on_weekly_events
  AFTER INSERT OR UPDATE OR DELETE ON public.weekly_events
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_eviction_status();

-- Run initial sync for all pools
DO $$
DECLARE
  pool_record RECORD;
  sync_results RECORD;
BEGIN
  FOR pool_record IN SELECT id, name FROM public.pools LOOP
    RAISE NOTICE 'Syncing eviction status for pool: % (%)', pool_record.name, pool_record.id;
    
    -- Update eviction status for this pool
    FOR sync_results IN 
      SELECT * FROM public.update_contestant_eviction_status(pool_record.id)
    LOOP
      IF sync_results.was_evicted THEN
        RAISE NOTICE '  - % is now EVICTED', sync_results.name;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Initial eviction status sync complete for all pools';
END;
$$;