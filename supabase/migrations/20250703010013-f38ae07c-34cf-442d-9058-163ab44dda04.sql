-- Add points for POV used on someone
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES (
  'weekly',
  'pov_used_on',
  1,
  'Power of Veto used to save this player',
  true
)
ON CONFLICT DO NOTHING;