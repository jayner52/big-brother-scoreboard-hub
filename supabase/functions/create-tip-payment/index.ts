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
    // Get the authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { poolId, tipPercentage, tipAmount } = await req.json();

    if (!poolId || !tipAmount) {
      throw new Error("Missing required parameters");
    }

    // Verify user is pool owner
    const { data: poolData, error: poolError } = await supabaseClient
      .from('pools')
      .select('owner_id, name')
      .eq('id', poolId)
      .single();

    if (poolError || !poolData) {
      throw new Error("Pool not found");
    }

    if (poolData.owner_id !== user.id) {
      throw new Error("Only pool owner can pay tip jar");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe Checkout session for tip payment
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

    console.log('Created tip payment session:', {
      sessionId: session.id,
      poolId,
      userId: user.id,
      tipAmount
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating tip payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});