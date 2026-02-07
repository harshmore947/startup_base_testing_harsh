-- Drop the old restrictive policy that prevents Newsletter updates
DROP POLICY IF EXISTS "Users can update own email only" ON public.users;

-- Create a new policy that allows Newsletter and email updates while protecting subscription fields
CREATE POLICY "Users can update own profile fields"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM users WHERE id = auth.uid())
  AND razorpay_customer_id IS NOT DISTINCT FROM (SELECT razorpay_customer_id FROM users WHERE id = auth.uid())
  AND subscription_end_date IS NOT DISTINCT FROM (SELECT subscription_end_date FROM users WHERE id = auth.uid())
);