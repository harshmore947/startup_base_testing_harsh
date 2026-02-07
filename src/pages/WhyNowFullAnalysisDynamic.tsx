import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Sparkles, Globe } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate, useParams } from 'react-router-dom';
import { useIdeaById } from '@/hooks/useIdeaById';

export default function WhyNowFullAnalysisDynamic() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: idea, isLoading } = useIdeaById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Analysis Not Found</h1>
          <Button onClick={() => navigate(`/idea-report/${id}`)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(`/idea-report/${id}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Idea Report
            </Button>
            <h1 className="text-xl font-semibold">Why Now Analysis</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Main Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Why Now</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {idea.title} - Understanding why this is the perfect moment to launch
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <AnalysisContent 
          content={idea.why_now_full_analysis} 
          score={idea.timing_score}
        />

        {/* News Articles */}
        {idea.news_data && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Globe size={24} />
                Related Market News
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const parseNewsData = (newsData: any): any[] => {
                  if (!newsData) return [];
                  
                  try {
                    let parsed = newsData;
                    if (typeof newsData === 'string') {
                      parsed = JSON.parse(newsData);
                    }
                    
                    if (Array.isArray(parsed)) {
                      return parsed;
                    }
                    
                    if (parsed && typeof parsed === 'object') {
                      if (parsed.articles && Array.isArray(parsed.articles)) {
                        return parsed.articles;
                      }
                      if (parsed.data && Array.isArray(parsed.data)) {
                        return parsed.data;
                      }
                      return [parsed];
                    }
                    
                    return [];
                  } catch (error) {
                    console.error('Error parsing news data:', error);
                    return [];
                  }
                };

                const newsData = parseNewsData(idea.news_data);
                
                if (newsData.length === 0) {
                  return (
                    <div className="p-6 bg-muted/30 rounded-lg text-center">
                      <p className="text-muted-foreground">No news articles available</p>
                    </div>
                  );
                }
                
                return newsData.map((article, index) => (
                  <div 
                    key={index} 
                    className="group p-4 bg-muted/30 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer border border-border/50"
                    onClick={() => {
                      if (article.link) {
                        window.open(article.link, '_blank');
                      }
                    }}
                  >
                    <h4 className="font-semibold text-lg text-foreground group-hover:text-blue-600 leading-tight mb-2 transition-colors">
                      {article.title || 'Untitled Article'}
                      <span className="ml-2 text-sm font-normal text-muted-foreground group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        (Click to read the full article)
                      </span>
                    </h4>
                    {article.summary && (
                      <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {article.source?.name && (
                        <span className="font-medium">{article.source.name}</span>
                      )}
                      <span className={!article.source?.name ? 'ml-auto' : ''}>
                        {article.date && 
                          new Date(article.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })
                        }
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}