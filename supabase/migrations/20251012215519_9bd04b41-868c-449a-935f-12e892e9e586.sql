-- Fix RLS policies for security vulnerabilities

-- 1. Fix users table RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

-- Users can only view their own profile (already exists but ensuring it's correct)
-- The existing "Users can view own basic profile" policy should handle this

-- 2. Fix waitlist table RLS policies  
-- Drop public SELECT policy if it exists
DROP POLICY IF EXISTS "Public can view waitlist" ON public.waitlist;

-- The existing policies "Only admins can view waitlist" and "Service role can view waitlist" are correct
-- The "Anyone can join waitlist" INSERT policy is also correct and should remain

-- 3. Fix podcast_analytics table RLS policies
-- Drop public SELECT policy if it exists
DROP POLICY IF EXISTS "Public can view analytics" ON public.podcast_analytics;
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.podcast_analytics;

-- The existing policies are already correct:
-- "Users can view their own analytics" and "Admins can view all analytics"

-- 4. Fix audit_logs table RLS policies
-- Drop any public access policies
DROP POLICY IF EXISTS "Public can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can view audit logs" ON public.audit_logs;

-- The existing "Only service role can access audit logs" policy is correct

-- 5. Fix rate_limits table RLS policies
-- Drop any public access policies  
DROP POLICY IF EXISTS "Public can view rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can view rate limits" ON public.rate_limits;

-- The existing "Service role full access to rate limits" policy is correct

-- 6. Fix early_access_sessions table RLS policies
-- Drop any public access policies
DROP POLICY IF EXISTS "Public can view sessions" ON public.early_access_sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.early_access_sessions;

-- The existing "Service role manages sessions" policy is correct