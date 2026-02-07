import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { encrypt, stringifyRequest } from '../_shared/ccavenue-crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan configurations
const PLANS = {
  premium_annual: {
    name: 'Premium Annual Membership',
    amount: 2999.00,
    description: 'Full access to all premium features for 1 year',
    duration_days: 365,
  },
  research_single: {
    name: 'Research Your Idea',
    amount: 999.00,
    description: 'Single idea research report',
    duration_days: 0, // One-time purchase
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const MERCHANT_ID = Deno.env.get('CCAVENUE_MERCHANT_ID');
    const ACCESS_CODE = Deno.env.get('CCAVENUE_ACCESS_CODE');
    const WORKING_KEY = Deno.env.get('CCAVENUE_WORKING_KEY');
    const REDIRECT_URL = Deno.env.get('CCAVENUE_REDIRECT_URL');
    const CANCEL_URL = Deno.env.get('CCAVENUE_CANCEL_URL');
    const CCAVENUE_URL = Deno.env.get('CCAVENUE_URL') || 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';

    if (!MERCHANT_ID || !ACCESS_CODE || !WORKING_KEY || !REDIRECT_URL || !CANCEL_URL) {
      throw new Error('CCAvenue configuration missing in environment variables');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { plan_type } = await req.json();

    // Validate plan type
    if (!plan_type || !PLANS[plan_type as keyof typeof PLANS]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = PLANS[plan_type as keyof typeof PLANS];

    // Get user profile for billing info
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single();

    // Generate unique order ID
    const orderId = `ORD_${Date.now()}_${user.id.substring(0, 8)}`;

    // Create order in database (using service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount: plan.amount,
        currency: 'INR',
        plan_type: plan_type,
        status: 'pending',
        billing_email: userProfile?.email || user.email,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare CCAvenue request parameters
    const ccavenueParams = {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      amount: plan.amount.toFixed(2),
      currency: 'INR',
      redirect_url: REDIRECT_URL,
      cancel_url: CANCEL_URL,
      language: 'EN',
      billing_name: user.user_metadata?.full_name || 'Customer',
      billing_email: userProfile?.email || user.email || '',
      billing_tel: user.user_metadata?.phone || '',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      billing_country: 'India',
      merchant_param1: plan_type, // Store plan type for reference
      merchant_param2: user.id, // Store user ID for reference
    };

    // Convert to string and encrypt
    const requestString = stringifyRequest(ccavenueParams);
    const encryptedRequest = encrypt(requestString, WORKING_KEY);

    // Return encrypted request and payment URL
    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        payment_url: CCAVENUE_URL,
        encrypted_request: encryptedRequest,
        access_code: ACCESS_CODE,
        plan: {
          name: plan.name,
          amount: plan.amount,
          description: plan.description,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-ccavenue-order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
