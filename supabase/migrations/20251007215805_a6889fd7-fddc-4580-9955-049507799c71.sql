-- Block anonymous access to users table to prevent email enumeration
CREATE POLICY "Block anonymous access to users"
ON public.users
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to waitlist to protect phone numbers and emails
CREATE POLICY "Block anonymous access to waitlist"
ON public.waitlist
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to early access sessions to protect session tokens
CREATE POLICY "Block anonymous access to sessions"
ON public.early_access_sessions
FOR SELECT
TO anon
USING (false);