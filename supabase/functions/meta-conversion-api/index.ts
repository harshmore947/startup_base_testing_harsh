import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createHash } from 'https://deno.land/std@0.168.0/node/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowHttpOrigins = Deno.env.get('ALLOW_HTTP_ORIGINS') === 'true';

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .filter((origin) => {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === 'https:') return true;
      return allowHttpOrigins && parsed.protocol === 'http:';
    } catch {
      return false;
    }
  });

const META_PIXEL_ID_FALLBACK = Deno.env.get('META_PIXEL_ID_FALLBACK')?.trim();

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const buildCors = (origin?: string | null) => {
  const isAllowed = !!origin && allowedOrigins.includes(origin);

  return {
    allowed: isAllowed,
    headers: isAllowed
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      : {},
  };
};

// Hash user data for privacy (SHA-256)
function hashData(data: string): string {
  if (!data) return '';
  return createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Main event tracking function
async function trackConversionEvent(eventData: any) {
  const META_PIXEL_ID =
    Deno.env.get('META_PIXEL_ID')?.trim() || META_PIXEL_ID_FALLBACK;
  const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')?.trim();

  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.error('❌ Meta credentials not configured');
    throw new Error('Meta credentials not configured');
  }
  if (!Deno.env.get('META_PIXEL_ID') && META_PIXEL_ID_FALLBACK) {
    console.warn('⚠️ Using META_PIXEL_ID_FALLBACK; please configure META_PIXEL_ID.');
  }

  const url = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;

  console.log('📊 Sending event to Meta Conversion API:', eventData.event_name);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [eventData],
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ Meta API Error:', result);
    throw new Error(`Meta API Error: ${JSON.stringify(result)}`);
  }

  console.log('✅ Meta Conversion API response:', result);
  return result;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const minimalCorsHeaders = origin ? { 'Access-Control-Allow-Origin': origin } : {};

  if (!allowedOrigins.length) {
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...minimalCorsHeaders } }
    );
  }

  const cors = buildCors(origin);

  if (req.method === 'OPTIONS') {
    if (!cors.allowed) {
      return new Response('Origin not allowed', { status: 403 });
    }
    return new Response(null, { headers: cors.headers });
  }

  if (!cors.allowed) {
    return new Response('Origin not allowed', { status: 403 });
  }

  try {
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 500, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
      );
    }

    // Parse body first to check event type
    const body = await req.json();
    const {
      event_name,
      event_source_url,
      user_email,
      user_first_name,
      user_last_name,
      user_phone,
      user_city,
      user_state,
      user_country,
      user_zip,
      client_ip_address,
      client_user_agent,
      fbc, // Facebook click ID from cookie
      fbp, // Facebook browser ID from cookie
      currency,
      value,
      content_name,
      content_type,
      content_ids,
      num_items,
      order_id,
    } = body;

    let trackingEmail = user_email;

    // For Purchase events with order_id, allow unauthenticated but validate order
    if (event_name === 'Purchase' && order_id) {
      console.log('📊 Purchase event with order_id - validating order:', order_id);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('billing_email, status')
        .eq('order_id', order_id)
        .eq('status', 'success')
        .maybeSingle();

      if (order) {
        console.log('✅ Valid order found for Purchase tracking');
        trackingEmail = trackingEmail || order.billing_email;
        // Skip auth requirement for valid orders
      } else {
        console.warn('⚠️ Order not found or not successful:', order_id, orderError?.message);
        // For invalid orders, require auth
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized - invalid order' }),
            { status: 401, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
          );
        }
        const token = authHeader.substring(7).trim();
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
          );
        }
        trackingEmail = trackingEmail || user.email;
      }
    } else if (event_name === 'InitiateCheckout' || event_name === 'ViewContent') {
      // For InitiateCheckout and ViewContent, allow without auth (these happen before purchase)
      // Try to get user if auth header present, but don't require it
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7).trim();
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user?.email) {
            trackingEmail = trackingEmail || user.email;
          }
        } catch {
          // Auth failed but that's okay for these events
          console.log('📊 InitiateCheckout/ViewContent without valid auth - proceeding anyway');
        }
      }
      // Proceed without requiring authentication
    } else {
      // For other events (Lead, CompleteRegistration, etc.), require authentication
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.substring(7).trim();
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        console.error('Auth validation failed');
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
        );
      }
      trackingEmail = trackingEmail || user.email;
    }

    // Validate required fields
    if (!event_name) {
      return new Response(
        JSON.stringify({ error: 'event_name is required' }),
        { status: 400, headers: { ...cors.headers, 'Content-Type': 'application/json' } }
      );
    }

    // Generate event_id for deduplication (client + server events with same ID are deduplicated)
    const event_id = `${event_name}_${order_id || Date.now()}_${Math.random().toString(36).substring(7)}`;
    const event_time = Math.floor(Date.now() / 1000);

    // Prepare user data (hashed for privacy)
    const user_data: any = {};

    if (trackingEmail) user_data.em = hashData(trackingEmail);
    if (user_first_name) user_data.fn = hashData(user_first_name);
    if (user_last_name) user_data.ln = hashData(user_last_name);
    if (user_phone) user_data.ph = hashData(user_phone);
    if (user_city) user_data.ct = hashData(user_city);
    if (user_state) user_data.st = hashData(user_state);
    if (user_country) user_data.country = hashData(user_country);
    if (user_zip) user_data.zp = hashData(user_zip);
    if (client_ip_address) user_data.client_ip_address = client_ip_address;
    if (client_user_agent) user_data.client_user_agent = client_user_agent;
    if (fbc) user_data.fbc = fbc;
    if (fbp) user_data.fbp = fbp;

    // Prepare custom data
    const custom_data: any = {};
    if (currency) custom_data.currency = currency;
    if (value) custom_data.value = parseFloat(value);
    if (content_name) custom_data.content_name = content_name;
    if (content_type) custom_data.content_type = content_type;
    if (content_ids) custom_data.content_ids = content_ids;
    if (num_items) custom_data.num_items = num_items;
    if (order_id) custom_data.order_id = order_id;

    // Construct the event data
    const eventData = {
      event_name,
      event_time,
      event_id,
      event_source_url: event_source_url || 'https://www.startupbase.co.in',
      action_source: 'website',
      user_data,
      custom_data,
    };

    // Send to Meta
    const result = await trackConversionEvent(eventData);

    return new Response(
      JSON.stringify({
        success: true,
        event_id,
        meta_response: result
      }),
      {
        status: 200,
        headers: { ...cors.headers, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in meta-conversion-api:', error);

    // Return success even on error to not break the user flow
    // Just log the error for debugging
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        note: 'Tracking error logged, user flow not affected'
      }),
      {
        status: 200, // Return 200 to not break frontend
        headers: { ...cors.headers, 'Content-Type': 'application/json' }
      }
    );
  }
});
