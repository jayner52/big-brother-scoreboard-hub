-- Enhanced trigger to handle special event status changes and automatic survival points
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
  
  -- Handle came back after evicted - reactivate status and award survival points
  IF NEW.event_type = 'came_back_evicted' THEN
    -- Reactivate the contestant
    UPDATE public.contestants 
    SET is_active = true 
    WHERE id = NEW.contestant_id AND pool_id = NEW.pool_id;
    
    -- Award survival points for this week if not already awarded
    INSERT INTO public.weekly_events (
      contestant_id,
      pool_id,
      week_number,
      event_type,
      points_awarded
    )
    SELECT 
      NEW.contestant_id,
      NEW.pool_id,
      NEW.week_number,
      'survival',
      COALESCE((
        SELECT points 
        FROM detailed_scoring_rules 
        WHERE category = 'weekly_events' 
          AND subcategory = 'survival' 
          AND is_active = true 
        LIMIT 1
      ), 1)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.weekly_events 
      WHERE contestant_id = NEW.contestant_id 
        AND week_number = NEW.week_number
        AND pool_id = NEW.pool_id
        AND event_type = 'survival'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;