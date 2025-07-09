
-- CRITICAL: Delete ALL fake Season 27 contestants and replace with real cast from Parade
-- This removes both global defaults and pool-specific copies (34 total records)
DELETE FROM public.contestants WHERE season_number = 27;

-- Also clear any related data that might reference these fake contestants
DELETE FROM public.weekly_events WHERE contestant_id IN (
  SELECT id FROM public.contestants WHERE season_number = 27
);

DELETE FROM public.special_events WHERE contestant_id IN (
  SELECT id FROM public.contestants WHERE season_number = 27
);

-- Note: After this migration, the scrape-bb27-cast function will be updated 
-- to fetch REAL contestant data from the Parade article instead of fake hardcoded data
