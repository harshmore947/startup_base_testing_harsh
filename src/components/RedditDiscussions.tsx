import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

interface RedditDiscussionsProps {
  redditData: any;
  analysisPath?: string;
}

function parseRedditData(data: any): any[] {
  logger.log('parseRedditData - Input:', data);
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
    
    // Handle different Reddit data structures - focusing on subreddit info
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // Handle subreddit-specific structures
    if (parsed.subreddits && Array.isArray(parsed.subreddits)) {
      return parsed.subreddits;
    }
    
    if (parsed.communities && Array.isArray(parsed.communities)) {
      return parsed.communities;
    }
    
    if (parsed.reddit_subreddits && Array.isArray(parsed.reddit_subreddits)) {
      return parsed.reddit_subreddits;
    }
    
    if (parsed.reddit_results && Array.isArray(parsed.reddit_results)) {
      return parsed.reddit_results;
    }
    
    // If it's a single subreddit object, wrap it in an array
    if (typeof parsed === 'object' && parsed !== null) {
      // Check if it looks like subreddit data
      if (parsed.display_name || parsed.subscribers || parsed.title) {
        return [parsed];
      }
    }
    
    return [];
  } catch (error) {
    logger.error('Error parsing Reddit data:', error);
    return [];
  }
}

const RedditDiscussions = ({ redditData, analysisPath = '/community-full-analysis' }: RedditDiscussionsProps) => {
  const navigate = useNavigate();
  logger.log('RedditDiscussions - Raw data:', redditData);
  const discussions = parseRedditData(redditData);
  logger.log('RedditDiscussions - Parsed discussions:', discussions);
  const displayDiscussions = discussions.slice(0, 3);

  if (displayDiscussions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-500" />
            Reddit Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">No Reddit discussions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare size={18} className="text-orange-500" />
          Reddit Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayDiscussions.map((discussion, index) => (
          <div 
            key={index} 
            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
              const url = discussion.url || discussion.link || discussion.permalink;
              if (url) {
                // Ensure Reddit URLs are properly formatted
                const fullUrl = url.startsWith('http') ? url : `https://reddit.com${url}`;
                window.open(fullUrl, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <h4 className="font-medium text-sm text-foreground leading-tight mb-2">
              r/{discussion.display_name || discussion.title || discussion.name || 'Unknown Subreddit'}
            </h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {discussion.subscribers && (
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {typeof discussion.subscribers === 'number' 
                      ? discussion.subscribers > 1000000 
                        ? `${(discussion.subscribers / 1000000).toFixed(1)}M members` 
                        : discussion.subscribers > 1000 
                          ? `${(discussion.subscribers / 1000).toFixed(0)}K members` 
                          : `${discussion.subscribers} members`
                      : `${discussion.subscribers} members`
                    }
                  </span>
                )}
                {discussion.description && (
                  <span className="truncate max-w-32">{discussion.description}</span>
                )}
              </div>
              {discussion.created && (
                <span>Created {new Date(discussion.created * 1000).getFullYear()}</span>
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

export default RedditDiscussions;