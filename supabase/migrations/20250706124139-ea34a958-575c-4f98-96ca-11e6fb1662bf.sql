-- Clean up duplicate empty groups and fix data corruption
-- Remove duplicate empty groups (keeping only those with contestants)
WITH groups_with_contestants AS (
  SELECT DISTINCT cg.id, cg.group_name, cg.sort_order, cg.pool_id,
         COUNT(c.id) as contestant_count
  FROM contestant_groups cg
  LEFT JOIN contestants c ON cg.id = c.group_id AND c.is_active = true
  GROUP BY cg.id, cg.group_name, cg.sort_order, cg.pool_id
),
groups_to_keep AS (
  SELECT id, group_name, sort_order, pool_id, contestant_count,
         ROW_NUMBER() OVER (PARTITION BY pool_id, group_name ORDER BY contestant_count DESC, sort_order) as rn
  FROM groups_with_contestants
)
DELETE FROM contestant_groups 
WHERE id NOT IN (
  SELECT id FROM groups_to_keep WHERE rn = 1
);