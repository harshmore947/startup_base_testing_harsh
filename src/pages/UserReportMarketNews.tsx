import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserReport } from '@/hooks/useUserReport';

export default function UserReportMarketNews() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: userReport, isLoading } = useUserReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Report Not Found</h1>
          <Button onClick={() => navigate(`/user-report/${id}`)}>Go Back</Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(`/user-report/${id}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Report
            </Button>
            <h1 className="text-xl font-semibold">Market News</h1>
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
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Market News</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {userReport.idea_title} - Latest market developments and trends
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Globe size={24} />
              All Market News Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newsData.length === 0 ? (
              <div className="p-6 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">No news articles available</p>
              </div>
            ) : (
              newsData.map((article, index) => (
                <div 
                  key={index} 
                  className="group p-6 bg-muted/30 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer border border-border/50"
                  onClick={() => {
                    if (article.link) {
                      window.open(article.link, '_blank');
                    }
                  }}
                >
                  <h4 className="font-semibold text-xl text-foreground group-hover:text-blue-600 leading-tight mb-3 transition-colors">
                    {article.title || 'Untitled Article'}
                    <span className="ml-2 text-base font-normal text-muted-foreground group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      (Click to read the full article)
                    </span>
                  </h4>
                  {article.summary && (
                    <p className="text-foreground text-base mb-4 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-foreground/70">
                    {article.source?.name && (
                      <span className="font-semibold text-base">{article.source.name}</span>
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}