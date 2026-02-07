import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Users, Globe } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { InteractiveYouTubeData } from '@/components/InteractiveYouTubeData';
import { InteractiveRedditData } from '@/components/InteractiveRedditData';
import { useNavigate, useParams } from 'react-router-dom';
import { useIdeaById } from '@/hooks/useIdeaById';

export default function CommunityFullAnalysisDynamic() {
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
                  {idea.title} - Community interest and validation signals analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <AnalysisContent 
          content={idea.community_signals_full_analysis} 
          score={idea.community_signal_score}
        />

        {/* Community Discussions Tabs */}
        {(idea.youtube_data || idea.reddit_data) && (
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
              <Tabs defaultValue={idea.youtube_data ? "youtube" : "reddit"}>
                <TabsList className={`grid w-full ${idea.youtube_data && idea.reddit_data ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {idea.youtube_data && (
                    <TabsTrigger value="youtube" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      YouTube Discussions
                    </TabsTrigger>
                  )}
                  {idea.reddit_data && (
                    <TabsTrigger value="reddit" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reddit Discussions
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {idea.youtube_data && (
                  <TabsContent value="youtube" className="mt-4">
                    <InteractiveYouTubeData data={idea.youtube_data} />
                  </TabsContent>
                )}
                
                {idea.reddit_data && (
                  <TabsContent value="reddit" className="mt-4">
                    <InteractiveRedditData data={idea.reddit_data} />
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