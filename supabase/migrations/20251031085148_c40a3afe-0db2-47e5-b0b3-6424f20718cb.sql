-- Create enum for post status
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_description TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_name TEXT DEFAULT 'Startup Base Team',
  author_id UUID,
  
  -- SEO & Discovery
  keywords TEXT[],
  category TEXT,
  tags TEXT[],
  canonical_url TEXT,
  featured_image_url TEXT,
  og_image_url TEXT,
  read_time_minutes INTEGER,
  
  -- Status & Publishing
  status post_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  
  -- LLM & Structured Data
  structured_data JSONB,
  faq_data JSONB,
  related_post_ids UUID[],
  external_links JSONB,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  estimated_word_count INTEGER,
  language TEXT DEFAULT 'en',
  
  -- Constraints
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT reasonable_read_time CHECK (read_time_minutes >= 1 AND read_time_minutes <= 120)
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN(tags);
CREATE INDEX idx_blog_posts_keywords ON public.blog_posts USING GIN(keywords);
CREATE INDEX idx_blog_posts_is_featured ON public.blog_posts(is_featured) WHERE is_featured = true;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_posts_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_view(post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
$$;

-- RLS Policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published blogs"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- Admins can manage all posts
CREATE POLICY "Admins can manage all blogs"
  ON public.blog_posts FOR ALL
  USING (has_admin_role(auth.uid()))
  WITH CHECK (has_admin_role(auth.uid()));

-- Service role can do everything
CREATE POLICY "Service role full access to blogs"
  ON public.blog_posts FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' 
    AND has_admin_role(auth.uid())
  );

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'blog-images' 
    AND has_admin_role(auth.uid())
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images' 
    AND has_admin_role(auth.uid())
  );