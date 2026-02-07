-- Drop existing RLS policies that reference is_premium
DROP POLICY IF EXISTS "Public can view free ideas" ON public.ideas;
DROP POLICY IF EXISTS "Premium users can view all ideas" ON public.ideas;
DROP POLICY IF EXISTS "Service role full access" ON public.ideas;

-- Drop the is_premium column
ALTER TABLE public.ideas DROP COLUMN IF EXISTS is_premium;

-- Create new date-based RLS policies
CREATE POLICY "Public can view idea of the day"
ON public.ideas
FOR SELECT
USING (is_idea_of_the_day = true);

CREATE POLICY "Premium users can view past ideas"
ON public.ideas
FOR SELECT
TO authenticated
USING (
  "Date" <= CURRENT_DATE 
  AND auth.uid() IN (
    SELECT id FROM public.users 
    WHERE subscription_status = 'premium'
  )
);

CREATE POLICY "Service role full access"
ON public.ideas
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);