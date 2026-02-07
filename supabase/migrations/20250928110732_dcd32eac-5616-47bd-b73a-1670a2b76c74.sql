-- Create audit log table for sensitive operations
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs (only service role can view)
CREATE POLICY "Only service role can access audit logs"
ON public.audit_logs
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Enhance users table RLS policies to be more restrictive with email access
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create separate policies for different operations
CREATE POLICY "Users can view own basic profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access to users"
ON public.users
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add rate limiting table for form submissions
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  ip_address inet,
  attempts integer DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for rate limits
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to rate limits"
ON public.rate_limits
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action_type text,
  _ip_address inet DEFAULT NULL,
  _max_attempts integer DEFAULT 5,
  _window_minutes integer DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window timestamp with time zone;
  attempt_count integer;
  is_blocked boolean;
BEGIN
  current_window := now() - INTERVAL '1 minute' * _window_minutes;
  
  -- Check if user is currently blocked
  SELECT EXISTS(
    SELECT 1 FROM public.rate_limits 
    WHERE user_id = _user_id 
    AND action_type = _action_type 
    AND blocked_until > now()
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Count attempts in current window
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limits
  WHERE user_id = _user_id
  AND action_type = _action_type
  AND window_start > current_window;
  
  -- If too many attempts, block user
  IF attempt_count >= _max_attempts THEN
    INSERT INTO public.rate_limits (user_id, action_type, ip_address, attempts, blocked_until)
    VALUES (_user_id, _action_type, _ip_address, attempt_count + 1, now() + INTERVAL '1 hour');
    RETURN false;
  END IF;
  
  -- Log this attempt
  INSERT INTO public.rate_limits (user_id, action_type, ip_address)
  VALUES (_user_id, _action_type, _ip_address);
  
  RETURN true;
END;
$$;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _user_id uuid,
  _action text,
  _table_name text,
  _record_id text DEFAULT NULL,
  _old_data jsonb DEFAULT NULL,
  _new_data jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (_user_id, _action, _table_name, _record_id, _old_data, _new_data);
END;
$$;