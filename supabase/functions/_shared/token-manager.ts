/**
 * Token Manager for Account Setup Tokens
 * Handles generation, verification, and management of secure one-time setup tokens
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SetupToken {
  id: string;
  user_id: string;
  token: string;
  email: string;
  used: boolean;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

/**
 * Generates a cryptographically secure token (72 characters)
 * Uses 2x UUID v4 concatenated for extra entropy
 */
export function generateSecureToken(): string {
  const uuid1 = crypto.randomUUID().replace(/-/g, '');
  const uuid2 = crypto.randomUUID().replace(/-/g, '');
  return `${uuid1}${uuid2}`;
}

/**
 * Creates a new setup token for a user
 * Token expires in 48 hours by default
 *
 * @param supabaseClient - Supabase client with service role
 * @param userId - User ID to create token for
 * @param email - Email address (for verification)
 * @param expiryHours - Hours until token expires (default: 48)
 * @returns The generated token string
 */
export async function createSetupToken(
  supabaseClient: SupabaseClient,
  userId: string,
  email: string,
  expiryHours: number = 48
): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  const { error } = await supabaseClient
    .from('account_setup_tokens')
    .insert({
      user_id: userId,
      token: token,
      email: email,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

  if (error) {
    console.error('Error creating setup token:', error);
    throw new Error(`Failed to create setup token: ${error.message}`);
  }

  return token;
}

/**
 * Verifies a setup token and returns token data if valid
 * Checks:
 * - Token exists
 * - Not expired
 * - Not already used
 *
 * @param supabaseClient - Supabase client with service role
 * @param token - The token string to verify
 * @returns Token data if valid, null if invalid
 */
export async function verifySetupToken(
  supabaseClient: SupabaseClient,
  token: string
): Promise<SetupToken | null> {
  const { data, error } = await supabaseClient
    .from('account_setup_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return data as SetupToken;
}

/**
 * Marks a token as used (consumes it)
 *
 * @param supabaseClient - Supabase client with service role
 * @param token - The token string to mark as used
 * @returns True if successful, false otherwise
 */
export async function markTokenAsUsed(
  supabaseClient: SupabaseClient,
  token: string
): Promise<boolean> {
  const { error } = await supabaseClient
    .from('account_setup_tokens')
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (error) {
    console.error('Error marking token as used:', error);
    return false;
  }

  return true;
}

/**
 * Cleans up expired and old used tokens
 * Deletes:
 * - Expired tokens (past expires_at)
 * - Used tokens older than 7 days
 *
 * @param supabaseClient - Supabase client with service role
 * @returns Number of tokens deleted
 */
export async function cleanupExpiredTokens(
  supabaseClient: SupabaseClient
): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Delete expired tokens
  const { error: expiredError, count: expiredCount } = await supabaseClient
    .from('account_setup_tokens')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString());

  // Delete old used tokens
  const { error: usedError, count: usedCount } = await supabaseClient
    .from('account_setup_tokens')
    .delete({ count: 'exact' })
    .eq('used', true)
    .lt('created_at', sevenDaysAgo.toISOString());

  if (expiredError || usedError) {
    console.error('Error cleaning up tokens:', expiredError || usedError);
    return 0;
  }

  return (expiredCount || 0) + (usedCount || 0);
}

/**
 * Gets all pending (unused, not expired) tokens for a user
 * Useful for checking if a user already has a pending setup token
 *
 * @param supabaseClient - Supabase client with service role
 * @param userId - User ID to check
 * @returns Array of pending tokens
 */
export async function getPendingTokensForUser(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<SetupToken[]> {
  const { data, error } = await supabaseClient
    .from('account_setup_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching pending tokens:', error);
    return [];
  }

  return (data as SetupToken[]) || [];
}

/**
 * Invalidates all pending tokens for a user
 * Useful when user completes setup or account is compromised
 *
 * @param supabaseClient - Supabase client with service role
 * @param userId - User ID to invalidate tokens for
 * @returns Number of tokens invalidated
 */
export async function invalidateUserTokens(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<number> {
  const { error, count } = await supabaseClient
    .from('account_setup_tokens')
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('used', false);

  if (error) {
    console.error('Error invalidating tokens:', error);
    return 0;
  }

  return count || 0;
}
