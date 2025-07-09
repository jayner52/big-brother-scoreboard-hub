-- Add missing 'pov_used_on' scoring rule for Power of Veto saves
-- First check if it already exists, if not insert it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.detailed_scoring_rules 
    WHERE category = 'weekly' AND subcategory = 'pov_used_on'
  ) THEN
    INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
    VALUES (
      'weekly',
      'pov_used_on',
      1,
      'Power of Veto used to save this player',
      true
    );
  END IF;
END $$;