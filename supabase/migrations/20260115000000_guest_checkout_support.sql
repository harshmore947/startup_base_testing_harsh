-- Guest Checkout Support Migration
-- This migration enables guest checkout functionality where users can pay before creating an account
-- After successful payment, users receive an email to set up their account

-- ============================================================
-- PART 1: Modify Orders Table to Support Guest Orders
-- ============================================================

-- Allow NULL user_id for guest orders (before account creation)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add index for billing_email lookups (important for guest orders)
CREATE INDEX IF NOT EXISTS idx_orders_billing_email ON public.orders(billing_email);

-- Add comment to document guest checkout support
COMMENT ON COLUMN public.orders.user_id IS 'User ID - can be NULL for guest orders before account creation';
COMMENT ON COLUMN public.orders.billing_email IS 'Billing email from payment gateway - used to create account for guest orders';

-- Drop existing RLS policies for orders (we'll recreate them)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

-- Recreate RLS policies to handle both authenticated and guest orders
-- Policy 1: Users can view their own orders (by user_id)
CREATE POLICY "Users can view own orders by user_id"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can view orders by their email (handles guest orders converted to accounts)
CREATE POLICY "Users can view own orders by email"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    billing_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy 3: Service role can insert orders (both guest and authenticated)
CREATE POLICY "Service role can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (false);  -- Blocked for users, only service role can insert

-- Policy 4: Service role can update orders
CREATE POLICY "Service role can update orders"
  ON public.orders
  FOR UPDATE
  USING (false);  -- Blocked for users, only service role can update

-- ============================================================
-- PART 2: Extend Users Table for Account Setup Tracking
-- ============================================================

-- Add account_status to track account setup state
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('pending_setup', 'active', 'suspended'));

-- Add index for account_status lookups
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);

-- Add comment for documentation
COMMENT ON COLUMN public.users.account_status IS 'Account status: pending_setup (guest checkout, password not set), active (fully set up), suspended (account disabled)';

-- ============================================================
-- PART 3: Create Account Setup Tokens Table
-- ============================================================

-- Table to store one-time setup tokens for guest checkout users
CREATE TABLE IF NOT EXISTS public.account_setup_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,  -- Cryptographically secure token (2x UUID = 72 chars)

  -- Token metadata
  email text NOT NULL,  -- Email this token was sent to (for verification)
  used boolean DEFAULT false NOT NULL,  -- Whether token has been used
  expires_at timestamptz NOT NULL,  -- Token expiration (48 hours from creation)

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  used_at timestamptz  -- When token was used
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_setup_tokens_token ON public.account_setup_tokens(token) WHERE NOT used;
CREATE INDEX IF NOT EXISTS idx_setup_tokens_user_id ON public.account_setup_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_setup_tokens_expires_at ON public.account_setup_tokens(expires_at) WHERE NOT used;

-- RLS Policies for account_setup_tokens
ALTER TABLE public.account_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Users cannot view tokens directly (only through Edge Functions)
CREATE POLICY "Block direct token access"
  ON public.account_setup_tokens
  FOR ALL
  USING (false);

-- Add comments for documentation
COMMENT ON TABLE public.account_setup_tokens IS 'One-time tokens for guest checkout users to set up their accounts';
COMMENT ON COLUMN public.account_setup_tokens.token IS 'Secure one-time token (72 characters, expires in 48 hours)';
COMMENT ON COLUMN public.account_setup_tokens.used IS 'Whether token has been consumed (one-time use only)';

-- ============================================================
-- PART 4: Create Failed Emails Table (for monitoring)
-- ============================================================

-- Table to track failed email deliveries for retry and monitoring
CREATE TABLE IF NOT EXISTS public.failed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email details
  recipient_email text NOT NULL,
  email_type text NOT NULL,  -- 'welcome', 'reminder', 'password_reset', etc.
  subject text NOT NULL,

  -- Related entities
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- Can be NULL for pre-creation failures
  order_id text,  -- Reference to order if applicable

  -- Failure details
  error_message text NOT NULL,
  error_code text,
  retry_count integer DEFAULT 0 NOT NULL,

  -- Status
  status text DEFAULT 'failed' NOT NULL CHECK (status IN ('failed', 'retrying', 'permanently_failed', 'resolved')),

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  last_retry_at timestamptz,
  resolved_at timestamptz
);

-- Create indexes for monitoring and retry logic
CREATE INDEX IF NOT EXISTS idx_failed_emails_status ON public.failed_emails(status);
CREATE INDEX IF NOT EXISTS idx_failed_emails_email_type ON public.failed_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_failed_emails_created_at ON public.failed_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_emails_retry ON public.failed_emails(status, retry_count)
  WHERE status IN ('failed', 'retrying');

-- RLS Policies for failed_emails (admin access only)
ALTER TABLE public.failed_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can access failed emails (for admin dashboard)
CREATE POLICY "Service role only for failed emails"
  ON public.failed_emails
  FOR ALL
  USING (false);

-- Add comments for documentation
COMMENT ON TABLE public.failed_emails IS 'Tracks failed email deliveries for monitoring and retry logic';
COMMENT ON COLUMN public.failed_emails.retry_count IS 'Number of retry attempts (max 3 before permanently_failed)';
COMMENT ON COLUMN public.failed_emails.status IS 'Status: failed (needs retry), retrying (in progress), permanently_failed (gave up), resolved (manually sent)';

-- ============================================================
-- PART 5: Create Cleanup Function for Expired Tokens
-- ============================================================

-- Function to clean up expired and used tokens (run via cron or manual trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_setup_tokens()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete tokens that are either:
  -- 1. Expired (past expires_at timestamp)
  -- 2. Used AND older than 7 days (keep used tokens for 7 days for audit)
  DELETE FROM public.account_setup_tokens
  WHERE
    expires_at < now() OR
    (used = true AND created_at < now() - interval '7 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.cleanup_expired_setup_tokens IS 'Cleans up expired and old used tokens. Returns count of deleted tokens. Run periodically via cron or Edge Function.';

-- ============================================================
-- PART 6: Add Helper Function to Link Guest Order to User
-- ============================================================

-- Function to link a guest order to a newly created user account
-- This is called after account creation to associate the order with the user
CREATE OR REPLACE FUNCTION public.link_guest_order_to_user(
  p_order_id text,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update the order to link it to the user
  -- Only update if user_id is NULL (guest order) and billing_email matches
  UPDATE public.orders
  SET
    user_id = p_user_id,
    updated_at = now()
  WHERE
    order_id = p_order_id AND
    user_id IS NULL AND
    billing_email = (SELECT email FROM auth.users WHERE id = p_user_id);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.link_guest_order_to_user IS 'Links a guest order to a user account after account creation. Returns true if successful.';

-- ============================================================
-- END OF MIGRATION
-- ============================================================

-- Summary of changes:
-- 1. Orders table now supports NULL user_id for guest checkout
-- 2. Updated RLS policies to handle both authenticated and guest orders
-- 3. Added account_status column to users table
-- 4. Created account_setup_tokens table for secure account setup
-- 5. Created failed_emails table for email delivery monitoring
-- 6. Added cleanup function for expired tokens
-- 7. Added helper function to link guest orders to users
