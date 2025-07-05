import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ContestantProfile, ProcessingResult } from './types.ts';
import { retryWithBackoff, delay } from './utils.ts';

// Process contestants in batches
export async function processBatches(
  contestants: ContestantProfile[],
  seasonNumber: number,
  supabaseUrl: string,
  supabaseKey: string,
  poolId: string | null = null
): Promise<ProcessingResult> {
  const BATCH_SIZE = 10;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  if (!poolId) {
    throw new Error('Pool ID is required for contestant generation');
  }

  // **CRITICAL FIX 1: Check for existing contestants to prevent duplicates**
  console.log(`🔍 Checking for existing contestants in pool ${poolId}...`);
  const { data: existingContestants } = await supabase
    .from('contestants')
    .select('name')
    .eq('pool_id', poolId);
  
  const existingNames = new Set(existingContestants?.map(c => c.name.toLowerCase()) || []);
  console.log(`📋 Found ${existingNames.size} existing contestants:`, Array.from(existingNames));

  // Filter out duplicates
  const newContestants = contestants.filter(contestant => {
    const isDuplicate = existingNames.has(contestant.name.toLowerCase());
    if (isDuplicate) {
      console.log(`⚠️ Skipping duplicate: ${contestant.name}`);
    }
    return !isDuplicate;
  });

  if (newContestants.length === 0) {
    console.log('✅ No new contestants to add (all would be duplicates)');
    return { successful: 0, failed: [] };
  }

  console.log(`📦 Adding ${newContestants.length} new contestants (${contestants.length - newContestants.length} duplicates skipped)`);

  // **CRITICAL FIX 2: Read actual groups from pool instead of hardcoding**
  const { data: poolGroups } = await supabase
    .from('contestant_groups')
    .select('id, group_name, sort_order')
    .eq('pool_id', poolId)
    .order('sort_order');

  if (!poolGroups || poolGroups.length === 0) {
    throw new Error(`No contestant groups found for pool ${poolId}`);
  }

  console.log(`🏷️ Found ${poolGroups.length} groups for pool:`, poolGroups.map(g => g.group_name));

  const batches = [];
  for (let i = 0; i < newContestants.length; i += BATCH_SIZE) {
    batches.push(newContestants.slice(i, i + BATCH_SIZE));
  }
  
  let totalSuccessful = 0;
  const allFailures: Array<{ name: string; error: string }> = [];
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchNumber = batchIndex + 1;
    
    console.log(`\n📋 Processing batch ${batchNumber}/${batches.length} (${batch.length} contestants)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (contestant, index) => {
        const globalIndex = batchIndex * BATCH_SIZE + index + 1;
        
        return await retryWithBackoff(async () => {
          // **CRITICAL FIX 3: Equal distribution across actual groups**
          const groupIndex = (globalIndex - 1) % poolGroups.length;
          const assignedGroup = poolGroups[groupIndex];
          
          console.log(`  [${globalIndex}/${newContestants.length}] Processing: ${contestant.name}`);
          console.log(`🔥 INSERTING CONTESTANT:`, {
            name: contestant.name,
            target_group: assignedGroup.group_name,
            season_number: seasonNumber,
            pool_id: poolId
          });
          
          const insertData = {
            name: contestant.name.trim(),
            age: contestant.age,
            hometown: contestant.hometown.trim(),
            occupation: contestant.occupation.trim(),
            bio: contestant.bio || '',
            photo_url: contestant.photo || null,
            season_number: seasonNumber,
            data_source: 'bigbrother_fandom',
            ai_generated: false,
            pool_id: poolId,
            group_id: assignedGroup.id,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              source: 'bigbrother.fandom.com',
              data_source: 'real_contestant_data',
              batch_id: Date.now(),
              batch_number: batchNumber,
              global_index: globalIndex,
              auto_assigned_group: assignedGroup.group_name,
              target_pool_id: poolId,
              equal_distribution: `${globalIndex} assigned to group ${groupIndex + 1}/${poolGroups.length}`
            },
            is_active: true,
            sort_order: globalIndex
          };
          
          console.log(`🔥 INSERT DATA:`, insertData);
          
          // Try upsert first, then insert if contestant doesn't exist
          const { data, error } = await supabase
            .from('contestants')
            .upsert(insertData, { 
              onConflict: 'pool_id,name',
              ignoreDuplicates: false 
            })
            .select()
            .single();
          
          console.log(`🔥 DATABASE RESPONSE:`, { data: data?.id, error: error?.message });
          
          if (error) {
            throw new Error(`Database error: ${error.message} (${error.code})`);
          }
          
          console.log(`    ✅ Success: ${contestant.name} (ID: ${data.id})`);
          return { contestant, data };
        }, 3, 1000);
      })
    );
    
    // Process batch results
    let batchSuccessful = 0;
    const batchFailures: Array<{ name: string; error: string }> = [];
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batchSuccessful++;
        totalSuccessful++;
      } else {
        const contestant = batch[index];
        const error = result.reason?.message || 'Unknown error';
        console.log(`    ❌ Failed: ${contestant.name} - ${error}`);
        batchFailures.push({ name: contestant.name, error });
        allFailures.push({ name: contestant.name, error });
      }
    });
    
    console.log(`📊 Batch ${batchNumber} complete: ${batchSuccessful}/${batch.length} successful`);
    
    // Rate limiting between batches
    if (batchIndex < batches.length - 1) {
      console.log('⏱️  Rate limiting delay between batches...');
      await delay(300);
    }
  }
  
  console.log(`\n🎯 Final Results: ${totalSuccessful}/${newContestants.length} new contestants processed successfully (${contestants.length - newContestants.length} duplicates prevented)`);
  
  if (allFailures.length > 0) {
    console.log('❌ Failed contestants:', allFailures);
  }
  
  return {
    successful: totalSuccessful,
    failed: allFailures
  };
}