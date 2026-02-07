-- Drop the restrictive premium-only policy
DROP POLICY IF EXISTS "Premium users can view past ideas" ON ideas;

-- Create new policy allowing all authenticated users to view past ideas
CREATE POLICY "Authenticated users can view past ideas"
ON ideas
FOR SELECT
TO authenticated
USING ("Date" <= CURRENT_DATE);