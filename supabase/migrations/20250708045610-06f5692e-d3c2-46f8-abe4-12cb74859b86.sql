-- Fix the special event status trigger to properly handle pool_id lookup
CREATE OR REPLACE FUNCTION public.handle_special_event_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle self-evicted or removed by production - change status to inactive
  IF NEW.event_type IN ('self_evicted', 'removed_production') THEN
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    -- Remove survival points for this week if they were already awarded
    DELETE FROM public.weekly_events 
    WHERE contestant_id = NEW.contestant_id 
      AND week_number = NEW.week_number
      AND pool_id = NEW.pool_id
      AND event_type = 'survival';
  END IF;
  
  -- Handle came back after evicted - reactivate status
  IF NEW.event_type = 'came_back_evicted' THEN
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;