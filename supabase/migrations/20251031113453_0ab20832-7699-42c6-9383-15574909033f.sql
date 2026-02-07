-- Create function to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.auto_set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing TO 'published' and published_at is NULL
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to fire before update on blog_posts
CREATE TRIGGER blog_posts_auto_publish
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.auto_set_published_at();