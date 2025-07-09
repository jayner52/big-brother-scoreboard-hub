-- Add missing 'evicted' scoring rule that the code expects
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
SELECT 'weekly_events', 'evicted', 0, 'Evicted from House', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.detailed_scoring_rules 
  WHERE category = 'weekly_events' AND subcategory = 'evicted'
);

-- Ensure all required scoring rules exist for weekly events submission
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
SELECT * FROM (VALUES
  ('weekly_events', 'hoh_winner', 10, 'Head of Household Winner', true),
  ('weekly_events', 'pov_winner', 8, 'Power of Veto Winner', true), 
  ('weekly_events', 'nominee', 2, 'Nominated for Eviction', true),
  ('weekly_events', 'replacement_nominee', 2, 'Replacement Nominee', true),
  ('weekly_events', 'survival', 3, 'Survived the Week', true),
  ('weekly_events', 'pov_used_on', 5, 'Power of Veto Used On', true),
  ('weekly_events', 'bb_arena_winner', 5, 'BB Arena Winner', true),
  ('weekly_events', 'jury_member', 5, 'Jury Member', true)
) AS new_rules(category, subcategory, points, description, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.detailed_scoring_rules dsr 
  WHERE dsr.category = new_rules.category AND dsr.subcategory = new_rules.subcategory
);