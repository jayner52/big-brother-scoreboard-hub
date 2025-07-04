-- Fix Matt Hardeman's active status so he appears in dropdowns
UPDATE public.contestants 
SET is_active = true 
WHERE name = 'Matt Hardeman' AND season_number = 26;