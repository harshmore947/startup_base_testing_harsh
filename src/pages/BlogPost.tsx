import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Eye, Share2, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Post not found");
      
      // Increment view count
      await supabase.rpc('increment_blog_view', { post_id: data.id });
      
      return data;
    },
    retry: false,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.id],
    queryFn: async () => {
      if (!post?.related_post_ids || post.related_post_ids.length === 0) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, category, read_time_minutes')
        .in('id', post.related_post_ids)
        .eq('status', 'published')
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!post?.related_post_ids?.length,
  });

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.meta_description,
          url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-32 mb-8" />
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{post.title} | Startup Base</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.keywords && <meta name="keywords" content={post.keywords.join(', ')} />}
        <link rel="canonical" href={post.canonical_url || currentUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
        {post.og_image_url && <meta property="og:image" content={post.og_image_url} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <meta property="og:url" content={currentUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt || ''} />
        {post.og_image_url && <meta name="twitter:image" content={post.og_image_url} />}
        
        {/* Structured Data */}
        {post.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(post.structured_data)}
          </script>
        )}
      </Helmet>

      <article className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/blogs')}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.category && <Badge variant="secondary">{post.category}</Badge>}
              {post.is_featured && <Badge>Featured</Badge>}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{post.author_name}</span>
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </div>
              )}
              {post.read_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.read_time_minutes} min read
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} views
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map(related => (
                  <Link key={related.id} to={`/blog/${related.slug}`}>
                    <Card className="p-4 hover:shadow-lg transition-shadow h-full">
                      {related.category && (
                        <Badge variant="secondary" className="mb-2">
                          {related.category}
                        </Badge>
                      )}
                      <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {related.excerpt}
                        </p>
                      )}
                      {related.read_time_minutes && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {related.read_time_minutes} min read
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
