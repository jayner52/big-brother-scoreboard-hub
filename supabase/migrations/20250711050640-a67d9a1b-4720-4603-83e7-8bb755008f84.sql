-- Add pool_id column to detailed_scoring_rules table
ALTER TABLE public.detailed_scoring_rules 
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Create index for better performance on pool_id queries
CREATE INDEX idx_detailed_scoring_rules_pool_id ON public.detailed_scoring_rules(pool_id);

-- Create function to seed pool-specific scoring rules
CREATE OR REPLACE FUNCTION public.seed_pool_scoring_rules(target_pool_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  source_count INTEGER;
  inserted_count INTEGER;
BEGIN
  RAISE NOTICE 'SEED_SCORING_RULES: Starting for pool_id: %', target_pool_id;
  
  -- Check how many default scoring rules exist (pool_id = null)
  SELECT COUNT(*) INTO source_count 
  FROM public.detailed_scoring_rules 
  WHERE pool_id IS NULL AND is_active = true;
  
  RAISE NOTICE 'SEED_SCORING_RULES: Found % default scoring rules to copy', source_count;
  
  IF source_count = 0 THEN
    RAISE NOTICE 'SEED_SCORING_RULES: ERROR - No default scoring rules found to copy!';
    RETURN;
  END IF;
  
  -- Copy all existing scoring rules (with pool_id = null) to the new pool
  INSERT INTO public.detailed_scoring_rules (
    pool_id,
    category,
    subcategory,
    description,
    emoji,
    points,
    is_active,
    config_params
  )
  SELECT 
    target_pool_id,
    category,
    subcategory,
    description,
    emoji,
    points,
    is_active,
    config_params
  FROM public.detailed_scoring_rules 
  WHERE pool_id IS NULL
  AND is_active = true;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'SEED_SCORING_RULES: Successfully inserted % scoring rules for pool %', inserted_count, target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_SCORING_RULES: ERROR - %', SQLERRM;
    RAISE;
END;
$$;

-- Update the seed_new_pool_defaults function to include scoring rules
CREATE OR REPLACE FUNCTION public.seed_new_pool_defaults(target_pool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== STARTING POOL SEEDING FOR % =====', target_pool_id;
  
  -- Validate target pool exists
  IF NOT EXISTS (SELECT 1 FROM public.pools WHERE id = target_pool_id) THEN
    RAISE EXCEPTION 'SEED_NEW_POOL_DEFAULTS: ERROR - Pool % does not exist!', target_pool_id;
  END IF;
  
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ✓ Target pool exists';
  
  -- Seed contestant groups first
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 1 - Seeding contestant groups...';
  PERFORM seed_pool_contestant_groups(target_pool_id);
  
  -- Seed BB27 contestants
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 2 - Seeding BB27 contestants...';
  PERFORM seed_pool_bb27_contestants(target_pool_id);
  
  -- Seed bonus questions
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 3 - Seeding bonus questions...';
  PERFORM seed_pool_bonus_questions(target_pool_id);
  
  -- NEW: Seed scoring rules
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 4 - Seeding scoring rules...';
  PERFORM seed_pool_scoring_rules(target_pool_id);
  
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== COMPLETED POOL SEEDING FOR % =====', target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== FATAL ERROR - % =====', SQLERRM;
    RAISE;
END;
$$;

-- Create function to migrate existing pools to have their own scoring rules
CREATE OR REPLACE FUNCTION public.migrate_existing_pools_scoring_rules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pool_record RECORD;
  total_pools INTEGER := 0;
  migrated_pools INTEGER := 0;
BEGIN
  RAISE NOTICE 'MIGRATE_SCORING_RULES: Starting migration for existing pools...';
  
  -- Get all existing pools that don't have pool-specific scoring rules yet
  FOR pool_record IN
    SELECT DISTINCT p.id, p.name
    FROM public.pools p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.detailed_scoring_rules dsr 
      WHERE dsr.pool_id = p.id
    )
  LOOP
    total_pools := total_pools + 1;
    
    RAISE NOTICE 'MIGRATE_SCORING_RULES: Processing pool "%" (%)', pool_record.name, pool_record.id;
    
    -- Seed scoring rules for this pool
    PERFORM seed_pool_scoring_rules(pool_record.id);
    
    migrated_pools := migrated_pools + 1;
  END LOOP;
  
  RAISE NOTICE 'MIGRATE_SCORING_RULES: Migration complete. Processed %/% pools', migrated_pools, total_pools;
END;
$$;

-- Update RLS policies for detailed_scoring_rules to include pool_id filtering
DROP POLICY IF EXISTS "Everyone can view scoring rules" ON public.detailed_scoring_rules;
DROP POLICY IF EXISTS "Pool admins can manage scoring rules" ON public.detailed_scoring_rules;

-- New RLS policies that are pool-aware
CREATE POLICY "Users can view scoring rules in their pools or global rules"
ON public.detailed_scoring_rules
FOR SELECT
USING (
  pool_id IS NULL OR -- Global rules (for defaults)
  pool_id IN (
    SELECT pool_memberships.pool_id
    FROM pool_memberships
    WHERE pool_memberships.user_id = auth.uid() 
    AND pool_memberships.active = true
  )
);

CREATE POLICY "Pool admins can manage their pool's scoring rules"
ON public.detailed_scoring_rules
FOR ALL
USING (
  pool_id IS NULL OR -- Global rules (admin only)
  get_user_pool_admin_status(pool_id)
)
WITH CHECK (
  pool_id IS NULL OR -- Global rules (admin only)
  get_user_pool_admin_status(pool_id)
);