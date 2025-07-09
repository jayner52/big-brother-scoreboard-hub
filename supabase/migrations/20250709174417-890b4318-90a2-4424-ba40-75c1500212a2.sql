-- Add unique constraint to prevent duplicate special events
-- This prevents duplicate special events for the same contestant, event type, and week within a pool
ALTER TABLE public.special_events 
ADD CONSTRAINT unique_special_events_per_contestant_week_pool 
UNIQUE (contestant_id, event_type, week_number, pool_id);