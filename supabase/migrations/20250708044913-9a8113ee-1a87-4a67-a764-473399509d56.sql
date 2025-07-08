-- Update existing scoring rules to match special events configuration
UPDATE public.detailed_scoring_rules 
SET 
  points = 2,
  description = 'Won Special Power/Advantage'
WHERE category = 'special_events' AND subcategory = 'won_secret_power';

-- Add trigger to automatically change contestant status for special events
CREATE OR REPLACE FUNCTION public.handle_special_event_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle self-evicted or removed by production - change status to inactive
  IF NEW.event_type IN ('self_evicted', 'removed_production') THEN
    UPDATE public.contestants 
    SET is_active = false 
    WHERE id = NEW.contestant_id AND pool_id = (
      SELECT pool_id FROM public.special_events WHERE id = NEW.id LIMIT 1
    );
    
    -- Remove survival points for this week if they were already awarded
    DELETE FROM public.weekly_events 
    WHERE contestant_id = NEW.contestant_id 
      AND week_number = NEW.week_number
      AND event_type = 'survival';
  END IF;
  
  -- Handle came back after evicted - reactivate status
  IF NEW.event_type = 'came_back_evicted' THEN
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = NEW.contestant_id AND pool_id = (
      SELECT pool_id FROM public.special_events WHERE id = NEW.id LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS special_event_status_trigger ON public.special_events;
CREATE TRIGGER special_event_status_trigger
  AFTER INSERT OR UPDATE ON public.special_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_special_event_status_changes();