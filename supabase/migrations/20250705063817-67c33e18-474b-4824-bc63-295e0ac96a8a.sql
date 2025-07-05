-- Remove duplicates using ROW_NUMBER approach
DO $$
DECLARE
  before_count INTEGER;
  after_count INTEGER;
  events_deleted INTEGER;
BEGIN
  -- Count before
  SELECT COUNT(*) INTO before_count FROM public.contestants WHERE pool_id IS NULL;
  RAISE NOTICE 'BEFORE: % contestants with pool_id = NULL', before_count;
  
  -- First: Delete weekly_events to remove foreign key constraints
  DELETE FROM public.weekly_events 
  WHERE contestant_id IN (
    SELECT id FROM public.contestants WHERE pool_id IS NULL
  );
  
  GET DIAGNOSTICS events_deleted = ROW_COUNT;
  RAISE NOTICE 'Deleted % weekly_events for NULL pool contestants', events_deleted;
  
  -- Delete duplicates keeping oldest record (by created_at)
  WITH ranked_contestants AS (
    SELECT 
      id,
      name,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC, id::text ASC) as rn
    FROM public.contestants 
    WHERE pool_id IS NULL
  )
  DELETE FROM public.contestants 
  WHERE id IN (
    SELECT id FROM ranked_contestants WHERE rn > 1
  );
  
  -- Count after
  SELECT COUNT(*) INTO after_count FROM public.contestants WHERE pool_id IS NULL;
  RAISE NOTICE 'AFTER: % contestants with pool_id = NULL', after_count;
  
  -- Verify
  IF EXISTS (
    SELECT name, COUNT(*) 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Still have duplicates after cleanup!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: Duplicates removed. Reduced from % to %', before_count, after_count;
END $$;