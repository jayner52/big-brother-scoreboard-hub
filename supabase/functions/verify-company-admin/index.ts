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
    console.log('Function started - checking method:', req.method)
    
    // Parse JSON with error handling
    let requestBody;
    try {
      requestBody = await req.json()
      console.log('Successfully parsed request body')
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError)
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid JSON in request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { password } = requestBody
    console.log('Extracted password, length:', password?.length || 0)

    if (!password) {
      console.log('No password provided')
      return new Response(
        JSON.stringify({ valid: false, error: 'Password required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check environment variable access
    console.log('Checking environment variables...')
    const storedPassword = Deno.env.get('COMPANY_ADMIN_PASSWORD')
    
    console.log('Environment check:', {
      hasStoredPassword: !!storedPassword,
      storedPasswordLength: storedPassword?.length || 0,
      receivedPasswordLength: password.length,
      environmentKeys: Object.keys(Deno.env.toObject()).filter(key => key.includes('COMPANY'))
    })
    
    if (!storedPassword) {
      console.error('COMPANY_ADMIN_PASSWORD not found in environment')
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Company admin password not configured',
          debug: 'Environment variable missing'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Password comparison
    const isValid = password === storedPassword
    console.log('Password comparison result:', isValid)

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
    console.error('Caught error in function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error',
        debug: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})