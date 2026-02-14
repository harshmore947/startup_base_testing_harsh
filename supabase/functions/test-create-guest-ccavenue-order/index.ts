import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encrypt, stringifyRequest } from '../_shared/ccavenue-crypto.ts';

/**
 * ⚠️ TEST FUNCTION - Hardcoded CCAvenue TEST credentials
 * DO NOT use in production! Remove after testing.
 * 
 * Replace the placeholder values below with your actual CCAvenue TEST credentials.
 */

// ============================================
// 🔧 HARDCODE YOUR TEST CREDENTIALS HERE
// ============================================
const HARDCODED_MERCHANT_ID = '4412619';       // e.g., '123456'
const HARDCODED_ACCESS_CODE = 'ATIV06NB75AW16VIWA';       // e.g., 'ABCD12345EFGH'
const HARDCODED_WORKING_KEY = 'F60E17F831375F70CB6253B45B45A79E';       // Must be exactly 32 chars
const HARDCODED_REDIRECT_URL = 'https://sevjezttvhkgxybgedto.supabase.co/functions/v1/test-ccavenue-response';
const HARDCODED_CANCEL_URL = 'https://sevjezttvhkgxybgedto.supabase.co/functions/v1/test-ccavenue-response';
const HARDCODED_CCAVENUE_URL = 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan configurations (same as regular order)
const PLANS = {
  premium_annual: {
    name: 'Premium Annual Membership',
    amount: 999.00,  // Launch weekend offer: ₹999 (was ₹2,999)
    description: 'Full access to all premium features for 1 year',
    duration_days: 365,
  },
};

// Helper to safely log credential info (first/last chars only)
function logCredentialInfo(name: string, value: string | undefined): void {
  if (!value) {
    console.log(`🔴 ${name}: NOT SET`);
    return;
  }
  const first3 = value.substring(0, 3);
  const last3 = value.substring(value.length - 3);
  console.log(`🟢 ${name}: "${first3}...${last3}" (length: ${value.length})`);
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 [TEST] Received GUEST checkout request:', req.method);

    // Use HARDCODED test credentials instead of Deno.env
    const MERCHANT_ID = HARDCODED_MERCHANT_ID.trim();
    const ACCESS_CODE = HARDCODED_ACCESS_CODE.trim();
    const WORKING_KEY = HARDCODED_WORKING_KEY.trim();
    const REDIRECT_URL = HARDCODED_REDIRECT_URL.trim();
    const CANCEL_URL = HARDCODED_CANCEL_URL.trim();
    const CCAVENUE_URL = HARDCODED_CCAVENUE_URL.trim();

    // Log credential info for debugging (safe - only first/last chars)
    console.log('🔐 === [TEST] CCAvenue Credential Check (GUEST) ===');
    logCredentialInfo('MERCHANT_ID', MERCHANT_ID);
    logCredentialInfo('ACCESS_CODE', ACCESS_CODE);
    logCredentialInfo('WORKING_KEY', WORKING_KEY);
    logCredentialInfo('REDIRECT_URL', REDIRECT_URL);
    logCredentialInfo('CANCEL_URL', CANCEL_URL);
    console.log(`🌐 CCAVENUE_URL: ${CCAVENUE_URL}`);

    // Validate all required credentials are present
    if (!MERCHANT_ID || !ACCESS_CODE || !WORKING_KEY || !REDIRECT_URL || !CANCEL_URL) {
      console.error('❌ Missing CCAvenue configuration');
      return new Response(
        JSON.stringify({ error: 'CCAvenue configuration missing. Please hardcode all test credentials.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate working key format (must be exactly 32 characters)
    if (WORKING_KEY.length !== 32) {
      console.error(`❌ WORKING_KEY invalid length: ${WORKING_KEY.length} (expected 32)`);
      return new Response(
        JSON.stringify({ error: `Invalid working key length: ${WORKING_KEY.length}. Must be exactly 32 characters.` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate merchant ID is numeric
    if (!/^\d+$/.test(MERCHANT_ID)) {
      console.error('❌ MERCHANT_ID must be numeric');
      return new Response(
        JSON.stringify({ error: 'Invalid merchant ID format. Must be numeric.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ All CCAvenue test credentials validated successfully');

    // Get request body - GUEST checkout requires email and billing info
    const { plan_type, email, billing_name, billing_tel } = await req.json();

    console.log('📧 [TEST] Guest checkout for:', email);

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      console.error('❌ Invalid or missing email');
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!billing_name || billing_name.trim().length < 2) {
      console.error('❌ Invalid or missing billing name');
      return new Response(
        JSON.stringify({ error: 'Billing name is required (minimum 2 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate plan type
    if (!plan_type || !PLANS[plan_type as keyof typeof PLANS]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = PLANS[plan_type as keyof typeof PLANS];

    // Create admin client for database operations (service role)
    // NOTE: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase runtime
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique order ID for guest order - PREFIX WITH TEST_
    const emailHash = email.substring(0, 8).replace(/[^a-z0-9]/gi, '');
    const orderId = `TEST_GUEST_ORD_${Date.now()}_${emailHash}`;

    console.log('🆕 [TEST] Creating guest order:', orderId);

    // Create order in database with NULL user_id (guest order)
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: null,  // NULL for guest orders - will be linked after account creation
        order_id: orderId,
        amount: plan.amount,
        currency: 'INR',
        plan_type: plan_type,
        status: 'pending',
        billing_email: email,
        billing_name: billing_name?.trim(),
        billing_tel: billing_tel?.trim() || '',
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Guest order creation error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [TEST] Guest order created in database:', orderId);

    // Prepare CCAvenue request parameters
    const ccavenueParams = {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      amount: plan.amount.toFixed(2),
      currency: 'INR',
      redirect_url: REDIRECT_URL,
      cancel_url: CANCEL_URL,
      language: 'EN',
      billing_name: billing_name?.trim(),
      billing_email: email,
      billing_tel: billing_tel?.trim() || '',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      billing_country: 'India',
      merchant_param1: plan_type, // Store plan type for reference
      merchant_param2: 'GUEST', // Mark as guest checkout
      merchant_param3: email, // Store email for account creation
    };

    console.log('📋 [TEST] CCAvenue params prepared:', {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      amount: ccavenueParams.amount,
      email: email,
      is_guest: true,
    });

    // Convert to string and encrypt
    const requestString = stringifyRequest(ccavenueParams);
    console.log('📝 Request string length:', requestString.length);
    console.log('📝 Request string preview:', requestString.substring(0, 100) + '...');

    const encryptedRequest = await encrypt(requestString, WORKING_KEY);
    console.log('🔒 Encrypted request length:', encryptedRequest.length);
    console.log('🔒 Encrypted request preview:', encryptedRequest.substring(0, 50) + '...');

    // Return encrypted request and payment URL
    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderId,
        payment_url: CCAVENUE_URL,
        encrypted_request: encryptedRequest,
        access_code: ACCESS_CODE,
        is_guest_checkout: true,
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
    console.error('❌ [TEST] Error in test-create-guest-ccavenue-order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

