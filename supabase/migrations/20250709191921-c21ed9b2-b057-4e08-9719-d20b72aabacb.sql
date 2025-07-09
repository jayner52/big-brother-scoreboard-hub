
-- Create proper trigger function for special events eviction logic
CREATE OR REPLACE FUNCTION public.handle_special_events_status_changes()
RETURNS TRIGGER AS $$
DECLARE
  event_subcategory TEXT;
BEGIN
  -- Get the subcategory from the scoring rule using UUID
  SELECT subcategory INTO event_subcategory
  FROM public.detailed_scoring_rules 
  WHERE id = NEW.event_type::uuid AND category = 'special_events';
  
  -- Handle self-evicted or removed by production - change status to inactive
  IF event_subcategory IN ('self_evicted', 'removed_production') THEN
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    RAISE NOTICE 'Special event eviction: Marked contestant % as inactive due to %', NEW.contestant_id, event_subcategory;
  END IF;
  
  -- Handle came back after evicted - reactivate status
  IF event_subcategory = 'came_back_evicted' THEN
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    RAISE NOTICE 'Special event revival: Marked contestant % as active', NEW.contestant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_special_events_status_changes ON public.special_events;

-- Create trigger on special_events table (not weekly_events)
CREATE TRIGGER trigger_special_events_status_changes
  AFTER INSERT ON public.special_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_special_events_status_changes();

-- Data migration: Fix existing contestants who should be evicted based on special events
DO $$
DECLARE
  eviction_record RECORD;
  revival_record RECORD;
BEGIN
  -- First, mark contestants as inactive who have eviction special events
  FOR eviction_record IN
    SELECT DISTINCT se.contestant_id, se.pool_id
    FROM public.special_events se
    JOIN public.detailed_scoring_rules dsr ON dsr.id = se.event_type::uuid
    WHERE dsr.category = 'special_events' 
    AND dsr.subcategory IN ('self_evicted', 'removed_production')
  LOOP
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = eviction_record.contestant_id 
    AND pool_id = eviction_record.pool_id
    AND is_active = true;
    
    IF FOUND THEN
      RAISE NOTICE 'Data migration: Marked contestant % as inactive', eviction_record.contestant_id;
    END IF;
  END LOOP;
  
  -- Then, reactivate contestants who have revival special events
  FOR revival_record IN
    SELECT DISTINCT se.contestant_id, se.pool_id
    FROM public.special_events se
    JOIN public.detailed_scoring_rules dsr ON dsr.id = se.event_type::uuid
    WHERE dsr.category = 'special_events' 
    AND dsr.subcategory = 'came_back_evicted'
  LOOP
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = revival_record.contestant_id 
    AND pool_id = revival_record.pool_id
    AND is_active = false;
    
    IF FOUND THEN
      RAISE NOTICE 'Data migration: Marked contestant % as active (revival)', revival_record.contestant_id;
    END IF;
  END LOOP;
END $$;
