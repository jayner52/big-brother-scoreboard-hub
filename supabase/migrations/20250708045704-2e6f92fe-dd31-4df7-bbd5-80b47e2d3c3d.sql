-- Add missing won_safety_comp entry
INSERT INTO public.detailed_scoring_rules (category, subcategory, description, points, is_active)
VALUES ('special_events', 'won_safety_comp', 'Won Safety Competition', 1, true);

-- Fix description inconsistencies to match exact configuration
UPDATE public.detailed_scoring_rules 
SET description = 'In a Showmance'
WHERE category = 'special_events' AND subcategory = 'in_showmance';