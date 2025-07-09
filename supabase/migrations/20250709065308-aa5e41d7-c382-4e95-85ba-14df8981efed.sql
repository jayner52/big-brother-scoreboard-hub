-- Add missing 'pov_used_on' scoring rule for Power of Veto saves
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES (
  'weekly',
  'pov_used_on',
  1,
  'Power of Veto used to save this player',
  true
)
ON CONFLICT (category, subcategory) DO UPDATE SET
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;