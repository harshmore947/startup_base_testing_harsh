-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to rotate idea of the day
CREATE OR REPLACE FUNCTION public.rotate_idea_of_the_day()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, set all current ideas of the day to false
  UPDATE public.ideas 
  SET is_idea_of_the_day = false 
  WHERE is_idea_of_the_day = true;
  
  -- Then set the most recent idea (that's not already idea of the day) as the new idea of the day
  UPDATE public.ideas 
  SET is_idea_of_the_day = true 
  WHERE id = (
    SELECT id 
    FROM public.ideas 
    WHERE is_idea_of_the_day = false OR is_idea_of_the_day IS NULL
    ORDER BY date_published DESC 
    LIMIT 1
  );
  
  -- Log the rotation
  INSERT INTO public.idea_rotation_log (rotated_at, status) 
  VALUES (NOW(), 'success');
  
  EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.idea_rotation_log (rotated_at, status, error_message) 
    VALUES (NOW(), 'error', SQLERRM);
    RAISE;
END;
$$;

-- Create logging table for idea rotations
CREATE TABLE IF NOT EXISTS public.idea_rotation_log (
  id BIGSERIAL PRIMARY KEY,
  rotated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on the log table
ALTER TABLE public.idea_rotation_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access logs
CREATE POLICY "Service role can access logs" 
ON public.idea_rotation_log 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Schedule the rotation to run daily at 11:59 PM
SELECT cron.schedule(
  'rotate-idea-of-the-day',
  '59 23 * * *',  -- 11:59 PM every day
  $$SELECT public.rotate_idea_of_the_day();$$
);

-- Create an index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_ideas_date_published_desc ON public.ideas (date_published DESC);

-- Create an index for idea of the day queries
CREATE INDEX IF NOT EXISTS idx_ideas_is_idea_of_the_day ON public.ideas (is_idea_of_the_day) WHERE is_idea_of_the_day = true;