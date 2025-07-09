-- Fix get_contestants_evicted_up_to_week special_events query bug
CREATE OR REPLACE FUNCTION public.get_contestants_evicted_up_to_week(target_pool_id uuid, target_week_number integer)
 RETURNS TABLE(contestant_id uuid, contestant_name text, eviction_type text, eviction_source text, eviction_week integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  -- Get evictions from weekly_results (normal evictions) up to target week
  SELECT 
    c.id as contestant_id,
    c.name as contestant_name,
    'normal_eviction'::text as eviction_type,
    'weekly_results'::text as eviction_source,
    wr.week_number as eviction_week
  FROM contestants c
  JOIN weekly_results wr ON wr.pool_id = c.pool_id
  WHERE c.pool_id = target_pool_id
    AND wr.week_number <= target_week_number
    AND (
      c.name = wr.evicted_contestant OR 
      c.name = wr.second_evicted_contestant OR 
      c.name = wr.third_evicted_contestant
    )
  
  UNION ALL
  
  -- Get evictions from weekly_events (special events) up to target week
  SELECT 
    we.contestant_id,
    c.name as contestant_name,
    dsr.subcategory as eviction_type,
    'weekly_events'::text as eviction_source,
    we.week_number as eviction_week
  FROM weekly_events we
  JOIN contestants c ON we.contestant_id = c.id
  JOIN detailed_scoring_rules dsr ON dsr.id = we.event_type::uuid
  WHERE we.pool_id = target_pool_id
    AND we.week_number <= target_week_number
    AND dsr.subcategory IN ('evicted', 'self_evicted', 'removed_production')
  
  UNION ALL
  
  -- Get evictions from special_events table up to target week - FIXED TO JOIN WITH SCORING RULES
  SELECT 
    se.contestant_id,
    c.name as contestant_name,
    dsr.subcategory as eviction_type,
    'special_events'::text as eviction_source,
    se.week_number as eviction_week
  FROM special_events se
  JOIN contestants c ON se.contestant_id = c.id
  JOIN detailed_scoring_rules dsr ON dsr.id = se.event_type::uuid
  WHERE se.pool_id = target_pool_id
    AND se.week_number <= target_week_number
    AND dsr.subcategory IN ('self_evicted', 'removed_production')
  
  ORDER BY eviction_week ASC, contestant_name ASC;
END;
$function$