-- Allow public to view all ideas (for Archive page with Buy This Idea buttons)
-- This enables showing idea cards with purchase CTAs to non-authenticated users
-- Full report access is still protected by PremiumGate at the application level

CREATE POLICY "Public can view all ideas"
ON public.ideas
FOR SELECT
USING (true);

-- Note: This replaces the restrictive "Public can view idea of the day" and
-- "Premium users can view past ideas" policies with a single permissive read policy.
-- The monetization happens at the application level through PremiumGate components.
