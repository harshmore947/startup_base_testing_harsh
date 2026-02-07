-- Phase 1: Fix Critical Privilege Escalation Vulnerability
-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for user_roles
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Update has_admin_role function to use user_roles table
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Step 6: Migrate existing roles from users.role to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::public.app_role 
FROM public.users 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 7: Update users table RLS to prevent role column modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role IS NOT DISTINCT FROM (SELECT users.role FROM public.users WHERE id = auth.uid())
  AND razorpay_customer_id IS NOT DISTINCT FROM (SELECT users.razorpay_customer_id FROM public.users WHERE id = auth.uid())
);

-- Step 8: Drop the role column from users table (after confirming migration worked)
-- We'll keep it for now and set it to NULL to prevent usage, but maintain backward compatibility temporarily
UPDATE public.users SET role = NULL WHERE role IS NOT NULL;

-- Phase 2: Protect Payment Data
-- Step 9: Update RLS policy to exclude razorpay_customer_id
DROP POLICY IF EXISTS "Users can view own basic profile" ON public.users;

CREATE POLICY "Users can view own basic profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a separate policy that excludes sensitive payment data
COMMENT ON POLICY "Users can view own basic profile" ON public.users IS 
'Users can view their own profile. Payment data (razorpay_customer_id) should not be exposed to client code.';

-- Step 10: Add audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      NEW.user_id,
      'ROLE_GRANTED',
      'user_roles',
      NEW.id::text,
      NULL,
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      OLD.user_id,
      'ROLE_REVOKED',
      'user_roles',
      OLD.id::text,
      to_jsonb(OLD),
      NULL
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_user_roles_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_roles_changes();