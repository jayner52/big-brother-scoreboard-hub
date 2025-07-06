-- Clean up duplicate contestants and redistribute across groups
-- First, remove contestants that have no group assignment (duplicates)
DELETE FROM contestants 
WHERE pool_id IS NULL AND group_id IS NULL;

-- Now assign remaining ungrouped contestants to groups
-- Get all contestants that need group assignment
WITH ungrouped_contestants AS (
  SELECT id, name, ROW_NUMBER() OVER (ORDER BY name) as row_num 
  FROM contestants 
  WHERE pool_id IS NULL AND group_id IS NULL
),
available_groups AS (
  SELECT id, group_name, ROW_NUMBER() OVER (ORDER BY sort_order) as group_num
  FROM contestant_groups 
  WHERE pool_id IS NULL AND group_name != 'Free Pick'
)
UPDATE contestants 
SET group_id = (
  SELECT g.id 
  FROM available_groups g 
  WHERE g.group_num = ((ungrouped_contestants.row_num - 1) % 4) + 1
)
FROM ungrouped_contestants
WHERE contestants.id = ungrouped_contestants.id;

-- Redistribute existing contestants more evenly across groups
WITH contestant_counts AS (
  SELECT cg.id as group_id, cg.group_name, cg.sort_order, COUNT(c.id) as count
  FROM contestant_groups cg
  LEFT JOIN contestants c ON cg.id = c.group_id AND c.pool_id IS NULL
  WHERE cg.pool_id IS NULL AND cg.group_name != 'Free Pick'
  GROUP BY cg.id, cg.group_name, cg.sort_order
  ORDER BY cg.sort_order
),
all_contestants AS (
  SELECT c.id, c.name, ROW_NUMBER() OVER (ORDER BY c.name) as row_num
  FROM contestants c
  WHERE c.pool_id IS NULL AND c.group_id IS NOT NULL
),
target_groups AS (
  SELECT id, group_name, ROW_NUMBER() OVER (ORDER BY sort_order) as group_num
  FROM contestant_groups 
  WHERE pool_id IS NULL AND group_name != 'Free Pick'
)
UPDATE contestants 
SET group_id = (
  SELECT tg.id 
  FROM target_groups tg 
  WHERE tg.group_num = ((all_contestants.row_num - 1) % 4) + 1
)
FROM all_contestants
WHERE contestants.id = all_contestants.id;