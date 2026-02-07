import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, TrendingUp, Clock, Users } from 'lucide-react';
import { AdminGate } from '@/components/AdminGate';

export default function AdminPodcastAnalytics() {
  // Fetch podcast analytics summary
  const { data: podcastStats } = useQuery({
    queryKey: ['podcast-analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_analytics')
        .select('*');
      
      if (error) throw error;
      
      // Calculate statistics
      const totalPlays = data?.filter(a => a.event_type === 'play').length || 0;
      const totalCompletions = data?.filter(a => a.event_type === 'complete').length || 0;
      const completionRate = totalPlays > 0 ? ((totalCompletions / totalPlays) * 100).toFixed(1) : '0';
      const uniqueSessions = new Set(data?.map(a => a.session_id)).size;
      
      return {
        totalPlays,
        totalCompletions,
        completionRate,
        uniqueSessions,
      };
    },
  });

  // Fetch top podcasts by plays
  const { data: topPodcasts } = useQuery({
    queryKey: ['top-podcasts'],
    queryFn: async () => {
      const { data: analytics, error: analyticsError } = await supabase
        .from('podcast_analytics')
        .select('idea_id, event_type')
        .eq('event_type', 'play');
      
      if (analyticsError) throw analyticsError;
      
      // Count plays per idea
      const playsByIdea: Record<number, number> = {};
      analytics?.forEach(a => {
        playsByIdea[a.idea_id] = (playsByIdea[a.idea_id] || 0) + 1;
      });
      
      // Get top 5 ideas
      const topIdeaIds = Object.entries(playsByIdea)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => parseInt(id));
      
      if (topIdeaIds.length === 0) return [];
      
      // Fetch idea details
      const { data: ideas, error: ideasError } = await supabase
        .from('ideas')
        .select('id, title, podcast_duration')
        .in('id', topIdeaIds);
      
      if (ideasError) throw ideasError;
      
      return ideas?.map(idea => ({
        ...idea,
        plays: playsByIdea[idea.id],
      }));
    },
  });

  // Fetch recent listening activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-podcast-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_analytics')
        .select('*, ideas!inner(title)')
        .eq('event_type', 'play')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Headphones className="h-8 w-8" />
            Podcast Analytics
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Total Plays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcastStats?.totalPlays || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcastStats?.completionRate || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Unique Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcastStats?.uniqueSessions || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcastStats?.totalCompletions || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Podcasts */}
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Podcasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPodcasts?.map((podcast, index) => (
                    <div key={podcast.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{podcast.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(podcast.podcast_duration)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{podcast.plays}</p>
                        <p className="text-xs text-muted-foreground">plays</p>
                      </div>
                    </div>
                  ))}
                  {(!topPodcasts || topPodcasts.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No podcast data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Listening Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.ideas?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">Play</Badge>
                    </div>
                  ))}
                  {(!recentActivity || recentActivity.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
