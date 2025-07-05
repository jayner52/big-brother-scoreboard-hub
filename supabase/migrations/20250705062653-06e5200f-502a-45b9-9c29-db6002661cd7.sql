-- Clean up duplicate default contestants (pool_id IS NULL)
-- Keep only one contestant per name using row_number()
WITH ranked_contestants AS (
  SELECT id, name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM public.contestants 
  WHERE pool_id IS NULL
)
DELETE FROM public.contestants 
WHERE id IN (
  SELECT id 
  FROM ranked_contestants 
  WHERE rn > 1
);

-- Verify the cleanup - should return no rows if successful
SELECT name, COUNT(*) as count 
FROM public.contestants 
WHERE pool_id IS NULL 
GROUP BY name 
HAVING COUNT(*) > 1;