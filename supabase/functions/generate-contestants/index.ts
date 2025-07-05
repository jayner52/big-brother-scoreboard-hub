import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { poolId, season = 26, count = 16 } = await req.json()

    if (!poolId) {
      throw new Error('Pool ID is required')
    }

    // Check if contestants already exist for this pool
    const { data: existing } = await supabase
      .from('contestants')
      .select('id')
      .eq('pool_id', poolId)
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error('Contestants already exist for this pool')
    }

    // Generate realistic contestant names and details
    const contestants = []
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'Phoenix', 'River', 'Rowan', 'Skylar', 'Dakota', 'Emery', 'Finley']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas']
    const ages = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
    const occupations = ['Student', 'Teacher', 'Engineer', 'Nurse', 'Artist', 'Chef', 'Lawyer', 'Doctor', 'Photographer', 'Musician', 'Writer', 'Athlete', 'Designer', 'Entrepreneur', 'Consultant', 'Therapist']
    const hometowns = ['Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX', 'Fort Worth, TX', 'San Jose, CA', 'Charlotte, NC', 'Seattle, WA', 'Denver, CO', 'Las Vegas, NV']

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[i % lastNames.length]
      const age = ages[i % ages.length]
      const occupation = occupations[i % occupations.length]
      const hometown = hometowns[i % hometowns.length]

      contestants.push({
        pool_id: poolId,
        name: `${firstName} ${lastName}`,
        age,
        occupation,
        hometown,
        season_number: season,
        is_active: true,
        final_placement: null,
        bio: `${firstName} is a ${age}-year-old ${occupation} from ${hometown}.`,
        photo_url: null,
        sort_order: i + 1
      })
    }

    // Insert contestants
    const { data, error } = await supabase
      .from('contestants')
      .insert(contestants)
      .select()

    if (error) {
      console.error('Error inserting contestants:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, contestants: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})