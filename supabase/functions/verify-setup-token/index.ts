import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifySetupToken } from '../_shared/token-manager.ts';

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
    console.log('📨 Received token verification request');

    // Get token from request body
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔑 Verifying token...');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify token
    const tokenData = await verifySetupToken(supabaseAdmin, token);

    if (!tokenData) {
      console.log('❌ Token invalid or expired');
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Token is invalid or has expired'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Token valid for user:', tokenData.user_id);

    // Get user details
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(tokenData.user_id);

    if (!userData.user) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'User not found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return token validity and user email
    return new Response(
      JSON.stringify({
        valid: true,
        email: tokenData.email,
        user_id: tokenData.user_id,
        expires_at: tokenData.expires_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error verifying token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
