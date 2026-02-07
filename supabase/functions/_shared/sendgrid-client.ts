/**
 * SendGrid Email Client
 * Handles sending emails via SendGrid API with retry logic and error tracking
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  from?: {
    email: string;
    name: string;
  };
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

interface FailedEmailLog {
  recipient_email: string;
  email_type: string;
  subject: string;
  user_id?: string;
  order_id?: string;
  error_message: string;
  error_code?: string;
  retry_count: number;
  status: 'failed' | 'retrying' | 'permanently_failed' | 'resolved';
}

/**
 * Sends an email using SendGrid API
 *
 * @param options - Email configuration
 * @param apiKey - SendGrid API key
 * @returns Result object with success status and details
 */
export async function sendEmail(
  options: EmailOptions,
  apiKey: string
): Promise<SendEmailResult> {
  const fromEmail = options.from?.email || Deno.env.get('FROM_EMAIL') || 'noreply@startupbase.co.in';
  const fromName = options.from?.name || Deno.env.get('FROM_NAME') || 'StartupBase';

  const payload = {
    personalizations: [
      {
        to: [{ email: options.to }],
        subject: options.subject,
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    content: [
      {
        type: 'text/plain',
        value: options.textContent,
      },
      {
        type: 'text/html',
        value: options.htmlContent,
      },
    ],
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // SendGrid returns 202 Accepted on success
      const messageId = response.headers.get('X-Message-Id');
      return {
        success: true,
        messageId: messageId || undefined,
        statusCode: response.status,
      };
    } else {
      const errorText = await response.text();
      console.error('SendGrid API error:', {
        status: response.status,
        body: errorText,
      });

      return {
        success: false,
        error: errorText || `SendGrid API returned status ${response.status}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sends an email with retry logic
 * Retries up to 3 times with exponential backoff
 *
 * @param options - Email configuration
 * @param apiKey - SendGrid API key
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Result object with success status and details
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  apiKey: string,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  let lastError: SendEmailResult | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retrying email send (attempt ${attempt}/${maxRetries}) after ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const result = await sendEmail(options, apiKey);

    if (result.success) {
      if (attempt > 0) {
        console.log(`Email sent successfully on attempt ${attempt + 1}`);
      }
      return result;
    }

    lastError = result;

    // Don't retry on 4xx errors (client errors like invalid email)
    if (result.statusCode && result.statusCode >= 400 && result.statusCode < 500) {
      console.log(`Not retrying due to client error (${result.statusCode})`);
      break;
    }
  }

  return lastError || {
    success: false,
    error: 'Failed to send email after all retries',
  };
}

/**
 * Logs a failed email to the database for monitoring
 *
 * @param supabaseClient - Supabase client with service role
 * @param failedEmail - Failed email details
 * @returns True if logged successfully
 */
export async function logFailedEmail(
  supabaseClient: SupabaseClient,
  failedEmail: FailedEmailLog
): Promise<boolean> {
  const { error } = await supabaseClient
    .from('failed_emails')
    .insert(failedEmail);

  if (error) {
    console.error('Error logging failed email:', error);
    return false;
  }

  return true;
}

/**
 * Sends email with automatic failure logging
 * Combines sendEmailWithRetry + logFailedEmail for convenience
 *
 * @param options - Email configuration
 * @param apiKey - SendGrid API key
 * @param supabaseClient - Supabase client for logging failures
 * @param metadata - Additional metadata for failure logging
 * @returns Result object with success status
 */
export async function sendEmailWithLogging(
  options: EmailOptions,
  apiKey: string,
  supabaseClient: SupabaseClient,
  metadata: {
    emailType: string;
    userId?: string;
    orderId?: string;
  }
): Promise<SendEmailResult> {
  const result = await sendEmailWithRetry(options, apiKey);

  if (!result.success) {
    // Log the failure
    await logFailedEmail(supabaseClient, {
      recipient_email: options.to,
      email_type: metadata.emailType,
      subject: options.subject,
      user_id: metadata.userId,
      order_id: metadata.orderId,
      error_message: result.error || 'Unknown error',
      error_code: result.statusCode?.toString(),
      retry_count: 3, // After max retries
      status: 'permanently_failed',
    });
  }

  return result;
}

/**
 * Gets failed emails that need retry
 *
 * @param supabaseClient - Supabase client with service role
 * @param maxRetries - Maximum retry count to fetch (default: 3)
 * @returns Array of failed emails
 */
export async function getFailedEmailsForRetry(
  supabaseClient: SupabaseClient,
  maxRetries: number = 3
): Promise<FailedEmailLog[]> {
  const { data, error } = await supabaseClient
    .from('failed_emails')
    .select('*')
    .eq('status', 'failed')
    .lt('retry_count', maxRetries)
    .order('created_at', { ascending: true })
    .limit(50); // Process in batches

  if (error) {
    console.error('Error fetching failed emails:', error);
    return [];
  }

  return (data as any[]) || [];
}

/**
 * Marks a failed email as resolved
 *
 * @param supabaseClient - Supabase client with service role
 * @param emailId - Failed email ID
 * @returns True if successful
 */
export async function markEmailAsResolved(
  supabaseClient: SupabaseClient,
  emailId: string
): Promise<boolean> {
  const { error } = await supabaseClient
    .from('failed_emails')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', emailId);

  if (error) {
    console.error('Error marking email as resolved:', error);
    return false;
  }

  return true;
}

/**
 * Increments retry count for a failed email
 *
 * @param supabaseClient - Supabase client with service role
 * @param emailId - Failed email ID
 * @returns True if successful
 */
export async function incrementRetryCount(
  supabaseClient: SupabaseClient,
  emailId: string
): Promise<boolean> {
  // First get the current retry count
  const { data, error: fetchError } = await supabaseClient
    .from('failed_emails')
    .select('retry_count')
    .eq('id', emailId)
    .single();

  if (fetchError || !data) {
    console.error('Error fetching email retry count:', fetchError);
    return false;
  }

  const newRetryCount = (data.retry_count || 0) + 1;
  const newStatus = newRetryCount >= 3 ? 'permanently_failed' : 'retrying';

  const { error: updateError } = await supabaseClient
    .from('failed_emails')
    .update({
      retry_count: newRetryCount,
      status: newStatus,
      last_retry_at: new Date().toISOString(),
    })
    .eq('id', emailId);

  if (updateError) {
    console.error('Error updating retry count:', updateError);
    return false;
  }

  return true;
}
