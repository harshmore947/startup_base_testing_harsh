-- Phase 1: Fix Critical RLS Policy Issues

-- Step 1: Remove ineffective blocking policies
DROP POLICY IF EXISTS "Block anonymous access to users" ON public.users;
DROP POLICY IF EXISTS "Block anonymous access to waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Block anonymous access to sessions" ON public.early_access_sessions;

-- Step 2: Strengthen service role policy on user_reports
DROP POLICY IF EXISTS "Allow service_role to update reports" ON public.user_reports;

CREATE POLICY "Service role can update reports"
ON public.user_reports FOR UPDATE
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Phase 2: Fix Rate Limiting Infrastructure

-- Step 3: Make rate_limits.user_id nullable to support IP-based rate limiting
ALTER TABLE public.rate_limits 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Update foreign key to handle cascades properly
ALTER TABLE public.rate_limits
DROP CONSTRAINT IF EXISTS rate_limits_user_id_fkey;

ALTER TABLE public.rate_limits
ADD CONSTRAINT rate_limits_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Phase 3: Verify Subscription Protection

-- Step 5: Ensure trigger is active for subscription manipulation prevention
DROP TRIGGER IF EXISTS prevent_subscription_changes ON public.users;

CREATE TRIGGER prevent_subscription_changes
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_manipulation();

-- Add index for better performance on rate_limits queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action_type, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action 
ON public.rate_limits(ip_address, action_type, window_start) 
WHERE ip_address IS NOT NULL;