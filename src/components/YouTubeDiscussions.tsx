import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Eye, Clock } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

interface YouTubeDiscussionsProps {
  youtubeData: any;
  analysisPath?: string;
}

function parseYouTubeData(data: any): any[] {
  if (!data) return [];
  
  try {
    let parsed = data;
    if (typeof data === 'string') {
      // Clean up common JSON formatting issues
      let cleanData = data.trim();
      if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
        cleanData = cleanData.slice(1, -1);
      }
      cleanData = cleanData.replace(/\\"/g, '"');
      parsed = JSON.parse(cleanData);
    }
    
    // Handle different YouTube data structures
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    if (parsed.videos && Array.isArray(parsed.videos)) {
      return parsed.videos;
    }
    
    if (parsed.youtube_videos && Array.isArray(parsed.youtube_videos)) {
      return parsed.youtube_videos;
    }
    
    if (parsed.youtube_results && Array.isArray(parsed.youtube_results)) {
      return parsed.youtube_results;
    }
    
    // If it's a single object, wrap it in an array
    if (typeof parsed === 'object' && parsed !== null) {
      return [parsed];
    }
    
    return [];
  } catch (error) {
    logger.error('Error parsing YouTube data:', error);
    return [];
  }
}

const YouTubeDiscussions = ({ youtubeData, analysisPath = '/community-full-analysis' }: YouTubeDiscussionsProps) => {
  const navigate = useNavigate();
  logger.log('YouTubeDiscussions - Raw data:', youtubeData);
  const videos = parseYouTubeData(youtubeData);
  logger.log('YouTubeDiscussions - Parsed videos:', videos);
  const displayVideos = videos.slice(0, 3);

  if (displayVideos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play size={18} className="text-red-500" />
            YouTube Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">No YouTube videos available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Play size={18} className="text-red-500" />
          YouTube Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayVideos.map((video, index) => (
          <div 
            key={index} 
            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
              const url = video.url || video.link;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <h4 className="font-medium text-sm text-foreground leading-tight mb-2">
              {video.title || 'YouTube Video'}
            </h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {video.channel && (
                  <span>{video.channel}</span>
                )}
                {video.views && (
                  <span className="flex items-center gap-1">
                    <Eye size={10} />
                    {typeof video.views === 'number' 
                      ? video.views > 1000000 
                        ? `${(video.views / 1000000).toFixed(1)}M` 
                        : video.views > 1000 
                          ? `${(video.views / 1000).toFixed(0)}K` 
                          : video.views.toString()
                      : video.views
                    }
                  </span>
                )}
              </div>
              {video.duration && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {video.duration}
                </span>
              )}
            </div>
          </div>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2" 
          onClick={() => navigate(analysisPath)}
        >
          See Full Analysis
        </Button>
      </CardContent>
    </Card>
  );
};

export default YouTubeDiscussions;