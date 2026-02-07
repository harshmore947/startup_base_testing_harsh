import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Clock, ExternalLink } from 'lucide-react';
import { logger } from '@/lib/logger';

interface YouTubeVideoData {
  title?: string;
  channel?: string;
  views?: number;
  duration?: string;
  thumbnail?: string;
  url?: string;
  link?: string;
  published?: string;
  description?: string;
}

interface InteractiveYouTubeDataProps {
  data: any;
}

function parseYouTubeData(data: any): YouTubeVideoData[] {
  if (!data) return [];
  
  try {
    let parsed = data;
    if (typeof data === 'string') {
      parsed = JSON.parse(data);
    }

    logger.log('YouTube data structure:', parsed);

    // Handle different structures
    if (parsed.videos && Array.isArray(parsed.videos)) {
      return parsed.videos.map(parseVideoObject);
    }
    
    if (parsed.data && Array.isArray(parsed.data)) {
      return parsed.data.map(parseVideoObject);
    }
    
    if (Array.isArray(parsed)) {
      return parsed.map(parseVideoObject);
    }
    
    // Single video object
    if (parsed.title || parsed.url || parsed.link) {
      return [parseVideoObject(parsed)];
    }
    
    // Handle nested structure
    if (parsed.youtube_data) {
      return parseYouTubeData(parsed.youtube_data);
    }
    
    return [];
  } catch (error) {
    logger.error('Failed to parse YouTube data:', error);
    logger.log('Raw YouTube data:', data);
    return [];
  }
}

function parseVideoObject(video: any): YouTubeVideoData {
  // Handle case where video data is a JSON string within the object
  if (typeof video === 'string') {
    try {
      video = JSON.parse(video);
    } catch {
      return { title: video };
    }
  }
  
  // Extract title and link from various possible structures
  let title = video.title || video.name || video.text || 'Untitled Video';
  let url = video.url || video.link || video.video_url || '';
  
  // If title contains JSON-like structure, try to parse it
  if (typeof title === 'string' && title.includes('"title"') && title.includes('"link"')) {
    try {
      const titleParsed = JSON.parse(title);
      title = titleParsed.title || title;
      url = titleParsed.link || url;
    } catch {
      // Keep original title if parsing fails
    }
  }
  
  return {
    title,
    url,
    channel: video.channel || video.channelTitle || video.author,
    views: video.views || video.viewCount,
    duration: video.duration,
    thumbnail: video.thumbnail || video.thumbnails?.default?.url,
    published: video.published || video.publishedAt,
    description: video.description,
    link: url // Ensure link is also set
  };
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }
  return views.toString();
}

export function InteractiveYouTubeData({ data }: InteractiveYouTubeDataProps) {
  const videos = parseYouTubeData(data);
  
  if (!videos.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No YouTube data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-32 h-20 bg-muted rounded-lg overflow-hidden relative">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {video.title || 'Untitled Video'}
                </h4>
                
                {video.channel && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {video.channel}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  {video.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViews(video.views)} views</span>
                    </div>
                  )}
                  
                  {video.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{video.duration}</span>
                    </div>
                  )}
                  
                   {video.published && (() => {
                     const date = new Date(video.published);
                     return !isNaN(date.getTime()) && (
                       <Badge variant="outline" className="text-xs">
                         {date.toLocaleDateString()}
                       </Badge>
                     );
                   })()}
                </div>
                
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {video.description}
                  </p>
                )}
                
                {(video.url || video.link) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle various URL formats
                      let cleanUrl = video.url || video.link || '';
                      logger.log('Opening YouTube URL:', cleanUrl);

                      // Handle YouTube URLs specifically
                      if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
                        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                      } else if (!cleanUrl.startsWith('http')) {
                        cleanUrl = `https://${cleanUrl}`;
                        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}