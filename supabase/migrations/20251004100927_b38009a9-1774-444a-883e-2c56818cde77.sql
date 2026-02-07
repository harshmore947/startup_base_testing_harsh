-- ============================================================================
-- CRITICAL SECURITY FIX: Remove privilege escalation vulnerabilities
-- ============================================================================

-- Step 1: Drop vulnerable RLS policies on users table FIRST (before dropping column)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Step 2: Drop the vulnerable 'role' column from users table
-- This column is redundant with user_roles and creates security issues
ALTER TABLE public.users DROP COLUMN IF EXISTS role;

-- Step 3: Create new restrictive RLS policy for user updates
-- Users can ONLY update their email, nothing else (especially not subscription_status or razorpay_customer_id)
CREATE POLICY "Users can update own email only"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM users WHERE id = auth.uid())
  AND razorpay_customer_id IS NOT DISTINCT FROM (SELECT razorpay_customer_id FROM users WHERE id = auth.uid())
  AND subscription_end_date IS NOT DISTINCT FROM (SELECT subscription_end_date FROM users WHERE id = auth.uid())
);

-- Step 4: Create trigger function to prevent subscription_status manipulation
CREATE OR REPLACE FUNCTION public.prevent_subscription_manipulation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service role can modify subscription fields
  IF auth.jwt() ->> 'role' != 'service_role' THEN
    -- Prevent changes to subscription_status
    IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify subscription status directly';
    END IF;
    
    -- Prevent changes to razorpay_customer_id
    IF NEW.razorpay_customer_id IS DISTINCT FROM OLD.razorpay_customer_id THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify payment customer ID';
    END IF;
    
    -- Prevent changes to subscription_end_date
    IF NEW.subscription_end_date IS DISTINCT FROM OLD.subscription_end_date THEN
      RAISE EXCEPTION 'Unauthorized: Cannot modify subscription end date';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger to users table
DROP TRIGGER IF EXISTS enforce_subscription_protection ON public.users;
CREATE TRIGGER enforce_subscription_protection
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_manipulation();

-- Step 5: Remove rate limit visibility policy (data exposure risk)
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limits;

-- Step 6: Add audit trigger for user_roles changes (if not exists)
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_data,
      ip_address
    ) VALUES (
      NEW.user_id,
      'ROLE_GRANTED',
      'user_roles',
      NEW.id::text,
      to_jsonb(NEW),
      inet_client_addr()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      ip_address
    ) VALUES (
      OLD.user_id,
      'ROLE_REVOKED',
      'user_roles',
      OLD.id::text,
      to_jsonb(OLD),
      inet_client_addr()
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();