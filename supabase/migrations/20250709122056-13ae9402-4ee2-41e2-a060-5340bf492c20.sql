-- Update the special event status trigger to handle UUID event types
CREATE OR REPLACE FUNCTION public.handle_special_event_status_changes()
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
    
    -- Remove survival points for this week if they were already awarded
    DELETE FROM public.weekly_events 
    WHERE contestant_id = NEW.contestant_id 
      AND week_number = NEW.week_number
      AND pool_id = NEW.pool_id
      AND event_type IN (
        SELECT id::text FROM public.detailed_scoring_rules 
        WHERE category = 'weekly_events' AND subcategory = 'survival'
      );
  END IF;
  
  -- Handle came back after evicted - reactivate status and award survival points
  IF event_subcategory = 'came_back_evicted' THEN
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
      dsr.id::text,
      dsr.points
    FROM public.detailed_scoring_rules dsr
    WHERE dsr.category = 'weekly_events' 
      AND dsr.subcategory = 'survival' 
      AND dsr.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM public.weekly_events 
        WHERE contestant_id = NEW.contestant_id 
          AND week_number = NEW.week_number
          AND pool_id = NEW.pool_id
          AND event_type = dsr.id::text
      )
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;