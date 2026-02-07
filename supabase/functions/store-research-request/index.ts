import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📨 store-research-request called');

    // Get Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please log in.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const { ideaTitle, ideaDescription } = await req.json();

    // Validate input
    if (!ideaTitle || ideaTitle.trim().length < 5 || ideaTitle.trim().length > 200) {
      return new Response(
        JSON.stringify({ error: 'Idea title must be between 5 and 200 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ideaDescription || ideaDescription.trim().length < 20 || ideaDescription.trim().length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Idea description must be between 20 and 2000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Input validated');

    // Create admin client for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user eligibility using database function
    const { data: eligibility, error: eligibilityError } = await supabaseAdmin.rpc(
      'check_user_research_eligibility',
      { p_user_id: user.id }
    );

    if (eligibilityError) {
      console.error('❌ Error checking eligibility:', eligibilityError);
      return new Response(
        JSON.stringify({ error: 'Failed to check eligibility. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Eligibility check result:', eligibility);

    // If not eligible, return the reason
    if (!eligibility.can_submit) {
      const reason = eligibility.reason;

      if (reason === 'has_active_request') {
        return new Response(
          JSON.stringify({
            error: 'You already have an active research request in progress.',
            canSubmit: false,
            reason: 'has_active_request',
            activeReport: eligibility.active_report,
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (reason === 'has_unpaid_order') {
        return new Response(
          JSON.stringify({
            error: 'You have a pending payment. Please complete it or wait for it to expire.',
            canSubmit: false,
            reason: 'has_unpaid_order',
            pendingOrder: eligibility.pending_order,
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Unable to submit research request at this time.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User is eligible to submit research request');

    // Generate unique order ID
    const timestamp = Date.now();
    const orderId = `ORD_RESEARCH_${timestamp}_${user.id.substring(0, 8)}`;

    console.log('🆔 Generated order ID:', orderId);

    // Create order record in database
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        amount: 599.00,
        currency: 'INR',
        plan_type: 'research_single',
        status: 'pending',
        billing_email: user.email,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Failed to create order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Order created:', orderData.id);

    // Store research request in pending_research_requests table
    const { error: pendingError } = await supabaseAdmin
      .from('pending_research_requests')
      .insert({
        user_id: user.id,
        order_id: orderId,
        idea_title: ideaTitle.trim(),
        idea_description: ideaDescription.trim(),
      });

    if (pendingError) {
      console.error('❌ Failed to store pending request:', pendingError);

      // Rollback: Delete the order
      await supabaseAdmin.from('orders').delete().eq('order_id', orderId);

      return new Response(
        JSON.stringify({ error: 'Failed to store research request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Pending research request stored');

    // Call create-ccavenue-order to get payment URL
    const ccavenueResponse = await fetch(
      `${supabaseUrl}/functions/v1/create-ccavenue-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          plan_type: 'research_single',
          preCreatedOrderId: orderId, // Pass our pre-created order ID
        }),
      }
    );

    if (!ccavenueResponse.ok) {
      const errorText = await ccavenueResponse.text();
      console.error('❌ CCAvenue order creation failed:', errorText);

      // Rollback: Delete pending request and order
      await supabaseAdmin.from('pending_research_requests').delete().eq('order_id', orderId);
      await supabaseAdmin.from('orders').delete().eq('order_id', orderId);

      return new Response(
        JSON.stringify({ error: 'Failed to initiate payment. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ccavenueData = await ccavenueResponse.json();

    console.log('✅ Payment gateway URL generated');
    console.log('📦 CCAvenue response:', JSON.stringify(ccavenueData));
    console.log('🎉 Research request stored successfully! Ready for payment.');

    // Return success response with payment details
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research request created. Redirecting to payment...',
        orderId: orderId,
        amount: 599.00,
        originalAmount: 999.00,
        currency: 'INR',
        ideaTitle: ideaTitle.trim(),
        paymentUrl: ccavenueData.payment_url,
        encRequest: ccavenueData.encrypted_request,
        accessCode: ccavenueData.access_code,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred. Please try again.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
