-- Fix contestants table constraints to allow pool-specific seeding and AI generation
-- Drop existing unique constraint on name (if it exists)
DO $$ 
BEGIN
    -- Drop unique constraint on name if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'contestants_name_key' 
        AND table_name = 'contestants'
    ) THEN
        ALTER TABLE public.contestants DROP CONSTRAINT contestants_name_key;
    END IF;
END $$;

-- Add compound unique constraint to allow same names across different pools
-- but prevent duplicates within the same pool
ALTER TABLE public.contestants 
ADD CONSTRAINT contestants_pool_name_unique 
UNIQUE (pool_id, name);