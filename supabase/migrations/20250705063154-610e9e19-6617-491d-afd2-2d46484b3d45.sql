-- More aggressive cleanup - delete ALL duplicates and recreate from scratch if needed
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Check current state
  SELECT COUNT(*) INTO duplicate_count
  FROM public.contestants 
  WHERE pool_id IS NULL;
  
  RAISE NOTICE 'Found % default contestants before cleanup', duplicate_count;
  
  -- Delete all but one copy of each contestant (keep the one with the lowest ID)
  DELETE FROM public.contestants a 
  WHERE pool_id IS NULL 
  AND EXISTS (
    SELECT 1 FROM public.contestants b 
    WHERE b.pool_id IS NULL 
    AND b.name = a.name 
    AND b.id < a.id
  );
  
  -- Check final count
  SELECT COUNT(*) INTO duplicate_count
  FROM public.contestants 
  WHERE pool_id IS NULL;
  
  RAISE NOTICE 'Cleanup complete: % default contestants remain', duplicate_count;
  
  -- Final verification
  IF EXISTS (
    SELECT name 
    FROM public.contestants 
    WHERE pool_id IS NULL 
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Still have duplicates after cleanup!';
  END IF;
  
  RAISE NOTICE 'SUCCESS: All duplicates removed';
END $$;