// Season 27 Houseguests - Fixed Cast Data from Official CBS Release
// This creates BB27 as global defaults and enables auto-population for all new pools

import { supabase } from '@/integrations/supabase/client';

export const populateSeason27GlobalDefaults = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  console.log('🏠 BB27: Starting global defaults population...');
  
  try {
    // First check if BB27 defaults already exist
    const { data: existingDefaults, error: checkError } = await supabase
      .from('contestants')
      .select('id')
      .is('pool_id', null)
      .eq('season_number', 27)
      .limit(1);
    
    if (checkError) {
      console.error('🏠 BB27: Error checking existing defaults:', checkError);
      throw checkError;
    }
    
    if (existingDefaults && existingDefaults.length > 0) {
      console.log('🏠 BB27: Global defaults already exist');
      return { success: true, count: 0, error: 'BB27 global defaults already exist' };
    }

    console.log('🏠 BB27: No existing defaults found, proceeding with population...');
    
    // BYPASS RPC - Create default groups directly in TypeScript
    console.log('🏠 BB27: Creating default groups directly...');
    const defaultGroups = [
      { group_name: 'Group A', sort_order: 1 },
      { group_name: 'Group B', sort_order: 2 },
      { group_name: 'Group C', sort_order: 3 },
      { group_name: 'Group D', sort_order: 4 }
    ];
    
    // Insert groups if they don't exist
    for (const group of defaultGroups) {
      const { error: insertError } = await supabase
        .from('contestant_groups')
        .upsert({
          pool_id: null,
          group_name: group.group_name,
          sort_order: group.sort_order
        }, {
          onConflict: 'pool_id,group_name',
          ignoreDuplicates: true
        });
        
      if (insertError) {
        console.error(`🏠 BB27: Error creating group ${group.group_name}:`, insertError);
        throw insertError;
      }
    }
    
    console.log('🏠 BB27: Default groups created successfully');
    
    // Now fetch the groups we just created
    const { data: groups, error: groupsError } = await supabase
      .from('contestant_groups')
      .select('id, group_name, sort_order')
      .is('pool_id', null)
      .order('sort_order', { ascending: true });
    
    if (groupsError) {
      console.error('🏠 BB27: Error fetching created groups:', groupsError);
      throw groupsError;
    }
    
    if (!groups || groups.length === 0) {
      throw new Error('No groups found after direct creation');
    }
    
    console.log('🏠 BB27: Using groups:', groups.map(g => g.group_name));
    
    // Call our scraping function to get BB27 contestants
    console.log('🏠 BB27: Calling scraping function...');
    const { data: scrapingResult, error: scrapingError } = await supabase.functions.invoke('scrape-bb27-cast');
    
    if (scrapingError) {
      console.error('🏠 BB27: Scraping function error:', scrapingError);
      throw scrapingError;
    }
    
    if (!scrapingResult || !scrapingResult.success) {
      console.error('🏠 BB27: Scraping failed:', scrapingResult);
      throw new Error(scrapingResult?.error || 'Failed to scrape BB27 cast');
    }
    
    const contestants = scrapingResult.contestants || [];
    console.log('🏠 BB27: Scraped', contestants.length, 'contestants');
    console.log('🏠 BB27: First contestant sample:', contestants[0]);
    
    if (contestants.length === 0) {
      throw new Error('No contestants found in scraping results');
    }
    
    // Convert scraped contestants to database format and distribute across groups
    const contestantsToInsert = contestants.map((contestant: any, index: number) => {
      const groupIndex = index % groups.length;
      const assignedGroup = groups[groupIndex];
      
      // Special handling for Mystery Houseguest - start as inactive
      const isActive = contestant.name !== 'Mystery Houseguest';
      
      const contestantData = {
        pool_id: null, // Global default
        group_id: assignedGroup.id,
        name: contestant.name,
        age: contestant.age || 0,
        hometown: contestant.location || 'Unknown',
        occupation: contestant.occupation || 'Unknown',
        bio: contestant.bio || `${contestant.name} is a contestant on Big Brother 27.`,
        photo_url: contestant.imageUrl || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop&crop=face',
        is_active: isActive,
        season_number: 27,
        sort_order: index + 1,
        ai_generated: false,
        data_source: 'bb27_fixed_cast'
      };
      
      console.log(`🏠 BB27: Preparing contestant ${index + 1}:`, {
        name: contestantData.name,
        group: assignedGroup.group_name,
        active: isActive
      });
      
      return contestantData;
    });
    
    console.log('🏠 BB27: Inserting', contestantsToInsert.length, 'global default contestants');
    console.log('🏠 BB27: Sample data for first contestant:', contestantsToInsert[0]);
    
    const { data: insertedContestants, error: insertError } = await supabase
      .from('contestants')
      .insert(contestantsToInsert)
      .select('id, name, season_number');
    
    if (insertError) {
      console.error('🏠 BB27: Insertion error details:', insertError);
      throw insertError;
    }
    
    console.log('🏠 BB27: Successfully created', insertedContestants?.length || 0, 'global defaults');
    console.log('🏠 BB27: Inserted contestants:', insertedContestants?.map(c => `${c.name} (S${c.season_number})`));
    
    return { 
      success: true, 
      count: insertedContestants?.length || 0 
    };
    
  } catch (error) {
    console.error('🏠 BB27: Critical error populating global defaults:', error);
    console.error('🏠 BB27: Error stack:', error.stack);
    return { 
      success: false, 
      count: 0, 
      error: error.message || 'Failed to populate BB27 global defaults' 
    };
  }
};

export const populateSeason27Houseguests = async (poolId: string): Promise<{ success: boolean; count: number; error?: string }> => {
  console.log('🏠 BB27: Populating Season 27 houseguests for pool:', poolId);
  
  try {
    // First ensure global defaults exist
    const globalResult = await populateSeason27GlobalDefaults();
    if (!globalResult.success && !globalResult.error?.includes('already exist')) {
      throw new Error(globalResult.error || 'Failed to ensure global defaults');
    }
    
    // Check if pool already has contestants
    const { data: existingContestants, error: checkError } = await supabase
      .from('contestants')
      .select('id')
      .eq('pool_id', poolId)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (existingContestants && existingContestants.length > 0) {
      console.log('🏠 BB27: Pool already has contestants');
      return { success: true, count: 0, error: 'Pool already has contestants' };
    }
    
    // Use database function to seed BB27 contestants for this pool
    await supabase.rpc('seed_pool_bb27_contestants', { target_pool_id: poolId });
    
    // Verify the seeding worked
    const { data: seededContestants, error: verifyError } = await supabase
      .from('contestants')
      .select('id, name')
      .eq('pool_id', poolId)
      .eq('season_number', 27);
    
    if (verifyError) throw verifyError;
    
    console.log('🏠 BB27: Successfully seeded', seededContestants?.length || 0, 'contestants for pool');
    
    return { 
      success: true, 
      count: seededContestants?.length || 0 
    };
    
  } catch (error) {
    console.error('🏠 BB27: Error populating pool contestants:', error);
    return { 
      success: false, 
      count: 0, 
      error: error.message || 'Failed to populate BB27 pool contestants' 
    };
  }
};