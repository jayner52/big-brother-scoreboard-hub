import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log('🚀 CREATE-TIP-PAYMENT: Function started');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('✅ CREATE-TIP-PAYMENT: Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Verify environment variables first
    console.log('🔍 CREATE-TIP-PAYMENT: Checking environment variables...');
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log('🔍 CREATE-TIP-PAYMENT: Environment status:', {
      hasStripeKey: !!stripeKey,
      stripeKeyLength: stripeKey ? stripeKey.length : 0,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      method: req.method,
      url: req.url
    });

    // Fail fast if missing critical environment variables
    if (!stripeKey || stripeKey.length < 10) {
      console.error('❌ CREATE-TIP-PAYMENT: Invalid or missing STRIPE_SECRET_KEY');
      return new Response(JSON.stringify({ 
        error: "Stripe configuration error - secret key missing or invalid",
        errorCode: "STRIPE_CONFIG_ERROR",
        debug: { hasKey: !!stripeKey, keyLength: stripeKey ? stripeKey.length : 0 }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ CREATE-TIP-PAYMENT: Missing Supabase configuration');
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing",
        errorCode: "SUPABASE_CONFIG_ERROR" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Step 2: Create Supabase client
    console.log('🔧 CREATE-TIP-PAYMENT: Creating Supabase client...');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Step 3: Parse request body early
    console.log('📋 CREATE-TIP-PAYMENT: Parsing request body...');
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📋 CREATE-TIP-PAYMENT: Request data:', requestBody);
    } catch (parseError) {
      console.error('❌ CREATE-TIP-PAYMENT: Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid request body",
        errorCode: "PARSE_ERROR" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { poolId, tipPercentage, tipAmount } = requestBody;

    if (!poolId || !tipAmount || tipAmount <= 0) {
      console.error('❌ CREATE-TIP-PAYMENT: Invalid parameters:', { poolId, tipAmount });
      return new Response(JSON.stringify({ 
        error: "Missing or invalid required parameters",
        errorCode: "INVALID_PARAMS",
        received: { poolId: !!poolId, tipAmount }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Step 4: Authenticate user
    console.log('🔐 CREATE-TIP-PAYMENT: Authenticating user...');
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error('❌ CREATE-TIP-PAYMENT: Missing or invalid authorization header');
      return new Response(JSON.stringify({ 
        error: "Authentication required",
        errorCode: "AUTH_MISSING" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log('🔐 CREATE-TIP-PAYMENT: Verifying token...');
    
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('❌ CREATE-TIP-PAYMENT: Authentication failed:', authError);
      return new Response(JSON.stringify({ 
        error: "Authentication failed",
        errorCode: "AUTH_FAILED",
        details: authError?.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    console.log('✅ CREATE-TIP-PAYMENT: User authenticated:', { 
      userId: user.id, 
      email: user.email 
    });

    // Step 5: Verify pool ownership
    console.log('🏠 CREATE-TIP-PAYMENT: Verifying pool ownership...');
    const { data: poolData, error: poolError } = await supabaseClient
      .from('pools')
      .select('owner_id, name')
      .eq('id', poolId)
      .single();

    if (poolError || !poolData) {
      console.error('❌ CREATE-TIP-PAYMENT: Pool query failed:', poolError);
      return new Response(JSON.stringify({ 
        error: "Pool not found or access denied",
        errorCode: "POOL_NOT_FOUND",
        details: poolError?.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (poolData.owner_id !== user.id) {
      console.error('❌ CREATE-TIP-PAYMENT: User is not pool owner:', {
        userId: user.id,
        ownerId: poolData.owner_id
      });
      return new Response(JSON.stringify({ 
        error: "Only pool owner can pay tip jar",
        errorCode: "NOT_OWNER" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    console.log('✅ CREATE-TIP-PAYMENT: Pool ownership verified for:', poolData.name);

    // Step 6: Initialize Stripe
    console.log('💳 CREATE-TIP-PAYMENT: Initializing Stripe...');
    let stripe;
    try {
      stripe = new Stripe(stripeKey, {
        apiVersion: "2023-10-16",
      });
    } catch (stripeError) {
      console.error('❌ CREATE-TIP-PAYMENT: Stripe initialization failed:', stripeError);
      return new Response(JSON.stringify({ 
        error: "Payment service initialization failed",
        errorCode: "STRIPE_INIT_ERROR" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Step 7: Check for existing customer
    console.log('👤 CREATE-TIP-PAYMENT: Checking for existing Stripe customer...');
    let customerId;
    try {
      const customers = await stripe.customers.list({ 
        email: user.email, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('✅ CREATE-TIP-PAYMENT: Found existing customer:', customerId);
      } else {
        console.log('ℹ️ CREATE-TIP-PAYMENT: No existing customer found, will create new one');
      }
    } catch (customerError) {
      console.error('⚠️ CREATE-TIP-PAYMENT: Customer lookup failed, proceeding without:', customerError);
    }

    // Step 8: Create Stripe Checkout session
    console.log('🛒 CREATE-TIP-PAYMENT: Creating Stripe checkout session...');
    const sessionData = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: { 
              name: `Poolside Picks Platform Support - ${tipPercentage}%`,
              description: `Thank you for supporting Poolside Picks! Pool: ${poolData.name}`,
            },
            unit_amount: Math.round(tipAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin") || 'https://poolside-picks.com'}/admin?tab=prizepool&tip=success`,
      cancel_url: `${req.headers.get("origin") || 'https://poolside-picks.com'}/admin?tab=prizepool&tip=cancelled`,
      metadata: {
        poolId: poolId,
        userId: user.id,
        tipPercentage: tipPercentage.toString(),
        tipAmount: tipAmount.toString(),
        paymentType: 'tip_jar'
      }
    };

    console.log('🛒 CREATE-TIP-PAYMENT: Session configuration:', {
      currency: sessionData.line_items[0].price_data.currency,
      amount: sessionData.line_items[0].price_data.unit_amount,
      hasCustomer: !!customerId,
      successUrl: sessionData.success_url
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionData);
    } catch (sessionError) {
      console.error('❌ CREATE-TIP-PAYMENT: Session creation failed:', sessionError);
      return new Response(JSON.stringify({ 
        error: "Failed to create payment session",
        errorCode: "SESSION_CREATE_ERROR",
        details: sessionError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log('🎉 CREATE-TIP-PAYMENT: Successfully created session:', {
      sessionId: session.id,
      poolId,
      userId: user.id,
      tipAmount,
      url: session.url
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('💥 CREATE-TIP-PAYMENT: Unexpected error:', error);
    console.error('💥 CREATE-TIP-PAYMENT: Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      errorCode: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});