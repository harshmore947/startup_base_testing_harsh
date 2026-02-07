-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join waitlist
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only service role can view waitlist data
CREATE POLICY "Service role can view waitlist"
  ON public.waitlist
  FOR SELECT
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create early access sessions table
CREATE TABLE public.early_access_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on early access sessions
ALTER TABLE public.early_access_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage sessions
CREATE POLICY "Service role manages sessions"
  ON public.early_access_sessions
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create indexes for token lookups
CREATE INDEX idx_early_access_token ON public.early_access_sessions(session_token);
CREATE INDEX idx_early_access_expires ON public.early_access_sessions(expires_at);