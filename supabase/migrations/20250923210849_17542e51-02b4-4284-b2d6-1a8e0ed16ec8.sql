-- Delete users in correct order to avoid foreign key constraints
DELETE FROM public.users;
DELETE FROM auth.users;