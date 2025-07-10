import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Pool {
  id: string
  name: string
  registration_deadline: string
  draft_open: boolean
  allow_new_participants: boolean
  draft_locked: boolean
  hide_picks_until_draft_closed: boolean
  owner_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Draft auto-closer: Starting check for expired drafts')

    // Find pools with expired registration deadlines that are still open
    const { data: expiredPools, error: fetchError } = await supabase
      .from('pools')
      .select('id, name, registration_deadline, draft_open, allow_new_participants, draft_locked, hide_picks_until_draft_closed, owner_id')
      .eq('draft_open', true)
      .not('registration_deadline', 'is', null)
      .lt('registration_deadline', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching expired pools:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pools' }),
        { status: 500, headers: corsHeaders }
      )
    }

    if (!expiredPools || expiredPools.length === 0) {
      console.log('No expired drafts found')
      return new Response(
        JSON.stringify({ message: 'No expired drafts found', processed: 0 }),
        { status: 200, headers: corsHeaders }
      )
    }

    console.log(`Found ${expiredPools.length} expired drafts to close`)
    let successCount = 0
    const results = []

    // Process each expired pool
    for (const pool of expiredPools) {
      try {
        console.log(`Processing pool: ${pool.name} (${pool.id})`)

        // Update pool with cascade settings
        const { error: updateError } = await supabase
          .from('pools')
          .update({
            draft_open: false,                          // Close the draft
            allow_new_participants: false,             // Disable new participants
            draft_locked: true,                        // Lock all teams
            hide_picks_until_draft_closed: false       // Show everyone's picks
          })
          .eq('id', pool.id)

        if (updateError) {
          console.error(`Error updating pool ${pool.id}:`, updateError)
          results.push({
            pool_id: pool.id,
            pool_name: pool.name,
            success: false,
            error: updateError.message
          })
          continue
        }

        // Create audit log entry
        await supabase
          .from('special_events')
          .insert({
            pool_id: pool.id,
            contestant_id: '00000000-0000-0000-0000-000000000000', // Placeholder for system events
            event_type: 'draft_auto_closed',
            description: `Draft automatically closed at registration deadline. Settings updated: New participants disabled, All teams locked, Picks now visible.`,
            week_number: 0,
            points_awarded: 0
          })

        successCount++
        results.push({
          pool_id: pool.id,
          pool_name: pool.name,
          success: true,
          registration_deadline: pool.registration_deadline,
          settings_updated: {
            draft_open: false,
            allow_new_participants: false,
            draft_locked: true,
            hide_picks_until_draft_closed: false
          }
        })

        console.log(`Successfully closed draft for pool: ${pool.name}`)

      } catch (error) {
        console.error(`Unexpected error processing pool ${pool.id}:`, error)
        results.push({
          pool_id: pool.id,
          pool_name: pool.name,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`Draft auto-closer completed: ${successCount}/${expiredPools.length} pools processed successfully`)

    return new Response(
      JSON.stringify({
        message: 'Draft auto-closer completed',
        processed: expiredPools.length,
        successful: successCount,
        results
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Draft auto-closer error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})