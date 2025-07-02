-- Add missing scoring rules to the detailed_scoring_rules table
INSERT INTO detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES 
  ('weekly', 'nominee', -1, 'Nominated for eviction', true),
  ('weekly', 'replacement_nominee', 1, 'Replacement nominee after POV', true),
  ('special_achievements', 'no_comp_4_weeks', 1, 'Surviving 4 weeks with no competition wins', true),
  ('special_achievements', 'survive_block_2_rounds', 3, 'Surviving 2 rounds on the block without being voted out', true),
  ('special_achievements', 'survive_block_4_rounds', 5, 'Surviving 4 rounds on the block without being voted out', true);