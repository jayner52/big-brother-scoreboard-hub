-- Create trigger to handle special event status changes on weekly_events table
CREATE TRIGGER trigger_special_event_status_changes
  AFTER INSERT ON public.weekly_events
  FOR EACH ROW
  WHEN (NEW.event_type IN ('self_evicted', 'removed_production', 'came_back_evicted'))
  EXECUTE FUNCTION public.handle_special_event_status_changes();