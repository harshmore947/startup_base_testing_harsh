import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Sparkles, Globe } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserReport } from '@/hooks/useUserReport';

export default function UserReportWhyNowFullAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: userReport, isLoading } = useUserReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-text text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Analysis Not Found</h1>
          <p className="body-text text-muted-foreground mb-6">
            The analysis you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/user-report/${id}`)}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Report
            </Button>
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Why Now Analysis</h1>
                <p className="text-sm text-muted-foreground">{userReport.idea_title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <AnalysisContent 
          content={userReport.why_now_full_analysis} 
          score={userReport.why_now_score}
        />

        {/* News Articles */}
        {userReport.news_data && (
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

                const newsData = parseNewsData(userReport.news_data);
                
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
      </main>
    </div>
  );
}