-- Fix Week-Aware Eviction Logic
-- Step 1: Add missing Isaiah removal by production event to weekly_events

-- First, let's add Isaiah's removal by production event for Week 1
INSERT INTO weekly_events (
  contestant_id, 
  week_number, 
  event_type, 
  pool_id, 
  points_awarded
) VALUES (
  'e6b5df54-c531-445d-8325-e8c45206ebb8', -- Isaiah's ID in the main pool
  1, 
  '87548b45-7353-4a34-bcc1-14016b38577d', -- removed_production event type ID
  '1164288f-70b3-43c5-b19d-b57e115b8710', -- main pool ID
  0 -- No points for removal
);

-- Step 2: Update Isaiah's contestant status to inactive since he was removed in Week 1
UPDATE contestants 
SET is_active = false 
WHERE id = 'e6b5df54-c531-445d-8325-e8c45206ebb8' 
  AND pool_id = '1164288f-70b3-43c5-b19d-b57e115b8710';

-- Step 3: Create a function to get contestants who were evicted in a specific week
CREATE OR REPLACE FUNCTION get_contestants_evicted_in_week(target_pool_id uuid, target_week_number integer)
RETURNS TABLE(
  contestant_id uuid,
  contestant_name text,
  eviction_type text,
  eviction_source text
) AS $$
BEGIN
  RETURN QUERY
  -- Get evictions from weekly_results
  SELECT 
    c.id as contestant_id,
    c.name as contestant_name,
    'normal_eviction'::text as eviction_type,
    'weekly_results'::text as eviction_source
  FROM contestants c
  JOIN weekly_results wr ON wr.pool_id = c.pool_id
  WHERE c.pool_id = target_pool_id
    AND wr.week_number = target_week_number
    AND (
      c.name = wr.evicted_contestant OR 
      c.name = wr.second_evicted_contestant OR 
      c.name = wr.third_evicted_contestant
    )
  
  UNION ALL
  
  -- Get evictions from weekly_events (special events)
  SELECT 
    we.contestant_id,
    c.name as contestant_name,
    dsr.subcategory as eviction_type,
    'weekly_events'::text as eviction_source
  FROM weekly_events we
  JOIN contestants c ON we.contestant_id = c.id
  JOIN detailed_scoring_rules dsr ON dsr.id = we.event_type::uuid
  WHERE we.pool_id = target_pool_id
    AND we.week_number = target_week_number
    AND dsr.subcategory IN ('evicted', 'self_evicted', 'removed_production');
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a function to get contestants who are active for a specific week
CREATE OR REPLACE FUNCTION get_contestants_active_in_week(target_pool_id uuid, target_week_number integer)
RETURNS TABLE(
  contestant_id uuid,
  contestant_name text,
  is_active_this_week boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH evicted_by_week AS (
    -- Get all evictions up to the target week
    SELECT DISTINCT 
      c.id as contestant_id,
      MIN(wr.week_number) as eviction_week
    FROM contestants c
    JOIN weekly_results wr ON wr.pool_id = c.pool_id
    WHERE c.pool_id = target_pool_id
      AND wr.week_number <= target_week_number
      AND (
        c.name = wr.evicted_contestant OR 
        c.name = wr.second_evicted_contestant OR 
        c.name = wr.third_evicted_contestant
      )
    GROUP BY c.id
    
    UNION ALL
    
    -- Get special event evictions up to the target week
    SELECT DISTINCT 
      we.contestant_id,
      MIN(we.week_number) as eviction_week
    FROM weekly_events we
    JOIN detailed_scoring_rules dsr ON dsr.id = we.event_type::uuid
    WHERE we.pool_id = target_pool_id
      AND we.week_number <= target_week_number
      AND dsr.subcategory IN ('evicted', 'self_evicted', 'removed_production')
    GROUP BY we.contestant_id
  )
  SELECT 
    c.id as contestant_id,
    c.name as contestant_name,
    (eb.contestant_id IS NULL) as is_active_this_week
  FROM contestants c
  LEFT JOIN evicted_by_week eb ON c.id = eb.contestant_id
  WHERE c.pool_id = target_pool_id
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;