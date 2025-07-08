
-- Add background_color column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN background_color text;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.background_color IS 'CSS gradient classes for user avatar backgrounds';
