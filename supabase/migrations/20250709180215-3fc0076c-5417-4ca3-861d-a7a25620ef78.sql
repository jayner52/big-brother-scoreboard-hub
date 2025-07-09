-- COMPLETE REMOVAL OF ALL EVICTION STATUS LOGIC
-- Step 1: Remove all eviction-related database functions and triggers

-- Drop all eviction status triggers
DROP TRIGGER IF EXISTS trigger_special_event_status_changes ON public.weekly_events;
DROP TRIGGER IF EXISTS maintain_contestant_status_weekly_events ON public.weekly_events;
DROP TRIGGER IF EXISTS maintain_contestant_status_weekly_results ON public.weekly_results;
DROP TRIGGER IF EXISTS maintain_contestant_status_special_events ON public.special_events;

-- Drop all eviction status functions
DROP FUNCTION IF EXISTS public.handle_special_event_status_changes();
DROP FUNCTION IF EXISTS public.maintain_contestant_status();

-- Comment: All eviction status will now be determined only by application logic
-- The is_active field will remain but will not be automatically updated by triggers
-- This creates a clean slate for implementing new eviction logic from scratch