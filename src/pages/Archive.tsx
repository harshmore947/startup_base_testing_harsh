import { Link } from 'react-router-dom';
import { MessageCircle, TrendingUp, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FormattedDescription } from '@/lib/formatDescription';
import { useAuth } from '@/hooks/useAuth';
import { IdeaPurchaseUpsellModal } from '@/components/IdeaPurchaseUpsellModal';
import React, { useState, useRef, useEffect, useCallback } from 'react';

const PAGE_SIZE = 12;

type IdeaWithIndustry = {
  id: number;
  title: string;
  description: string;
  Date: string;
  industry?: string;
  tam_value?: string | null;
  tam_summary?: string | null;
  Revenue_potential?: string | null;
  revenue_potential_summary?: string | null;
};

export default function Archive() {
  const { user, isPremium } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithIndustry | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Get today's date in IST (shared across queries)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // Lightweight query to fetch unique industries for the filter bar
  const { data: uniqueIndustries = [] } = useQuery({
    queryKey: ['archive-industries'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ideas')
        .select('industry')
        .lt('Date', today)
        .not('industry', 'is', null);

      if (!data) return [];
      const industries = data
        .map((row: any) => row.industry as string)
        .filter(Boolean);
      return [...new Set(industries)].sort();
    },
    staleTime: 1000 * 60 * 30, // 30 min — industries rarely change
    gcTime: 1000 * 60 * 60,
  });

  // Infinite query for paginated ideas
  const {
    data,
    isLoading: ideasLoading,
    isError: ideasError,
    refetch: refetchIdeas,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['archive-ideas', selectedIndustry],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('ideas')
        .select('id, title, description, Date, industry, tam_value, Revenue_potential')
        .lt('Date', today)
        .order('Date', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (selectedIndustry) {
        query = query.eq('industry', selectedIndustry);
      }

      const { data } = await query;
      return (data ?? []) as IdeaWithIndustry[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned fewer items than PAGE_SIZE, there are no more pages
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });

  // Flatten all pages into a single array
  const filteredIdeas = data?.pages.flat() ?? [];

  // IntersectionObserver to trigger loading the next page
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px', // Start loading 200px before the sentinel is visible
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleObserver]);

  const handleBuyIdeaClick = (idea: IdeaWithIndustry) => {
    setSelectedIdea(idea);
    setShowUpsellModal(true);
  };

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  // Helper function to clean TAM value (extract readable part only)
  const formatTAM = (tamValue: string) => {
    if (!tamValue) return '';
    const cleaned = tamValue.split('|')[0].trim();
    return cleaned;
  };

  // Helper function to clean Revenue Potential (extract readable part only)
  const formatRevenue = (revenueValue: string) => {
    if (!revenueValue) return '';
    let cleaned = revenueValue.split('|')[0].trim();
    cleaned = cleaned.replace(/\s*ARR\s*(by\s*Year\s*\d+)?/gi, '').trim();
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">All Ideas</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Browse through our collection of vetted business opportunities
          </p>
          
          {uniqueIndustries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedIndustry === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndustry(null)}
              >
                All Industries
              </Button>
              {uniqueIndustries.map((industry) => (
                <Button
                  key={industry}
                  variant={selectedIndustry === industry ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </Button>
              ))}
            </div>
          )}
          
          {/* WhatsApp Channel CTA */}
          <div className="mt-6">
            <a
              href="https://whatsapp.com/channel/0029Vb7QNpWGU3BKBThZe21X"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                         text-white bg-[#25D366] hover:bg-[#20bd5a]
                         border border-[#25D366] hover:border-[#20bd5a]
                         rounded-full transition-all duration-300"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Get Daily Idea Updates on WhatsApp</span>
              <span className="sm:hidden">WhatsApp Updates</span>
            </a>
          </div>
        </div>

        {ideasError ? (
          <div className="text-center py-16 space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Failed to load ideas</h2>
            <p className="text-muted-foreground">Please check your connection and try again.</p>
            <Button onClick={() => refetchIdeas()}>Try Again</Button>
          </div>
        ) : ideasLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-pulse">
                <div className="h-6 bg-muted rounded mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-10 sm:h-8 bg-muted rounded w-full sm:w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIdeas.map((idea) => (
                <Card key={idea.id} className="bg-card border-border hover:border-primary/50 transition-all duration-200">
                   <CardHeader>
                     <div className="flex flex-col sm:flex-row sm:items-between sm:justify-between gap-2 mb-2">
                       <CardTitle className="text-base sm:text-lg">{idea.title}</CardTitle>
                       <div className="flex items-center gap-2 flex-wrap">
                         {idea.industry && (
                           <Badge
                             variant="secondary"
                             className="text-[10px] sm:text-xs"
                           >
                             {idea.industry}
                           </Badge>
                         )}
                         {idea.Date && (
                           <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted px-2 py-1 rounded whitespace-nowrap">
                             {formatDate(idea.Date)}
                           </span>
                         )}
                       </div>
                     </div>
                     <CardDescription className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
                       <FormattedDescription
                         description={idea.description}
                         truncate={true}
                         maxSections={2}
                       />
                     </CardDescription>
                   </CardHeader>

                  {/* Market Stats Section - Only show if TAM or Revenue data exists */}
                  {(idea.tam_value || idea.Revenue_potential) && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {idea.tam_value && (
                          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-3 transition-all hover:shadow-sm">
                            <div className="flex items-start gap-2.5">
                              <TrendingUp className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-blue-900/60 dark:text-blue-100/60 font-semibold uppercase tracking-wide mb-1">TAM</p>
                                <p className="text-sm font-bold text-blue-950 dark:text-blue-50">{formatTAM(idea.tam_value)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {idea.Revenue_potential && (
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg p-3 transition-all hover:shadow-sm">
                            <div className="flex items-start gap-2.5">
                              <DollarSign className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-emerald-900/60 dark:text-emerald-100/60 font-semibold uppercase tracking-wide mb-1">
                                  Revenue <span className="text-[9px] normal-case">(by year 3)</span>
                                </p>
                                <p className="text-sm font-bold text-emerald-950 dark:text-emerald-50">{formatRevenue(idea.Revenue_potential)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <CardContent>
                    {user ? (
                      isPremium ? (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full h-11 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Link to={`/idea-report/${idea.id}`}>
                            View Full Report
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBuyIdeaClick(idea)}
                          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all"
                        >
                          <span className="hidden sm:inline">Buy This Idea - ₹999</span>
                          <span className="sm:hidden">Buy - ₹999</span>
                        </Button>
                      )
                    ) : (
                      <Button
                        asChild
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        <Link to="/auth?mode=signup&redirect=/archive">
                          Sign Up to Build
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sentinel element for IntersectionObserver + loading indicator */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more ideas…</span>
                </div>
              )}
            </div>
          </>
        )}

        {!ideasLoading && filteredIdeas.length === 0 && (
          <div className="text-center py-16">
            <p className="body-text text-muted-foreground">No ideas found.</p>
          </div>
        )}
      </div>

      {/* Upsell Modal */}
      <IdeaPurchaseUpsellModal
        open={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        ideaTitle={selectedIdea?.title || ''}
      />
    </div>
  );
}
