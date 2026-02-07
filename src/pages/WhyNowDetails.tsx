import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, ExternalLink, TrendingUp, Clock, Globe } from 'lucide-react';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

// Parse news data from the database
function parseNewsData(newsData: any): any[] {
  if (!newsData) return [];
  
  try {
    let parsed = newsData;
    if (typeof newsData === 'string') {
      parsed = JSON.parse(newsData);
    }
    
    // Handle the specific structure from the database
    if (parsed.news_results && Array.isArray(parsed.news_results)) {
      return parsed.news_results;
    }
    
    // Fallback for other structures
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

const WhyNowDetails = () => {
  const navigate = useNavigate();

  const { data: ideaOfTheDay, isLoading } = useIdeaOfTheDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Idea Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
              <ChevronLeft size={16} />
              Back to Idea
            </Button>
            <div>
              <h1 className="font-semibold text-xl">Why Now?</h1>
              <p className="text-sm text-muted-foreground">{ideaOfTheDay.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Why Now Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp size={24} />
                Why This Opportunity Exists Now
              </CardTitle>
              <CardDescription>
                The perfect storm of market conditions, technology advancement, and user behavior changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed text-base">
                  {ideaOfTheDay.why_now_full_analysis ? 
                    (typeof ideaOfTheDay.why_now_full_analysis === 'string' 
                      ? ideaOfTheDay.why_now_full_analysis 
                      : JSON.stringify(ideaOfTheDay.why_now_full_analysis)) 
                    : "The timing for this opportunity is driven by several converging factors in the market today."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Evidence Section would go here if trends data exists */}

          {/* News Articles Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={24} />
              <h2 className="text-2xl font-bold">Related News & Market Signals</h2>
            </div>
            
            {(() => {
              const newsArticles = parseNewsData(ideaOfTheDay.news_data);
              
              if (newsArticles.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No news articles available for this idea.</p>
                    </CardContent>
                  </Card>
                );
              }
              
              return (
                <div className="grid gap-6">
                  {newsArticles.map((article, index) => (
                    <Card key={article.id || index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar size={14} />
                              {article.date && 
                                new Date(article.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                              }
                              {article.source?.name && (
                                <>
                                  <span>•</span>
                                  <span>{article.source.name}</span>
                                </>
                              )}
                              <Badge variant="outline" className="text-xs">
                                News
                              </Badge>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-foreground leading-tight">
                              {article.title || 'Untitled Article'}
                            </h3>
                            
                            <p className="text-muted-foreground leading-relaxed">
                              {article.snippet || article.description || 'Click to read the full article from the source.'}
                            </p>
                          </div>
                          
                          {article.link && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-shrink-0"
                              onClick={() => window.open(article.link, '_blank')}
                            >
                              <ExternalLink size={14} />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Call to Action */}
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to Act on This Opportunity?</h3>
              <p className="text-muted-foreground mb-4">
                The market conditions are aligned. The technology is ready. The demand is growing.
              </p>
              <Button onClick={() => navigate('/')}>
                View Full Idea Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhyNowDetails;