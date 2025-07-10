-- Fix houseguest persistence issue by protecting manually added contestants from eviction status synchronization

-- Update the eviction status function to exclude manually added contestants
CREATE OR REPLACE FUNCTION public.update_contestant_eviction_status(target_pool_id uuid)
RETURNS TABLE(contestant_id uuid, name text, was_evicted boolean) AS $$
DECLARE
  evicted_count INTEGER := 0;
  reactivated_count INTEGER := 0;
BEGIN
  -- First, mark all contestants as active, BUT SKIP manually added ones
  UPDATE public.contestants 
  SET is_active = true
  WHERE pool_id = target_pool_id
  AND COALESCE(data_source, 'bb27_preset') != 'manual';  -- Don't touch manual contestants

  -- Mark evicted contestants as inactive, BUT SKIP manually added ones
  UPDATE public.contestants 
  SET is_active = false
  WHERE pool_id = target_pool_id
  AND COALESCE(data_source, 'bb27_preset') != 'manual'  -- Don't touch manual contestants
  AND id IN (
    SELECT DISTINCT ec.evicted_contestant_id 
    FROM public.get_evicted_contestants(target_pool_id) ec
    WHERE ec.evicted_contestant_id NOT IN (
      -- Exclude revived contestants
      SELECT we.contestant_id
      FROM public.weekly_events we
      JOIN public.detailed_scoring_rules dsr ON dsr.id = we.event_type::uuid
      WHERE we.pool_id = target_pool_id
      AND dsr.subcategory = 'came_back_evicted'
    )
  );

  -- Get count of changes (excluding manual contestants from count)
  SELECT COUNT(*) INTO evicted_count
  FROM public.contestants c
  WHERE c.pool_id = target_pool_id 
  AND c.is_active = false
  AND COALESCE(c.data_source, 'bb27_preset') != 'manual';

  SELECT COUNT(*) INTO reactivated_count  
  FROM public.contestants c
  WHERE c.pool_id = target_pool_id 
  AND c.is_active = true
  AND COALESCE(c.data_source, 'bb27_preset') != 'manual';

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
  RAISE NOTICE 'Updated eviction status for pool % (protected % manual contestants): % evicted, % active', 
    target_pool_id, 
    (SELECT COUNT(*) FROM public.contestants WHERE pool_id = target_pool_id AND COALESCE(data_source, 'bb27_preset') = 'manual'),
    evicted_count, 
    reactivated_count;
END;
$$ LANGUAGE plpgsql;