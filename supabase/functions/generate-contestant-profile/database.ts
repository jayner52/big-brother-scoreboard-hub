import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ContestantProfile, ProcessingResult } from './types.ts';
import { retryWithBackoff, delay } from './utils.ts';

// Process contestants in batches
export async function processBatches(
  contestants: ContestantProfile[],
  seasonNumber: number,
  supabaseUrl: string,
  supabaseKey: string
): Promise<ProcessingResult> {
  const BATCH_SIZE = 10;
  const batches = [];
  
  // Split contestants into batches
  for (let i = 0; i < contestants.length; i += BATCH_SIZE) {
    batches.push(contestants.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`📦 Processing ${contestants.length} contestants in ${batches.length} batches of ${BATCH_SIZE}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  let totalSuccessful = 0;
  const allFailures: Array<{ name: string; error: string }> = [];
  
  // Skip clearing - work with existing contestants or add new ones
  console.log(`📋 Processing contestants for season ${seasonNumber} (will update existing or add new)...`);
  
  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchNumber = batchIndex + 1;
    
    console.log(`\n📋 Processing batch ${batchNumber}/${batches.length} (${batch.length} contestants)...`);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (contestant, index) => {
        const globalIndex = batchIndex * BATCH_SIZE + index + 1;
        
        return await retryWithBackoff(async () => {
          console.log(`  [${globalIndex}/${contestants.length}] Processing: ${contestant.name}`);
          
          // Auto-assign group based on order (4 groups, distribute evenly)
          const groupNames = ['Group A', 'Group B', 'Group C', 'Group D'];
          const groupIndex = (globalIndex - 1) % 4;
          
          // Get the group ID for this group name
          const { data: groups, error: groupError } = await supabase
            .from('contestant_groups')
            .select('id, group_name')
            .eq('group_name', groupNames[groupIndex])
            .single();
          
          if (groupError) {
            console.log(`⚠️  Warning: Could not find group ${groupNames[groupIndex]}: ${groupError.message}`);
          }
          
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
            group_id: groups?.id || null,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              source: 'bigbrother.fandom.com',
              data_source: 'real_contestant_data',
              batch_id: Date.now(),
              batch_number: batchNumber,
              global_index: globalIndex,
              auto_assigned_group: groupNames[groupIndex]
            },
            is_active: true,
            sort_order: globalIndex
          };
          
          // Try upsert first, then insert if contestant doesn't exist
          const { data, error } = await supabase
            .from('contestants')
            .upsert(insertData, { 
              onConflict: 'pool_id,name',
              ignoreDuplicates: false 
            })
            .select()
            .single();
          
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
  
  console.log(`\n🎯 Final Results: ${totalSuccessful}/${contestants.length} contestants processed successfully`);
  
  if (allFailures.length > 0) {
    console.log('❌ Failed contestants:', allFailures);
  }
  
  return {
    successful: totalSuccessful,
    failed: allFailures
  };
}