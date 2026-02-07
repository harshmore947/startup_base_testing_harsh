-- Update the handle_new_user trigger function to remove role column reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$;