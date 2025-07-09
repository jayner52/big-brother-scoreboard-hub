-- Clean database: Set all contestants to active
UPDATE public.contestants 
SET is_active = true 
WHERE is_active = false;

-- Verify the update
-- This should return 0 rows after the update
-- SELECT name, is_active FROM public.contestants WHERE is_active = false;