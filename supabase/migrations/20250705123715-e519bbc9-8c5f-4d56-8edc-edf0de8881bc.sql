-- FINAL AGGRESSIVE CLEANUP: Remove all remaining duplicates
DO $$
DECLARE
  total_before INTEGER;
  total_after INTEGER;
  events_deleted INTEGER;
  contestants_deleted INTEGER;
BEGIN
  -- Count total contestants before
  SELECT COUNT(*) INTO total_before FROM public.contestants;
  RAISE NOTICE 'BEFORE CLEANUP: % total contestants', total_before;
  
  -- Delete ALL weekly_events that reference contestants with pool_id = null
  -- This removes any foreign key constraints
  DELETE FROM public.weekly_events 
  WHERE contestant_id IN (
    SELECT id FROM public.contestants WHERE pool_id IS NULL
  );
  
  GET DIAGNOSTICS events_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % weekly_events for default contestants', events_deleted;
  
  -- Delete ALL contestants except one instance of each unique name
  -- Keep the contestant with the earliest created_at date
  WITH contestants_to_keep AS (
    SELECT DISTINCT ON (name) 
      id, name, created_at
    FROM public.contestants 
    WHERE pool_id IS NULL
    ORDER BY name, created_at ASC
  ),
  contestants_to_delete AS (
    SELECT c.id
    FROM public.contestants c
    WHERE c.pool_id IS NULL
    AND c.id NOT IN (SELECT id FROM contestants_to_keep)
  )
  DELETE FROM public.contestants 
  WHERE id IN (SELECT id FROM contestants_to_delete);
  
  GET DIAGNOSTICS contestants_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % duplicate contestants', contestants_deleted;
  
  -- Count after cleanup
  SELECT COUNT(*) INTO total_after FROM public.contestants;
  RAISE NOTICE 'AFTER CLEANUP: % total contestants remaining', total_after;
  
  -- Verify we have exactly one of each contestant
  IF EXISTS (
    SELECT name, COUNT(*) 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'CLEANUP FAILED: Still have duplicates!';
  END IF;
  
  -- Final verification
  DECLARE
    unique_names INTEGER;
    null_pool_contestants INTEGER;
  BEGIN
    SELECT COUNT(DISTINCT name) INTO unique_names FROM public.contestants WHERE pool_id IS NULL;
    SELECT COUNT(*) INTO null_pool_contestants FROM public.contestants WHERE pool_id IS NULL;
    
    IF unique_names != null_pool_contestants THEN
      RAISE EXCEPTION 'CLEANUP FAILED: % unique names but % contestants with null pool_id', unique_names, null_pool_contestants;
    END IF;
    
    RAISE NOTICE 'SUCCESS: % unique contestants with pool_id = null', null_pool_contestants;
  END;
  
END $$;