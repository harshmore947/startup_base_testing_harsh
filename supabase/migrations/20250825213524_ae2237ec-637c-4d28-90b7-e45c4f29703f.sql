-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.rotate_idea_of_the_day()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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