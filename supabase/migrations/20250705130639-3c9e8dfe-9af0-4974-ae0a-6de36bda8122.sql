-- CRITICAL FIX: Assign groups to contestants with null group_id
-- This ensures all contestants are properly assigned to groups for the draft form

DO $$
DECLARE
  pool_record RECORD;
  contestant_record RECORD;
  group_record RECORD;
  groups_cursor CURSOR FOR SELECT id, group_name FROM public.contestant_groups ORDER BY sort_order;
  group_count INTEGER;
  assignment_index INTEGER := 0;
  current_pool_id UUID;
BEGIN
  -- Process each pool
  FOR pool_record IN SELECT id FROM public.pools LOOP
    RAISE NOTICE '🔧 Processing pool: %', pool_record.id;
    current_pool_id := pool_record.id;
    
    -- Count groups for this pool
    SELECT COUNT(*) INTO group_count 
    FROM public.contestant_groups 
    WHERE pool_id = current_pool_id;
    
    IF group_count = 0 THEN
      RAISE NOTICE '⚠️  No groups found for pool %, skipping', current_pool_id;
      CONTINUE;
    END IF;
    
    RAISE NOTICE '📋 Found % groups for pool %', group_count, current_pool_id;
    assignment_index := 0;
    
    -- Update contestants with null group_id in this pool
    FOR contestant_record IN 
      SELECT id, name FROM public.contestants 
      WHERE pool_id = current_pool_id AND group_id IS NULL
      ORDER BY sort_order, name
    LOOP
      -- Get the group to assign (round-robin)
      SELECT id, group_name INTO group_record
      FROM public.contestant_groups 
      WHERE pool_id = current_pool_id
      ORDER BY sort_order
      OFFSET (assignment_index % group_count) LIMIT 1;
      
      -- Assign contestant to group
      UPDATE public.contestants 
      SET group_id = group_record.id
      WHERE id = contestant_record.id;
      
      RAISE NOTICE '✅ Assigned % to group %', 
        contestant_record.name, 
        group_record.group_name;
      
      assignment_index := assignment_index + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '🎯 Completed group assignment for all pools';
END $$;