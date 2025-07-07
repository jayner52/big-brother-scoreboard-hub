-- Add allow_new_participants field to pools table
ALTER TABLE public.pools 
ADD COLUMN allow_new_participants boolean NOT NULL DEFAULT true;

-- Add comment to document the field
COMMENT ON COLUMN public.pools.allow_new_participants IS 'Controls whether new participants can join the pool and submit draft entries';