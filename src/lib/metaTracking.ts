import { supabase } from '@/integrations/supabase/client';

interface MetaEventData {
  event_name: 'Purchase' | 'Lead' | 'ViewContent' | 'InitiateCheckout' | 'CompleteRegistration';
  event_source_url?: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_phone?: string;
  user_city?: string;
  user_state?: string;
  user_country?: string;
  user_zip?: string;
  currency?: string;
  value?: number;
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  num_items?: number;
  order_id?: string;
}

/**
 * Get Facebook Click ID (fbc) from cookie
 */
function getFacebookClickId(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbc') {
      return value;
    }
  }
  return null;
}

/**
 * Get Facebook Browser ID (fbp) from cookie
 */
function getFacebookBrowserId(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      return value;
    }
  }
  return null;
}

/**
 * Track Meta Conversion Event
 * This is a fire-and-forget function that won't block the user flow
 */
export async function trackMetaConversion(eventData: MetaEventData): Promise<void> {
  try {
    // Try to get current user, but don't fail if not available (guest users)
    let userEmail: string | undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userEmail = user?.email ?? undefined;
    } catch {
      // User not logged in - that's fine for guest checkout
      console.log('📊 No authenticated user - tracking as guest');
    }

    // Prepare payload with additional browser data
    const payload = {
      ...eventData,
      event_source_url: eventData.event_source_url || window.location.href,
      client_ip_address: undefined, // Server will get this from request
      client_user_agent: navigator.userAgent,
      fbc: getFacebookClickId(),
      fbp: getFacebookBrowserId(),
      user_email: eventData.user_email || userEmail,
    };

    console.log('📊 Tracking Meta event:', eventData.event_name, payload.order_id ? `(order: ${payload.order_id})` : '');

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('meta-conversion-api', {
      body: payload,
    });

    if (error) {
      console.error('Meta tracking error (non-blocking):', error);
      return;
    }

    console.log('✅ Meta event tracked:', data);
  } catch (error) {
    // Silently fail - don't break user experience if tracking fails
    console.error('Meta tracking failed (non-blocking):', error);
  }
}

/**
 * Track Purchase Event
 */
export async function trackPurchase({
  value,
  currency = 'INR',
  content_name,
  order_id,
  user_email,
}: {
  value: number;
  currency?: string;
  content_name: string;
  order_id: string;
  user_email?: string;
}): Promise<void> {
  await trackMetaConversion({
    event_name: 'Purchase',
    currency,
    value,
    content_name,
    content_type: 'product',
    order_id,
    user_email,
    num_items: 1,
  });

  // Also trigger client-side pixel if available
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      value,
      currency,
      content_name,
    });
  }
}

/**
 * Track ViewContent Event
 */
export async function trackViewContent({
  content_name,
  content_type = 'product',
}: {
  content_name: string;
  content_type?: string;
}): Promise<void> {
  await trackMetaConversion({
    event_name: 'ViewContent',
    content_name,
    content_type,
  });

  // Also trigger client-side pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name,
      content_type,
    });
  }
}

/**
 * Track InitiateCheckout Event
 */
export async function trackInitiateCheckout({
  value,
  currency = 'INR',
  content_name,
}: {
  value: number;
  currency?: string;
  content_name: string;
}): Promise<void> {
  await trackMetaConversion({
    event_name: 'InitiateCheckout',
    currency,
    value,
    content_name,
    content_type: 'product',
  });

  // Also trigger client-side pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value,
      currency,
      content_name,
    });
  }
}
