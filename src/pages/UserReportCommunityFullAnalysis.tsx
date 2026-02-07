import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Users, Globe } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { InteractiveYouTubeData } from '@/components/InteractiveYouTubeData';
import { InteractiveRedditData } from '@/components/InteractiveRedditData';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserReport } from '@/hooks/useUserReport';

export default function UserReportCommunityFullAnalysis() {
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
              <Users size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Community Validation Analysis</h1>
                <p className="text-sm text-muted-foreground">{userReport.idea_title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <AnalysisContent 
          content={userReport.community_signal_full_analysis} 
          score={userReport.community_signal_score}
        />

        {/* Community Discussions Tabs */}
        {(userReport.youtube_data || userReport.reddit_data) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-primary" />
                Community Discussions
              </CardTitle>
              <p className="text-muted-foreground">
                Explore YouTube videos and Reddit discussions about this topic
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={userReport.youtube_data ? "youtube" : "reddit"}>
                <TabsList className={`grid w-full ${userReport.youtube_data && userReport.reddit_data ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {userReport.youtube_data && (
                    <TabsTrigger value="youtube" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      YouTube Discussions
                    </TabsTrigger>
                  )}
                  {userReport.reddit_data && (
                    <TabsTrigger value="reddit" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reddit Discussions
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {userReport.youtube_data && (
                  <TabsContent value="youtube" className="mt-4">
                    <InteractiveYouTubeData data={userReport.youtube_data} />
                  </TabsContent>
                )}
                
                {userReport.reddit_data && (
                  <TabsContent value="reddit" className="mt-4">
                    <InteractiveRedditData data={userReport.reddit_data} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}