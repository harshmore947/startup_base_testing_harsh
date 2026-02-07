-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status, role)
  VALUES (NEW.id, NEW.email, 'free', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policy to allow service role (trigger) to insert users
CREATE POLICY "Service role can insert users" ON public.users
FOR INSERT WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Manually create the missing profile for the current user
INSERT INTO public.users (id, email, subscription_status, role)
VALUES ('2920fa49-9761-498c-bb00-44a47606d837', 'manav.a@autozenai.net', 'free', 'user')
ON CONFLICT (id) DO NOTHING;