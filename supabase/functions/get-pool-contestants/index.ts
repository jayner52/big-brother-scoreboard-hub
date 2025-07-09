import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create service role client to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { poolId } = await req.json()
    
    if (!poolId) {
      throw new Error('Pool ID is required')
    }

    console.log('🔥 GET_POOL_CONTESTANTS: Starting for pool:', poolId)

    // First, check existing contestants in the pool
    const { data: existingContestants, error: existingError } = await supabase
      .from('contestants')
      .select('*')
      .eq('pool_id', poolId)
      .order('sort_order', { ascending: true })

    if (existingError) {
      console.error('🔥 Error fetching existing contestants:', existingError)
      throw existingError
    }

    console.log('🔥 Found existing contestants:', existingContestants?.length || 0)

    // If pool has fewer than 17 contestants, seed from Season 27 globals
    if (!existingContestants || existingContestants.length < 17) {
      console.log('🔥 Pool needs seeding, fetching Season 27 globals...')
      
      // Get Season 27 global contestants
      const { data: globalContestants, error: globalError } = await supabase
        .from('contestants')
        .select('*')
        .is('pool_id', null)
        .eq('season_number', 27)
        .order('sort_order', { ascending: true })

      if (globalError) {
        console.error('🔥 Error fetching global contestants:', globalError)
        throw globalError
      }

      console.log('🔥 Found global Season 27 contestants:', globalContestants?.length || 0)

      if (globalContestants && globalContestants.length > 0) {
        // Get pool groups for mapping
        const { data: poolGroups, error: groupsError } = await supabase
          .from('contestant_groups')
          .select('*')
          .eq('pool_id', poolId)

        if (groupsError) {
          console.error('🔥 Error fetching pool groups:', groupsError)
          throw groupsError
        }

        // Get global groups for mapping
        const { data: globalGroups, error: globalGroupsError } = await supabase
          .from('contestant_groups')
          .select('*')
          .is('pool_id', null)

        if (globalGroupsError) {
          console.error('🔥 Error fetching global groups:', globalGroupsError)
          throw globalGroupsError
        }

        // Create group mapping
        const groupMapping = new Map()
        globalGroups?.forEach(globalGroup => {
          const poolGroup = poolGroups?.find(pg => pg.group_name === globalGroup.group_name)
          if (poolGroup) {
            groupMapping.set(globalGroup.id, poolGroup.id)
          }
        })

        console.log('🔥 Group mapping created:', Object.fromEntries(groupMapping))

        // Prepare contestants for insertion
        const contestantsToInsert = globalContestants.map(contestant => ({
          pool_id: poolId,
          group_id: groupMapping.get(contestant.group_id),
          name: contestant.name,
          age: contestant.age,
          hometown: contestant.hometown,
          occupation: contestant.occupation,
          bio: contestant.bio,
          photo_url: contestant.photo_url,
          sort_order: contestant.sort_order,
          is_active: contestant.is_active,
          season_number: contestant.season_number,
          ai_generated: contestant.ai_generated,
          data_source: 'bb27_preset'
        })).filter(c => c.group_id) // Only include contestants with valid group mapping

        console.log('🔥 Prepared contestants for insertion:', contestantsToInsert.length)

        if (contestantsToInsert.length > 0) {
          const { data: insertedContestants, error: insertError } = await supabase
            .from('contestants')
            .insert(contestantsToInsert)
            .select('*')

          if (insertError) {
            console.error('🔥 Error inserting contestants:', insertError)
            throw insertError
          }

          console.log('🔥 Successfully inserted contestants:', insertedContestants?.length || 0)
          
          // Return the newly inserted contestants
          return new Response(
            JSON.stringify({ 
              success: true, 
              contestants: insertedContestants,
              message: `Seeded ${insertedContestants?.length || 0} Season 27 contestants`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Return existing contestants
    return new Response(
      JSON.stringify({ 
        success: true, 
        contestants: existingContestants,
        message: `Found ${existingContestants?.length || 0} existing contestants`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('🔥 GET_POOL_CONTESTANTS ERROR:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        contestants: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})