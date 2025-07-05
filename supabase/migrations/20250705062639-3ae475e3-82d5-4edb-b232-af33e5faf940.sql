-- Clean up duplicate default contestants (pool_id IS NULL)
-- Keep only the contestant with the lowest ID for each name
DELETE FROM public.contestants 
WHERE pool_id IS NULL 
AND id NOT IN (
  SELECT MIN(id) 
  FROM public.contestants 
  WHERE pool_id IS NULL 
  GROUP BY name
);

-- Verify the cleanup
SELECT name, COUNT(*) as count 
FROM public.contestants 
WHERE pool_id IS NULL 
GROUP BY name 
HAVING COUNT(*) > 1;