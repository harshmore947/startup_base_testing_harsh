-- Drop all existing podcast-related policies
DROP POLICY IF EXISTS "Public can view podcasts for free ideas" ON storage.objects;
DROP POLICY IF EXISTS "Premium users can view all podcasts" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload podcasts" ON storage.objects;

-- Create new policies based on is_idea_of_the_day
CREATE POLICY "Public can access idea-of-the-day podcasts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'podcasts' 
  AND EXISTS (
    SELECT 1 FROM public.ideas
    WHERE (
      podcast_url LIKE '%' || name || '%'
      OR podcast_url_hindi LIKE '%' || name || '%'
    )
    AND is_idea_of_the_day = true
  )
);

CREATE POLICY "Premium users can access all podcasts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'podcasts'
  AND auth.uid() IN (
    SELECT id FROM public.users 
    WHERE subscription_status = 'premium'
  )
);

CREATE POLICY "Service role can upload podcasts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'podcasts'
  AND (auth.jwt() ->> 'role') = 'service_role'
);