-- Add constraint to ensure only one draft week per pool can exist at a time
-- First, create a unique partial index to enforce this constraint
CREATE UNIQUE INDEX idx_unique_draft_per_pool 
ON public.weekly_results (pool_id) 
WHERE is_draft = true;

-- Add function to clear other draft weeks when setting a new one
CREATE OR REPLACE FUNCTION clear_other_draft_weeks()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is being set as a draft, clear all other drafts for this pool
  IF NEW.is_draft = true THEN
    UPDATE public.weekly_results 
    SET is_draft = false 
    WHERE pool_id = NEW.pool_id 
      AND id != NEW.id 
      AND is_draft = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one draft per pool
CREATE TRIGGER ensure_single_draft_per_pool
  BEFORE INSERT OR UPDATE ON public.weekly_results
  FOR EACH ROW
  EXECUTE FUNCTION clear_other_draft_weeks();