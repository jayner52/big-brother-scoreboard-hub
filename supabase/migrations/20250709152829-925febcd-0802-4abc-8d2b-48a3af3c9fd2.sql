-- Fix the special event status trigger to work with UUID event types
DROP TRIGGER IF EXISTS trigger_special_event_status_changes ON public.weekly_events;

-- Recreate the trigger without the WHEN clause since the function handles UUID-based filtering
CREATE TRIGGER trigger_special_event_status_changes
  AFTER INSERT ON public.weekly_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_special_event_status_changes();