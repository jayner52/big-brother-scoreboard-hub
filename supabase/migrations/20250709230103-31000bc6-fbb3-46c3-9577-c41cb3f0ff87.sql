-- Fix special events eviction status synchronization

-- Step 1: Recreate the trigger function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_special_events_status_changes()
RETURNS TRIGGER AS $$
DECLARE
  event_subcategory TEXT;
  contestant_name TEXT;
BEGIN
  -- Get the subcategory from the scoring rule using UUID
  SELECT subcategory INTO event_subcategory
  FROM public.detailed_scoring_rules 
  WHERE id = NEW.event_type::uuid AND category = 'special_events';
  
  -- Get contestant name for logging
  SELECT name INTO contestant_name
  FROM public.contestants 
  WHERE id = NEW.contestant_id;
  
  -- Handle self-evicted or removed by production - change status to inactive
  IF event_subcategory IN ('self_evicted', 'removed_production') THEN
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    IF FOUND THEN
      RAISE NOTICE 'Special event eviction: Marked contestant % (%) as inactive due to %', 
        contestant_name, NEW.contestant_id, event_subcategory;
    ELSE
      RAISE WARNING 'Failed to mark contestant % (%) as inactive for %', 
        contestant_name, NEW.contestant_id, event_subcategory;
    END IF;
  END IF;
  
  -- Handle came back after evicted - reactivate status
  IF event_subcategory = 'came_back_evicted' THEN
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    IF FOUND THEN
      RAISE NOTICE 'Special event revival: Marked contestant % (%) as active', 
        contestant_name, NEW.contestant_id;
    ELSE
      RAISE WARNING 'Failed to reactivate contestant % (%) for revival', 
        contestant_name, NEW.contestant_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS trigger_special_events_status_changes ON public.special_events;
CREATE TRIGGER trigger_special_events_status_changes
  AFTER INSERT OR UPDATE ON public.special_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_special_events_status_changes();

-- Step 3: Data correction - find and fix contestants who should be inactive due to special events
DO $$
DECLARE
  fix_record RECORD;
  affected_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting data correction for special event evictions...';
  
  -- Find contestants who have special event evictions but are still marked as active
  FOR fix_record IN
    SELECT DISTINCT 
      se.contestant_id, 
      se.pool_id,
      c.name as contestant_name,
      dsr.subcategory as event_type,
      se.week_number
    FROM public.special_events se
    JOIN public.contestants c ON c.id = se.contestant_id
    JOIN public.detailed_scoring_rules dsr ON dsr.id = se.event_type::uuid
    WHERE dsr.category = 'special_events' 
    AND dsr.subcategory IN ('self_evicted', 'removed_production')
    AND c.is_active = true -- Still marked as active but shouldn't be
  LOOP
    -- Mark as inactive
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = fix_record.contestant_id 
    AND pool_id = fix_record.pool_id;
    
    affected_count := affected_count + 1;
    RAISE NOTICE 'Data fix: Marked % as inactive (% in week %)', 
      fix_record.contestant_name, fix_record.event_type, fix_record.week_number;
  END LOOP;
  
  -- Also check weekly_events table for special evictions
  FOR fix_record IN
    SELECT DISTINCT 
      we.contestant_id, 
      we.pool_id,
      c.name as contestant_name,
      dsr.subcategory as event_type,
      we.week_number
    FROM public.weekly_events we
    JOIN public.contestants c ON c.id = we.contestant_id
    JOIN public.detailed_scoring_rules dsr ON dsr.id = we.event_type::uuid
    WHERE dsr.category = 'special_events' 
    AND dsr.subcategory IN ('self_evicted', 'removed_production')
    AND c.is_active = true -- Still marked as active but shouldn't be
  LOOP
    -- Mark as inactive
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = fix_record.contestant_id 
    AND pool_id = fix_record.pool_id;
    
    affected_count := affected_count + 1;
    RAISE NOTICE 'Data fix: Marked % as inactive (% in week %)', 
      fix_record.contestant_name, fix_record.event_type, fix_record.week_number;
  END LOOP;
  
  RAISE NOTICE 'Data correction complete. Fixed % contestants.', affected_count;
END $$;

-- Step 4: Verify the fixes worked by showing current status
DO $$
DECLARE
  summary_record RECORD;
BEGIN
  RAISE NOTICE 'Summary of special event evictions and current status:';
  
  FOR summary_record IN
    SELECT 
      c.name as contestant_name,
      c.is_active,
      dsr.subcategory as event_type,
      COALESCE(se.week_number, we.week_number) as week_number,
      CASE WHEN se.id IS NOT NULL THEN 'special_events' ELSE 'weekly_events' END as source_table
    FROM public.contestants c
    LEFT JOIN public.special_events se ON se.contestant_id = c.id
    LEFT JOIN public.weekly_events we ON we.contestant_id = c.id
    LEFT JOIN public.detailed_scoring_rules dsr ON dsr.id = COALESCE(se.event_type::uuid, we.event_type::uuid)
    WHERE dsr.category = 'special_events' 
    AND dsr.subcategory IN ('self_evicted', 'removed_production', 'came_back_evicted')
    ORDER BY COALESCE(se.week_number, we.week_number), c.name
  LOOP
    RAISE NOTICE 'Contestant: %, Active: %, Event: %, Week: %, Source: %',
      summary_record.contestant_name,
      summary_record.is_active,
      summary_record.event_type,
      summary_record.week_number,
      summary_record.source_table;
  END LOOP;
END $$;