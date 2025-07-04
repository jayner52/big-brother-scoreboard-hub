-- Add column to store special events in draft mode
ALTER TABLE public.weekly_results 
ADD COLUMN draft_special_events TEXT;