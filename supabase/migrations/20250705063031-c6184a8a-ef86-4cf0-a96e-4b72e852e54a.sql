-- Robust cleanup of duplicate default contestants (pool_id IS NULL)
-- This migration is idempotent and can be run multiple times safely

DO $$
DECLARE
  duplicate_count INTEGER;
  final_count INTEGER;
BEGIN
  -- Check initial state
  SELECT COUNT(*) INTO duplicate_count
  FROM public.contestants 
  WHERE pool_id IS NULL;
  
  RAISE NOTICE 'Starting cleanup: Found % default contestants', duplicate_count;
  
  -- Remove duplicates, keeping the oldest record for each name (by created_at)
  WITH ranked_contestants AS (
    SELECT 
      id, 
      name,
      created_at,
      ROW_NUMBER() OVER (
        PARTITION BY name 
        ORDER BY created_at ASC, id ASC
      ) as row_num
    FROM public.contestants 
    WHERE pool_id IS NULL
  ),
  contestants_to_delete AS (
    SELECT id 
    FROM ranked_contestants 
    WHERE row_num > 1
  )
  DELETE FROM public.contestants 
  WHERE id IN (SELECT id FROM contestants_to_delete);
  
  -- Check final state
  SELECT COUNT(*) INTO final_count
  FROM public.contestants 
  WHERE pool_id IS NULL;
  
  RAISE NOTICE 'Cleanup complete: % default contestants remain', final_count;
  
  -- Verify no duplicates remain
  IF EXISTS (
    SELECT name, COUNT(*) 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'ERROR: Duplicates still exist after cleanup!';
  ELSE
    RAISE NOTICE 'SUCCESS: No duplicate contestants remain';
  END IF;
END $$;