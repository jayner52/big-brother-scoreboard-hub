import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    console.log('CREATE-TIP-PAYMENT: Function started');
    
    // Verify environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log('CREATE-TIP-PAYMENT: Environment check:', {
      hasStripeKey: !!stripeKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey
    });
    
    if (!stripeKey) {
      console.error('CREATE-TIP-PAYMENT: STRIPE_SECRET_KEY not found in environment');
      throw new Error("Stripe configuration missing");
    }

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('CREATE-TIP-PAYMENT: No authorization header');
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log('CREATE-TIP-PAYMENT: Getting user with token');
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error('CREATE-TIP-PAYMENT: Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    const user = data.user;
    if (!user?.email) {
      console.error('CREATE-TIP-PAYMENT: User not authenticated or no email');
      throw new Error("User not authenticated or email missing");
    }
    
    console.log('CREATE-TIP-PAYMENT: User authenticated:', user.id);

    // Parse request body
    const { poolId, tipPercentage, tipAmount } = await req.json();
    console.log('CREATE-TIP-PAYMENT: Request data:', { poolId, tipPercentage, tipAmount });

    if (!poolId || !tipAmount) {
      console.error('CREATE-TIP-PAYMENT: Missing required parameters');
      throw new Error("Missing required parameters");
    }

    // Verify user is pool owner
    console.log('CREATE-TIP-PAYMENT: Checking pool ownership');
    const { data: poolData, error: poolError } = await supabaseClient
      .from('pools')
      .select('owner_id, name')
      .eq('id', poolId)
      .single();

    if (poolError) {
      console.error('CREATE-TIP-PAYMENT: Pool query error:', poolError);
      throw new Error(`Pool query failed: ${poolError.message}`);
    }
    
    if (!poolData) {
      console.error('CREATE-TIP-PAYMENT: Pool not found');
      throw new Error("Pool not found");
    }

    if (poolData.owner_id !== user.id) {
      console.error('CREATE-TIP-PAYMENT: User is not pool owner');
      throw new Error("Only pool owner can pay tip jar");
    }
    
    console.log('CREATE-TIP-PAYMENT: Pool ownership verified');

    // Initialize Stripe
    console.log('CREATE-TIP-PAYMENT: Initializing Stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    console.log('CREATE-TIP-PAYMENT: Checking for existing Stripe customer');
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('CREATE-TIP-PAYMENT: Found existing customer:', customerId);
    } else {
      console.log('CREATE-TIP-PAYMENT: No existing customer found');
    }

    // Create Stripe Checkout session for tip payment
    console.log('CREATE-TIP-PAYMENT: Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: { 
              name: `Pool Tip Payment - ${tipPercentage}%`,
              description: `Tip jar payment for ${poolData.name}`,
            },
            unit_amount: Math.round(tipAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/admin?tab=prizepool&tip=success`,
      cancel_url: `${req.headers.get("origin")}/admin?tab=prizepool&tip=cancelled`,
      metadata: {
        poolId: poolId,
        userId: user.id,
        tipPercentage: tipPercentage.toString(),
        tipAmount: tipAmount.toString(),
        paymentType: 'tip_jar'
      }
    });

    console.log('CREATE-TIP-PAYMENT: Successfully created session:', {
      sessionId: session.id,
      poolId,
      userId: user.id,
      tipAmount,
      sessionUrl: session.url
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('CREATE-TIP-PAYMENT: Error occurred:', error);
    console.error('CREATE-TIP-PAYMENT: Error stack:', error.stack);
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorType = error.name || 'Error';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      errorType: errorType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});