-- Create user profiles for existing auth users who don't have profiles yet
INSERT INTO public.users (id, email, subscription_status) 
SELECT au.id, au.email, 'free' as subscription_status
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
  AND au.email_confirmed_at IS NOT NULL;