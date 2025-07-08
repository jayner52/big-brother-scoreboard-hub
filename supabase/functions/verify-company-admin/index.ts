import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyPasswordRequest {
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the submitted password
    const { password }: VerifyPasswordRequest = await req.json()

    if (!password) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Password required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get the stored company admin password from environment
    const storedPassword = Deno.env.get('COMPANY_ADMIN_PASSWORD')
    
    if (!storedPassword) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Company admin password not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Simple password comparison
    const isValid = password === storedPassword

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        message: isValid ? 'Access granted' : 'Invalid password'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in verify-company-admin function:', error)
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})