-- Update description for floater achievement to emphasize consecutive weeks requirement
UPDATE public.detailed_scoring_rules 
SET description = 'Floater Achievement (4+ Consecutive Weeks No Comp Wins)'
WHERE category = 'special_achievements' AND subcategory = 'floater_achievement';

-- Update description for 4+ week block survival to clarify consecutive requirement  
UPDATE public.detailed_scoring_rules 
SET description = '4+ Week Block Survival Bonus (Consecutive)'
WHERE category = 'special_achievements' AND subcategory = 'block_survival_4_weeks';