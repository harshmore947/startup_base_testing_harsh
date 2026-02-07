import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifySetupToken, markTokenAsUsed, invalidateUserTokens } from '../_shared/token-manager.ts';

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
    console.log('📨 Received account setup completion request');

    // Get token and password from request body
    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: 'Token and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔑 Verifying token...');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify token is valid
    const tokenData = await verifySetupToken(supabaseAdmin, token);

    if (!tokenData) {
      console.log('❌ Token invalid or expired');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token is invalid or has expired. Please request a new setup link.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Token valid for user:', tokenData.user_id);

    // Update user password
    console.log('🔐 Updating user password...');
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password: password }
    );

    if (passwordError) {
      console.error('❌ Failed to update password:', passwordError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update password. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Password updated successfully');

    // Update user profile to mark account as active
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .update({
        account_status: 'active'
      })
      .eq('id', tokenData.user_id);

    if (profileError) {
      console.error('⚠️ Failed to update account status:', profileError);
      // Non-critical - account setup still works
    } else {
      console.log('✅ Account status updated to active');
    }

    // Mark token as used
    await markTokenAsUsed(supabaseAdmin, token);
    console.log('✅ Token marked as used');

    // Invalidate any other pending tokens for this user (security)
    await invalidateUserTokens(supabaseAdmin, tokenData.user_id);
    console.log('✅ Other tokens invalidated');

    // Generate a session for the user
    console.log('🎫 Creating session for user...');
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: tokenData.email,
    });

    if (sessionError || !sessionData) {
      console.error('⚠️ Could not generate auto-login link:', sessionError);
      // Still return success - user can login manually
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Account setup complete! Please login with your new password.',
          email: tokenData.email,
          user_id: tokenData.user_id,
          requires_manual_login: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ Account setup completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account setup complete! Redirecting to login...',
        email: tokenData.email,
        user_id: tokenData.user_id,
        redirect_url: '/auth?mode=login',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error completing account setup:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
