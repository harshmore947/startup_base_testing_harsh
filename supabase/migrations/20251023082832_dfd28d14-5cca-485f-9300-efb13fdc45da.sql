-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

-- Create new policy that works for all users (both anonymous and authenticated)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist
FOR INSERT
TO public, authenticated
WITH CHECK (true);