-- Fix security warning: Add search_path to auto_set_published_at function
CREATE OR REPLACE FUNCTION public.auto_set_published_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status is changing TO 'published' and published_at is NULL
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;