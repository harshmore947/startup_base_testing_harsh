import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts';
import { decrypt, parseResponse } from '../_shared/ccavenue-crypto.ts';
import { createSetupToken } from '../_shared/token-manager.ts';
import {
  sendEmailWithLogging,
  sendEmailWithRetry
} from '../_shared/sendgrid-client.ts';
import {
  generateWelcomeEmailHtml,
  generateWelcomeEmailText,
  generateSetupLink
} from '../_shared/email-templates.ts';

/**
 * ⚠️ TEST FUNCTION - Hardcoded CCAvenue TEST credentials
 * DO NOT use in production! Remove after testing.
 * 
 * Replace the placeholder values below with your actual CCAvenue TEST credentials.
 */

// ============================================
// 🔧 HARDCODE YOUR TEST CREDENTIALS HERE
// ============================================
const HARDCODED_WORKING_KEY = 'F60E17F831375F70CB6253B45B45A79E';       // Must be exactly 32 chars
const HARDCODED_FRONTEND_URL = 'https://startup-base-testing-harsh.vercel.app';                    // Local dev URL for redirects
// ============================================

// Helper to hash data for Meta Conversion API (SHA-256)
function hashDataForMeta(data: string): string {
  if (!data) return '';
  return createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Helper to track Meta Conversion event (non-blocking) - DISABLED for testing
async function trackMetaPurchaseEvent(params: {
  order_id: string;
  amount: number;
  plan_type: string;
  billing_email: string;
  user_agent?: string;
  client_ip?: string;
  frontend_url: string;
}): Promise<void> {
  // Skip Meta tracking in test mode
  console.log('🧪 [TEST] Skipping Meta tracking for test payment');
}

// Helper to generate random password
function generateRandomPassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

// Helper to find user in auth by email (handles pagination for 300+ users)
async function findUserInAuthByEmail(
  supabaseAdmin: any,
  email: string
): Promise<any | null> {
  console.log(`🔍 Searching all auth pages for: ${email}`);

  let page = 1;
  const perPage = 1000; // Maximum allowed by Supabase

  while (true) {
    console.log(`📄 Checking auth page ${page}...`);

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      console.error(`❌ Error fetching page ${page}:`, error);
      break;
    }

    if (!data?.users?.length) {
      console.log(`📄 No users on page ${page}, stopping search`);
      break;
    }

    console.log(`📄 Page ${page} has ${data.users.length} users`);

    const user = data.users.find((u) => u.email === email);
    if (user) {
      console.log(`✅ Found user on page ${page}:`, user.id);
      return user;
    }

    // If we got fewer results than perPage, we're on the last page
    if (data.users.length < perPage) {
      console.log(`📄 Last page reached (page ${page})`);
      break;
    }

    page++;
  }

  console.log(`❌ User not found in any auth page`);
  return null;
}

