-- Remove duplicate "saved by veto" scoring rule
-- Keep the more specific "Power of Veto used to save this player" rule
DELETE FROM public.detailed_scoring_rules 
WHERE category = 'weekly' 
AND subcategory = 'saved_by_veto' 
AND description = 'Saved by Power of Veto';