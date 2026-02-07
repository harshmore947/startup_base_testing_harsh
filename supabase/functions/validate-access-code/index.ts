import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const validateAccessCodeInput = (code: unknown): { valid: boolean; error?: string; code?: string } => {
  // Check if code exists and is a string
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Access code is required and must be a string' };
  }

  // Trim whitespace
  const trimmedCode = code.trim();

  // Length validation
  if (trimmedCode.length === 0) {
    return { valid: false, error: 'Access code cannot be empty' };
  }
  if (trimmedCode.length > 100) {
    return { valid: false, error: 'Access code is too long (max 100 characters)' };
  }

  // Format validation - allow alphanumeric, common separators, and @ symbol
  const validFormat = /^[A-Za-z0-9\-_@]+$/;
  if (!validFormat.test(trimmedCode)) {
    return { valid: false, error: 'Access code contains invalid characters' };
  }

  return { valid: true, code: trimmedCode };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Validate input
    const validation = validateAccessCodeInput(body.code);
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ valid: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const code = validation.code!;

    // Rate limiting: 5 attempts per 15 minutes per IP
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const ipAddress = ipHeader ? ipHeader.split(',')[0].trim() : null
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check rate limit using a temporary user ID (we'll use IP-based tracking)
    const tempUserId = crypto.randomUUID() // We create a temp UUID since this is before authentication
    
    // Check recent attempts from this IP
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: recentAttempts, error: rateLimitError } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('action_type', 'access_code_validation')
      .eq('ip_address', ipAddress)
      .gt('window_start', fifteenMinutesAgo)

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    }

    if (recentAttempts && recentAttempts.length >= 5) {
      console.log('Rate limit exceeded for IP:', ipAddress)
      return new Response(
        JSON.stringify({ valid: false, error: 'Too many attempts. Please try again in 15 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log this attempt
    await supabaseAdmin.from('rate_limits').insert({
      user_id: tempUserId,
      action_type: 'access_code_validation',
      ip_address: ipAddress,
      attempts: 1
    })

    // Get the secret access code from environment
    const validCode = Deno.env.get('EARLY_ACCESS_CODE')
    
    if (!validCode) {
      console.error('EARLY_ACCESS_CODE not configured in environment')
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the code
    const isValid = code === validCode
    
    if (!isValid) {
      console.log('Invalid access code attempt')
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Code is valid - create a session token
    const sessionToken = crypto.randomUUID()
    const userAgent = req.headers.get('user-agent')

    // Store the session
    const { error: insertError } = await supabaseAdmin
      .from('early_access_sessions')
      .insert({
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (insertError) {
      console.error('Failed to create session:', insertError)
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully validated access code and created session')

    return new Response(
      JSON.stringify({ 
        valid: true, 
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in validate-access-code:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
