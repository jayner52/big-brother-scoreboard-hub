-- Final aggressive cleanup: Remove ALL duplicates and clean slate
DO $$
DECLARE
  before_count INTEGER;
  after_count INTEGER;
BEGIN
  -- Count before
  SELECT COUNT(*) INTO before_count FROM public.contestants WHERE pool_id IS NULL;
  RAISE NOTICE 'BEFORE: % contestants with pool_id = NULL', before_count;
  
  -- First: Delete all weekly_events tied to NULL pool contestants to remove foreign key constraints
  DELETE FROM public.weekly_events 
  WHERE contestant_id IN (
    SELECT id FROM public.contestants WHERE pool_id IS NULL
  );
  
  RAISE NOTICE 'Deleted weekly_events for NULL pool contestants';
  
  -- Then: Keep only ONE of each unique name (the one with the lowest ID)
  DELETE FROM public.contestants 
  WHERE pool_id IS NULL 
  AND id NOT IN (
    SELECT MIN(id) 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name
  );
  
  -- Count after
  SELECT COUNT(*) INTO after_count FROM public.contestants WHERE pool_id IS NULL;
  RAISE NOTICE 'AFTER: % contestants with pool_id = NULL', after_count;
  
  -- Verify no duplicates
  IF EXISTS (
    SELECT name, COUNT(*) 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Still have duplicates!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: Cleanup complete, no duplicates remain';
END $$;