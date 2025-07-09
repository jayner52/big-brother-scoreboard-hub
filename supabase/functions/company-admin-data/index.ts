import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompanyAdminDataRequest {
  action: 'get_user_data' | 'get_pool_analytics';
}

interface EnhancedUserData {
  id: string;
  user_id: string;
  display_name: string | null;
  registration_date: string;
  email: string | null;
  email_source: 'google_oauth' | 'manual_signup' | 'email_list' | 'unknown';
  email_verified: boolean;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string | null;
  email_opt_in: boolean;
  email_subscription_status: string | null;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('COMPANY_ADMIN_DATA: Function started')
    
    // Verify this is an authenticated admin request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('COMPANY_ADMIN_DATA: No authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { action }: CompanyAdminDataRequest = await req.json()
    console.log('COMPANY_ADMIN_DATA: Action requested:', action)

    if (action === 'get_user_data') {
      return await handleGetUserData(supabase)
    } else if (action === 'get_pool_analytics') {
      return await handleGetPoolAnalytics(supabase)
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error: any) {
    console.error('COMPANY_ADMIN_DATA: Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handleGetUserData(supabase: any) {
  console.log('COMPANY_ADMIN_DATA: Getting enhanced user data...')
  
  try {
    // Get auth users with emails (using service role)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('COMPANY_ADMIN_DATA: Auth users error:', authError)
      throw authError
    }
    
    console.log(`COMPANY_ADMIN_DATA: Found ${authUsers?.users?.length || 0} auth users`)

    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('COMPANY_ADMIN_DATA: Profiles error:', profilesError)
      throw profilesError
    }

    console.log(`COMPANY_ADMIN_DATA: Found ${profiles?.length || 0} profiles`)

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
    
    if (preferencesError) {
      console.warn('COMPANY_ADMIN_DATA: User preferences error:', preferencesError)
    }

    // Get email list
    const { data: emailList, error: emailError } = await supabase
      .from('email_list')
      .select('*')
    
    if (emailError) {
      console.warn('COMPANY_ADMIN_DATA: Email list error:', emailError)
    }

    // Get pool memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('pool_memberships')
      .select(`
        user_id,
        role,
        joined_at,
        active,
        pools (name)
      `)
      .eq('active', true)
    
    if (membershipError) {
      console.warn('COMPANY_ADMIN_DATA: Memberships error:', membershipError)
    }

    // Combine all data
    const enhancedUsers: EnhancedUserData[] = (profiles || []).map((profile: any) => {
      // Find corresponding auth user
      const authUser = authUsers?.users?.find((user: any) => user.id === profile.user_id)
      
      // Determine email and source
      let email = null
      let emailSource: EnhancedUserData['email_source'] = 'unknown'
      let emailVerified = false
      
      if (authUser?.email) {
        email = authUser.email
        emailVerified = authUser.email_confirmed_at ? true : false
        
        // Determine source based on auth provider
        if (authUser.app_metadata?.providers?.includes('google')) {
          emailSource = 'google_oauth'
        } else {
          emailSource = 'manual_signup'
        }
      } else {
        // Fallback to email_list
        const emailListEntry = emailList?.find((e: any) => e.user_id === profile.user_id)
        if (emailListEntry) {
          email = emailListEntry.email
          emailSource = 'email_list'
        }
      }

      // Get user preferences
      const userPrefs = preferences?.find((p: any) => p.user_id === profile.user_id)
      
      // Get email subscription status
      const emailSub = emailList?.find((e: any) => e.user_id === profile.user_id)
      
      // Get pool memberships
      const userMemberships = memberships?.filter((m: any) => m.user_id === profile.user_id) || []

      return {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name || 'Anonymous User',
        registration_date: profile.created_at,
        email,
        email_source: emailSource,
        email_verified: emailVerified,
        terms_accepted: !!userPrefs?.terms_accepted_at,
        terms_accepted_at: userPrefs?.terms_accepted_at || null,
        terms_version: userPrefs?.terms_version || null,
        email_opt_in: userPrefs?.email_opt_in || false,
        email_subscription_status: emailSub?.status || null,
        pool_memberships: userMemberships.map((m: any) => ({
          pool_name: m.pools?.name || 'Unknown Pool',
          role: m.role,
          joined_at: m.joined_at
        }))
      }
    })

    // Calculate enhanced stats
    const stats = {
      total_registrations: enhancedUsers.length,
      terms_accepted_count: enhancedUsers.filter(u => u.terms_accepted).length,
      email_opted_in_count: enhancedUsers.filter(u => u.email_opt_in).length,
      active_pool_members: enhancedUsers.filter(u => u.pool_memberships.length > 0).length,
      email_subscribers: enhancedUsers.filter(u => u.email_subscription_status === 'active').length,
      google_oauth_users: enhancedUsers.filter(u => u.email_source === 'google_oauth').length,
      manual_signup_users: enhancedUsers.filter(u => u.email_source === 'manual_signup').length,
      verified_emails: enhancedUsers.filter(u => u.email_verified).length,
    }

    console.log('COMPANY_ADMIN_DATA: Enhanced user data compiled successfully')
    
    return new Response(
      JSON.stringify({ users: enhancedUsers, stats }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('COMPANY_ADMIN_DATA: Error in handleGetUserData:', error)
    throw error
  }
}

async function handleGetPoolAnalytics(supabase: any) {
  console.log('COMPANY_ADMIN_DATA: Getting pool analytics...')
  
  try {
    // Get all pools with owner info
    const { data: pools, error: poolsError } = await supabase
      .from('pools')
      .select(`
        id,
        name,
        owner_id,
        entry_fee_amount,
        entry_fee_currency,
        created_at,
        draft_open,
        draft_locked,
        season_complete,
        has_buy_in,
        profiles!pools_owner_id_fkey (display_name)
      `)
    
    if (poolsError) {
      console.error('COMPANY_ADMIN_DATA: Pools error:', poolsError)
      throw poolsError
    }

    // Get member counts
    const { data: memberships, error: membershipError } = await supabase
      .from('pool_memberships')
      .select('pool_id')
      .eq('active', true)
    
    if (membershipError) {
      console.warn('COMPANY_ADMIN_DATA: Memberships error:', membershipError)
    }

    // Get entry counts
    const { data: entries, error: entryError } = await supabase
      .from('pool_entries')
      .select('pool_id, payment_confirmed')
    
    if (entryError) {
      console.warn('COMPANY_ADMIN_DATA: Entries error:', entryError)
    }

    // Process pool data
    const processedPools = (pools || []).map((pool: any) => {
      const memberCount = memberships?.filter((m: any) => m.pool_id === pool.id).length || 0
      const entryCount = entries?.filter((e: any) => e.pool_id === pool.id).length || 0
      const confirmedEntries = entries?.filter((e: any) => e.pool_id === pool.id && e.payment_confirmed).length || 0
      
      return {
        ...pool,
        owner_display_name: pool.profiles?.display_name || 'Unknown Owner',
        member_count: memberCount,
        entry_count: entryCount,
        prize_pool_total: pool.has_buy_in ? (confirmedEntries * pool.entry_fee_amount) : 0,
      }
    })

    // Calculate stats
    const totalPools = processedPools.length
    const activePools = processedPools.filter((p: any) => !p.season_complete).length
    const totalMembers = processedPools.reduce((sum: number, p: any) => sum + p.member_count, 0)
    const totalPrizeMoney = processedPools.reduce((sum: number, p: any) => sum + p.prize_pool_total, 0)
    const totalEntries = processedPools.reduce((sum: number, p: any) => sum + p.entry_count, 0)

    const stats = {
      total_pools: totalPools,
      active_pools: activePools,
      total_members: totalMembers,
      total_prize_money: totalPrizeMoney,
      total_entries: totalEntries,
      avg_pool_size: totalPools > 0 ? Math.round((totalMembers / totalPools) * 100) / 100 : 0,
    }

    console.log('COMPANY_ADMIN_DATA: Pool analytics compiled successfully')
    
    return new Response(
      JSON.stringify({ pools: processedPools, stats }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('COMPANY_ADMIN_DATA: Error in handleGetPoolAnalytics:', error)
    throw error
  }
}