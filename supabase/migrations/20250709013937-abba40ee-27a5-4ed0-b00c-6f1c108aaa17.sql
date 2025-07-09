-- Create function to populate Season 27 as global defaults
CREATE OR REPLACE FUNCTION public.populate_bb27_global_defaults()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RAISE NOTICE 'BB27_DEFAULTS: Starting BB27 global defaults population...';
  
  -- Check if BB27 defaults already exist
  IF EXISTS (
    SELECT 1 FROM public.contestants 
    WHERE pool_id IS NULL 
    AND season_number = 27 
    LIMIT 1
  ) THEN
    RAISE NOTICE 'BB27_DEFAULTS: Season 27 defaults already exist, skipping...';
    RETURN;
  END IF;

  -- Create default groups if they don't exist
  INSERT INTO public.contestant_groups (pool_id, group_name, sort_order)
  SELECT NULL, group_name, sort_order
  FROM (VALUES 
    ('Group A', 1),
    ('Group B', 2), 
    ('Group C', 3),
    ('Group D', 4)
  ) AS default_groups(group_name, sort_order)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.contestant_groups 
    WHERE pool_id IS NULL AND group_name = default_groups.group_name
  );

  RAISE NOTICE 'BB27_DEFAULTS: Default groups ensured';
  
  -- Note: BB27 contestants will be populated via the scraping function
  -- This function just ensures the infrastructure is ready
  RAISE NOTICE 'BB27_DEFAULTS: Infrastructure ready for BB27 population';
END;
$function$;

-- Create function to seed BB27 contestants for new pools
CREATE OR REPLACE FUNCTION public.seed_pool_bb27_contestants(target_pool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  source_count INTEGER;
  inserted_count INTEGER;
  group_mapping RECORD;
BEGIN
  RAISE NOTICE 'SEED_BB27: Starting BB27 contestant seeding for pool %', target_pool_id;
  
  -- Check if BB27 global defaults exist
  SELECT COUNT(*) INTO source_count 
  FROM public.contestants 
  WHERE pool_id IS NULL AND season_number = 27 AND is_active = true;
  
  RAISE NOTICE 'SEED_BB27: Found % BB27 default contestants', source_count;
  
  IF source_count = 0 THEN
    RAISE NOTICE 'SEED_BB27: No BB27 defaults found, will populate via scraping';
    RETURN;
  END IF;
  
  -- Create group mapping between global and pool groups
  FOR group_mapping IN
    SELECT 
      old_g.id as old_group_id,
      new_g.id as new_group_id,
      old_g.group_name as group_name
    FROM public.contestant_groups old_g
    JOIN public.contestant_groups new_g ON old_g.group_name = new_g.group_name
    WHERE old_g.pool_id IS NULL 
    AND new_g.pool_id = target_pool_id
  LOOP
    -- Copy BB27 contestants from global defaults to pool
    INSERT INTO public.contestants (
      pool_id, group_id, name, age, hometown, occupation, bio, photo_url,
      relationship_status, family_info, personality_traits, gameplay_strategy,
      backstory, sort_order, is_active, season_number, ai_generated, data_source
    )
    SELECT 
      target_pool_id, group_mapping.new_group_id, name, age, hometown, 
      occupation, bio, photo_url, relationship_status, family_info,
      personality_traits, gameplay_strategy, backstory, sort_order,
      is_active, season_number, ai_generated, 'bb27_preset'
    FROM public.contestants 
    WHERE group_id = group_mapping.old_group_id
    AND pool_id IS NULL
    AND season_number = 27
    AND is_active = true;
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'SEED_BB27: Inserted % contestants for group %', inserted_count, group_mapping.group_name;
  END LOOP;
  
  RAISE NOTICE 'SEED_BB27: Completed BB27 seeding for pool %', target_pool_id;
END;
$function$;

-- Update the main seeding function to use BB27 instead of BB26
CREATE OR REPLACE FUNCTION public.seed_new_pool_defaults(target_pool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
  
  -- Seed BB27 contestants (updated from BB26)
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 2 - Seeding BB27 contestants...';
  PERFORM seed_pool_bb27_contestants(target_pool_id);
  
  -- Finally seed bonus questions
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: Step 3 - Seeding bonus questions...';
  PERFORM seed_pool_bonus_questions(target_pool_id);
  
  RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== COMPLETED POOL SEEDING FOR % =====', target_pool_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SEED_NEW_POOL_DEFAULTS: ===== FATAL ERROR - % =====', SQLERRM;
    RAISE;
END;
$function$;