import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { decrypt, parseResponse } from '../_shared/ccavenue-crypto.ts';

serve(async (req) => {
  try {
    // Get environment variables
    const WORKING_KEY = Deno.env.get('CCAVENUE_WORKING_KEY');
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';

    if (!WORKING_KEY) {
      console.error('CCAVENUE_WORKING_KEY not configured');
      return new Response('Configuration error', { status: 500 });
    }

    // Parse the request (CCAvenue sends POST with form data)
    const formData = await req.formData();
    const encResp = formData.get('encResp') as string;

    if (!encResp) {
      console.error('No encrypted response from CCAvenue');
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=no_response`, 302);
    }

    // Decrypt the response
    let decryptedResponse: string;
    try {
      decryptedResponse = decrypt(encResp, WORKING_KEY);
    } catch (error) {
      console.error('Decryption failed:', error);
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=decryption_failed`, 302);
    }

    // Parse the response into object
    const responseParams = parseResponse(decryptedResponse);
    console.log('CCAvenue Response:', responseParams);

    // Extract important fields
    const {
      order_id,
      tracking_id,
      bank_ref_no,
      order_status,
      failure_message,
      payment_mode,
      card_name,
      status_code,
      status_message,
      amount,
      merchant_param1: plan_type,
      merchant_param2: user_id,
    } = responseParams;

    if (!order_id) {
      console.error('No order_id in response');
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=invalid_response`, 302);
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the order from database
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderFetchError || !order) {
      console.error('Order not found:', order_id);
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=order_not_found`, 302);
    }

    // Determine if payment was successful
    const isSuccess = order_status === 'Success';
    const newStatus = isSuccess ? 'success' : 'failed';

    // Update order in database
    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_id,
        bank_ref_no,
        order_status,
        status: newStatus,
        failure_message: failure_message || null,
        payment_mode,
        card_name,
        status_code,
        status_message,
        actual_amount_paid: amount ? parseFloat(amount) : order.amount,
        completed_at: new Date().toISOString(),
        ccavenue_response: responseParams,
      })
      .eq('order_id', order_id);

    if (orderUpdateError) {
      console.error('Failed to update order:', orderUpdateError);
    }

    // If payment successful, update user subscription
    if (isSuccess) {
      const subscriptionEndDate = new Date();

      // For premium_annual, add 1 year
      if (order.plan_type === 'premium_annual') {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        const { error: userUpdateError } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'premium',
            subscription_plan: 'premium_annual',
            subscription_end_date: subscriptionEndDate.toISOString(),
          })
          .eq('id', order.user_id);

        if (userUpdateError) {
          console.error('Failed to update user subscription:', userUpdateError);
        } else {
          console.log('User subscription updated successfully for:', order.user_id);
        }
      }

      // For research_single, we don't update subscription but track the purchase
      // This will be handled separately when we implement the research feature

      // Redirect to success page with order details
      return Response.redirect(
        `${FRONTEND_URL}/payment/success?order_id=${order_id}&tracking_id=${tracking_id}`,
        302
      );
    } else {
      // Payment failed - redirect to failure page
      return Response.redirect(
        `${FRONTEND_URL}/payment/failure?order_id=${order_id}&reason=${encodeURIComponent(failure_message || 'Payment failed')}`,
        302
      );
    }

  } catch (error) {
    console.error('Error in ccavenue-response:', error);
    const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';
    return Response.redirect(`${FRONTEND_URL}/payment/failure?error=server_error`, 302);
  }
});
