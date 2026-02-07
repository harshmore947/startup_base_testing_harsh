import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users, Globe } from 'lucide-react';
import { InteractiveYouTubeData } from '@/components/InteractiveYouTubeData';
import { InteractiveRedditData } from '@/components/InteractiveRedditData';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate } from 'react-router-dom';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

export default function CommunityFullAnalysis() {
  const navigate = useNavigate();
  const { data: ideaOfTheDay, isLoading } = useIdeaOfTheDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Analysis Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Community Validation</h1>
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
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Community Validation</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {ideaOfTheDay.title} - Analysis of community signals and validation data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analysis Content */}
        <div className="mb-8">
          <AnalysisContent 
            content={ideaOfTheDay.community_signals_full_analysis} 
            score={ideaOfTheDay.community_signal_score}
          />
        </div>

        {/* Community Discussions Tabs */}
        {(ideaOfTheDay.youtube_data || ideaOfTheDay.reddit_data) && (
          <Card>
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
              <Tabs defaultValue={ideaOfTheDay.youtube_data ? "youtube" : "reddit"}>
                <TabsList className={`grid w-full ${ideaOfTheDay.youtube_data && ideaOfTheDay.reddit_data ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {ideaOfTheDay.youtube_data && (
                    <TabsTrigger value="youtube" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      YouTube Discussions
                    </TabsTrigger>
                  )}
                  {ideaOfTheDay.reddit_data && (
                    <TabsTrigger value="reddit" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reddit Discussions
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {ideaOfTheDay.youtube_data && (
                  <TabsContent value="youtube" className="mt-4">
                    <InteractiveYouTubeData data={ideaOfTheDay.youtube_data} />
                  </TabsContent>
                )}
                
                {ideaOfTheDay.reddit_data && (
                  <TabsContent value="reddit" className="mt-4">
                    <InteractiveRedditData data={ideaOfTheDay.reddit_data} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}