serve(async (req) => {
  try {
    console.log('🧪 [TEST] Received CCAvenue callback');
    console.log('📝 Request method:', req.method);

    // Use HARDCODED test credentials instead of Deno.env
    const WORKING_KEY = HARDCODED_WORKING_KEY.trim();
    const FRONTEND_URL = HARDCODED_FRONTEND_URL.trim();
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')?.trim();

    console.log('🔐 [TEST] WORKING_KEY present:', !!WORKING_KEY);
    console.log('🔐 [TEST] WORKING_KEY length:', WORKING_KEY?.length);
    console.log('🌐 [TEST] FRONTEND_URL:', FRONTEND_URL);
    console.log('📧 SENDGRID_API_KEY present:', !!SENDGRID_API_KEY);

    if (!WORKING_KEY) {
      console.error('❌ CCAVENUE_WORKING_KEY not hardcoded');
      return new Response('Configuration error', { status: 500 });
    }

    // Validate working key length
    if (WORKING_KEY.length !== 32) {
      console.error(`❌ WORKING_KEY invalid length: ${WORKING_KEY.length} (expected 32)`);
      return new Response('Configuration error - invalid key length', { status: 500 });
    }

    // Parse the request (CCAvenue sends POST with form data)
    const formData = await req.formData();
    const encResp = formData.get('encResp') as string;

    console.log('📦 encResp received:', !!encResp);
    console.log('📦 encResp length:', encResp?.length);

    if (!encResp) {
      console.error('❌ No encrypted response from CCAvenue');
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=no_response`, 303);
    }

    // Decrypt the response
    let decryptedResponse: string;
    try {
      console.log('🔓 Attempting to decrypt CCAvenue response...');
      decryptedResponse = await decrypt(encResp, WORKING_KEY);
      console.log('✅ Decryption successful, response length:', decryptedResponse.length);
      console.log('📄 Decrypted response preview:', decryptedResponse.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=decryption_failed`, 303);
    }

    // Parse the response into object
    const responseParams = parseResponse(decryptedResponse);
    console.log('📋 [TEST] CCAvenue Response parsed:', JSON.stringify(responseParams, null, 2));

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
      billing_email,  // IMPORTANT: Extract billing email for guest orders
      merchant_param1: plan_type,
      merchant_param2: user_id_or_guest,
      merchant_param3: guest_email,
    } = responseParams;

    console.log('🔍 [TEST] Key fields:', {
      order_id,
      tracking_id,
      order_status,
      amount,
      plan_type,
      billing_email,
      user_id_or_guest: user_id_or_guest?.substring(0, 8) + '...',
      is_guest: user_id_or_guest === 'GUEST',
    });

    if (!order_id) {
      console.error('❌ No order_id in response');
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=invalid_response`, 303);
    }

    // Create Supabase admin client
    // NOTE: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase runtime
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
      console.error('❌ Order not found:', order_id, orderFetchError?.message);
      return Response.redirect(`${FRONTEND_URL}/payment/failure?error=order_not_found`, 303);
    }

    console.log('✅ [TEST] Order found in database:', order_id);
    console.log('👤 Order user_id:', order.user_id || 'NULL (guest order)');

    // Determine if payment was successful
    const isSuccess = order_status === 'Success';
    const newStatus = isSuccess ? 'success' : 'failed';

    console.log('💳 [TEST] Payment status:', { order_status, isSuccess, newStatus });

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
      console.error('❌ Failed to update order:', orderUpdateError);
    } else {
      console.log('✅ [TEST] Order updated in database');
    }

    // If payment successful, process the order
    if (isSuccess) {
      console.log('🎉 [TEST] Payment successful! Processing order...');

      // ========================================
      // GUEST CHECKOUT HANDLING
      // ========================================
      let finalUserId = order.user_id;

      // Check if this is a guest order (user_id is NULL)
      if (!order.user_id) {
        console.log('👤 === [TEST] GUEST CHECKOUT DETECTED ===');

        // Use billing_email from CCAvenue or guest_email from merchant_param3
        const customerEmail = billing_email || guest_email || order.billing_email;

        if (!customerEmail) {
          console.error('❌ No email found for guest order');
          return Response.redirect(`${FRONTEND_URL}/payment/failure?error=no_email`, 303);
        }

        console.log('📧 Guest email:', customerEmail);

        // Try to find user by email first (more reliable than listUsers pagination)
        const { data: existingProfile } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (existingProfile) {
          console.log('⚠️ User with this email already exists:', existingProfile.id);
          console.log('🔗 Linking order to existing user and upgrading subscription');

          // Link order to existing user
          await supabaseAdmin
            .from('orders')
            .update({ user_id: existingProfile.id })
            .eq('order_id', order_id);

          // Update subscription if premium
          if (order.plan_type === 'premium_annual') {
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

            await supabaseAdmin
              .from('users')
              .update({
                subscription_status: 'premium',
                subscription_plan: 'premium_annual',
                subscription_end_date: subscriptionEndDate.toISOString(),
              })
              .eq('id', existingProfile.id);
          }

          finalUserId = existingProfile.id;
          console.log('✅ [TEST] Order linked to existing user and subscription upgraded');
        } else {
          // Create new user account for guest
          console.log('🆕 [TEST] Creating new user account for guest...');

          // Generate random password (user will set their own via email link)
          const tempPassword = generateRandomPassword();

          // Create user via Supabase Auth Admin API
          const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: customerEmail,
            password: tempPassword,
            email_confirm: true, // Auto-confirm email since they paid
            user_metadata: {
              full_name: order.billing_name || 'Customer',
              phone: order.billing_tel || '',
              created_via: 'guest_checkout_test',
            },
          });

          if (createUserError || !newUser.user) {
            console.error('❌ Failed to create user:', createUserError);

            // Check if error is due to existing email
            if (createUserError?.message?.includes('already been registered') || createUserError?.code === 'email_exists') {
              console.log('🔍 Email exists in auth but not in users table - searching ALL pages...');

              // Use paginated search to find user across all pages
              const existingAuthUser = await findUserInAuthByEmail(supabaseAdmin, customerEmail);

              if (existingAuthUser) {
                console.log('✅ Found existing auth user:', existingAuthUser.id);

                // Link order to existing user
                await supabaseAdmin
                  .from('orders')
                  .update({ user_id: existingAuthUser.id })
                  .eq('order_id', order_id);

                // Update or create user profile with subscription
                if (order.plan_type === 'premium_annual') {
                  const subscriptionEndDate = new Date();
                  subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

                  await supabaseAdmin
                    .from('users')
                    .upsert({
                      id: existingAuthUser.id,
                      email: customerEmail,
                      subscription_status: 'premium',
                      subscription_plan: 'premium_annual',
                      subscription_end_date: subscriptionEndDate.toISOString(),
                    });
                }

                finalUserId = existingAuthUser.id;
                console.log('✅ [TEST] Order linked and subscription upgraded for existing user');
              } else {
                console.error('⚠️ MANUAL ACTION REQUIRED: User claims email_exists but not found in auth');
                console.error('⚠️ Email:', customerEmail, 'Order:', order_id);
              }
            } else {
              console.error('⚠️ MANUAL ACTION REQUIRED: Unknown user creation error');
              console.error('⚠️ Error:', createUserError?.message, 'Email:', customerEmail, 'Order:', order_id);
            }
          } else {
            console.log('✅ [TEST] User account created:', newUser.user.id);

            // Create user profile with pending_setup status
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

            await supabaseAdmin
              .from('users')
              .insert({
                id: newUser.user.id,
                email: customerEmail,
                account_status: 'pending_setup', // Mark as pending password setup
                subscription_status: order.plan_type === 'premium_annual' ? 'premium' : 'free',
                subscription_plan: order.plan_type === 'premium_annual' ? 'premium_annual' : null,
                subscription_end_date: order.plan_type === 'premium_annual' ? subscriptionEndDate.toISOString() : null,
              });

            console.log('✅ [TEST] User profile created with pending_setup status');

            // Link order to new user
            await supabaseAdmin
              .from('orders')
              .update({ user_id: newUser.user.id })
              .eq('order_id', order_id);

            console.log('✅ [TEST] Order linked to new user');

            finalUserId = newUser.user.id;

            // Generate setup token
            if (SENDGRID_API_KEY) {
              try {
                console.log('🔑 [TEST] Creating setup token...');
                const token = await createSetupToken(
                  supabaseAdmin,
                  newUser.user.id,
                  customerEmail,
                  48 // 48 hours expiry
                );

                console.log('✅ [TEST] Setup token created');

                // Generate setup link
                const setupLink = generateSetupLink(token, FRONTEND_URL);

                // Send welcome email with setup link
                console.log('📧 [TEST] Sending welcome email...');

                const emailResult = await sendEmailWithLogging(
                  {
                    to: customerEmail,
                    subject: '[TEST] Welcome to StartupBase - Complete Your Setup',
                    htmlContent: generateWelcomeEmailHtml({
                      setupLink,
                      expiryHours: 48,
                    }),
                    textContent: generateWelcomeEmailText({
                      setupLink,
                      expiryHours: 48,
                    }),
                  },
                  SENDGRID_API_KEY,
                  supabaseAdmin,
                  {
                    emailType: 'welcome_test',
                    userId: newUser.user.id,
                    orderId: order_id,
                  }
                );

                if (emailResult.success) {
                  console.log('✅ [TEST] Welcome email sent successfully');
                } else {
                  console.error('⚠️ Failed to send welcome email:', emailResult.error);
                  console.error('⚠️ User can still login, but manual email may be needed');
                }
              } catch (emailError) {
                console.error('❌ Error in email sending process:', emailError);
                console.error('⚠️ User account created but email not sent - manual follow-up needed');
              }
            } else {
              console.warn('⚠️ SENDGRID_API_KEY not configured - skipping email');
            }
          }
        }
      } else {
        // Existing user (non-guest) - process normally
        console.log('👤 [TEST] Existing user order - processing normally');
      }

      // ========================================
      // STANDARD ORDER PROCESSING (for all orders)
      // ========================================

      const subscriptionEndDate = new Date();

      // For premium_annual, update subscription
      if (order.plan_type === 'premium_annual' && finalUserId) {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        const { error: userUpdateError } = await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'premium',
            subscription_plan: 'premium_annual',
            subscription_end_date: subscriptionEndDate.toISOString(),
          })
          .eq('id', finalUserId);

        if (userUpdateError) {
          console.error('❌ Failed to update user subscription:', userUpdateError);
        } else {
          console.log('✅ [TEST] User subscription updated successfully for:', finalUserId);
        }
      }

      // For research_single, create user_report from pending request
      if (order.plan_type === 'research_single' && finalUserId) {
        console.log('📝 [TEST] Creating research report for order:', order_id);

        // Fetch pending research request
        const { data: pendingRequest, error: fetchError } = await supabaseAdmin
          .from('pending_research_requests')
          .select('*')
          .eq('order_id', order_id)
          .single();

        if (fetchError || !pendingRequest) {
          console.error('❌ Failed to fetch pending research request:', fetchError);
        } else {
          console.log('✅ Found pending research request:', pendingRequest.id);

          // Create user_report
          const { error: reportError } = await supabaseAdmin
            .from('user_reports')
            .insert({
              user_id: finalUserId,
              idea_title: pendingRequest.idea_title,
              idea_description: pendingRequest.idea_description,
              status: 'pending',
              order_id: order_id,
              payment_status: 'paid',
            });

          if (reportError) {
            console.error('❌ Failed to create user report:', reportError);
          } else {
            console.log('✅ [TEST] User report created successfully');

            // Delete pending research request (cleanup)
            await supabaseAdmin
              .from('pending_research_requests')
              .delete()
              .eq('id', pendingRequest.id);

            console.log('✅ Pending research request cleaned up');
          }
        }
      }

      // ========================================
      // META CONVERSION TRACKING - SKIPPED IN TEST
      // ========================================
      console.log('🧪 [TEST] Skipping Meta conversion tracking');

      // Redirect to success page with order details
      const successUrl = `${FRONTEND_URL}/payment/success?order_id=${order_id}&tracking_id=${tracking_id}&plan_type=${order.plan_type}`;
      console.log('🔀 [TEST] Redirecting to success:', successUrl);
      return Response.redirect(successUrl, 303);
    } else {
      // Payment failed - redirect to failure page
      const failureUrl = `${FRONTEND_URL}/payment/failure?order_id=${order_id}&reason=${encodeURIComponent(failure_message || 'Payment failed')}&plan_type=${order.plan_type}`;
      console.log('🔀 [TEST] Redirecting to failure:', failureUrl);
      return Response.redirect(failureUrl, 303);
    }

  } catch (error) {
    console.error('❌ [TEST] Error in test-ccavenue-response:', error);
    const FRONTEND_URL = HARDCODED_FRONTEND_URL.trim();
    return Response.redirect(`${FRONTEND_URL}/payment/failure?error=server_error`, 303);
  }
});

