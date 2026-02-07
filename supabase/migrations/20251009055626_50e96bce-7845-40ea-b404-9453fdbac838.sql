-- Create podcasts storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'podcasts',
  'podcasts',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
);

-- Add podcast columns to ideas table FIRST
ALTER TABLE public.ideas
ADD COLUMN podcast_url text,
ADD COLUMN podcast_duration integer, -- in seconds
ADD COLUMN podcast_file_size bigint; -- in bytes

-- NOW create RLS policies that reference the new columns
CREATE POLICY "Public can view podcasts for free ideas"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'podcasts' AND
  EXISTS (
    SELECT 1 FROM public.ideas
    WHERE ideas.podcast_url = storage.objects.name
    AND ideas.is_premium = false
  )
);

CREATE POLICY "Premium users can view all podcasts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'podcasts' AND
  auth.uid() IN (
    SELECT id FROM public.users WHERE subscription_status = 'premium'
  )
);

CREATE POLICY "Service role can upload podcasts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'podcasts' AND
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Create podcast analytics table
CREATE TABLE public.podcast_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id bigint REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- 'play', 'pause', 'complete', 'seek'
  progress_seconds integer, -- playback position
  session_id uuid NOT NULL, -- to track unique listening sessions
  created_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on podcast analytics
ALTER TABLE public.podcast_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for podcast analytics
CREATE POLICY "Service role can insert analytics"
ON public.podcast_analytics
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
ON public.podcast_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
ON public.podcast_analytics
FOR SELECT
USING (has_admin_role(auth.uid()));

-- Create indexes for faster analytics queries
CREATE INDEX idx_podcast_analytics_idea_id ON public.podcast_analytics(idea_id);
CREATE INDEX idx_podcast_analytics_created_at ON public.podcast_analytics(created_at);
CREATE INDEX idx_podcast_analytics_session_id ON public.podcast_analytics(session_id);