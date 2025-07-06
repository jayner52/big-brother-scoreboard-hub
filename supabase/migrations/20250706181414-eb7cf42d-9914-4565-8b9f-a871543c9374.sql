-- Fix contestants with null group_id by assigning them to groups
-- This addresses the issue where manually created contestants don't have group assignments

UPDATE contestants 
SET group_id = (
  SELECT cg.id 
  FROM contestant_groups cg 
  WHERE cg.pool_id = contestants.pool_id 
  ORDER BY cg.sort_order 
  LIMIT 1
)
WHERE group_id IS NULL 
AND pool_id IS NOT NULL;