-- Add AI Arena/Special Competition scoring rule
INSERT INTO public.detailed_scoring_rules (category, subcategory, points, description, is_active)
VALUES ('special_events', 'ai_arena_winner', 2, 'Won AI Arena/Special Competition and was saved from nomination', true)
ON CONFLICT (category, subcategory) DO UPDATE SET
  points = EXCLUDED.points,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Add columns to weekly_results for AI Arena functionality
ALTER TABLE public.weekly_results 
ADD COLUMN IF NOT EXISTS has_ai_arena boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_arena_winner text DEFAULT NULL;

-- Add trigger to update weekly_results timestamps
CREATE TRIGGER update_weekly_results_updated_at
  BEFORE UPDATE ON public.weekly_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();