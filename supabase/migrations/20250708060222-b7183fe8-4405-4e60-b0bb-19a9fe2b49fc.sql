-- Fix emoji duplicates in detailed_scoring_rules table
-- Update descriptions to remove hardcoded emojis and fix subcategory mappings

-- Remove hardcoded emojis from descriptions
UPDATE public.detailed_scoring_rules 
SET description = 'Won Safety Competition'
WHERE description = '🔒 Won Safety Competition';

-- Fix weekly events subcategories and descriptions to match emoji mapping
UPDATE public.detailed_scoring_rules 
SET 
  subcategory = 'saved_by_veto',
  description = 'Saved by Power of Veto'
WHERE subcategory = 'pov_used_on';

-- Fix special achievements subcategories to match emoji mapping
UPDATE public.detailed_scoring_rules 
SET 
  subcategory = 'block_survival_2_weeks',
  description = '2+ Week Block Survival Bonus'
WHERE subcategory = 'survive_block_2_rounds';

UPDATE public.detailed_scoring_rules 
SET 
  subcategory = 'block_survival_4_weeks', 
  description = '4+ Week Block Survival Bonus'
WHERE subcategory = 'survive_block_4_rounds';

UPDATE public.detailed_scoring_rules 
SET 
  subcategory = 'floater_achievement',
  description = 'Floater Achievement (4+ Consecutive Weeks No Comp Wins)'
WHERE subcategory = 'no_comp_4_weeks';