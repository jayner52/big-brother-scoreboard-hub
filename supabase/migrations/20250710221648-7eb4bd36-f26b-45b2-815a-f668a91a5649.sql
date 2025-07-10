-- Clean up orphaned contestants with null pool_id that were created incorrectly
-- These are contestants that were added manually but didn't get associated with a pool
DELETE FROM public.contestants 
WHERE pool_id IS NULL 
AND data_source = 'manual'
AND created_at > '2024-01-01'::timestamp;