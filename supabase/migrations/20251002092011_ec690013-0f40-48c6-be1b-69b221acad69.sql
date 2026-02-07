-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Update the rotate_idea_of_the_day function to use Date column with IST timezone
CREATE OR REPLACE FUNCTION public.rotate_idea_of_the_day()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_date_ist DATE;
BEGIN
  -- Get current date in IST timezone
  current_date_ist := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  
  -- First, set all ideas to false
  UPDATE public.ideas 
  SET is_idea_of_the_day = false;
  
  -- Then set today's idea (based on Date column) as the idea of the day
  UPDATE public.ideas 
  SET is_idea_of_the_day = true 
  WHERE "Date" = current_date_ist;
  
  -- Log the rotation
  INSERT INTO public.idea_rotation_log (rotated_at, status) 
  VALUES (NOW(), 'success');
  
  EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.idea_rotation_log (rotated_at, status, error_message) 
    VALUES (NOW(), 'error', SQLERRM);
    RAISE;
END;
$function$;

-- Schedule the cron job to run daily at 12:00 AM IST (6:30 PM UTC)
SELECT cron.schedule(
  'rotate-idea-daily-ist',
  '30 18 * * *', -- 6:30 PM UTC = 12:00 AM IST
  $$
  SELECT public.rotate_idea_of_the_day();
  $$
);