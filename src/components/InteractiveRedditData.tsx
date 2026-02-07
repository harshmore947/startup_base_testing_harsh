import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, MessageCircle, ExternalLink, Users } from 'lucide-react';
import { logger } from '@/lib/logger';

interface RedditPostData {
  title?: string;
  subreddit?: string;
  author?: string;
  upvotes?: number;
  comments?: number;
  url?: string;
  reddit_url?: string;
  link?: string;
  created?: string;
  selftext?: string;
  score?: number;
  // Add subreddit-specific fields
  subscribers?: number;
  display_name?: string;
  public_description?: string;
  accounts_active?: number;
}

interface InteractiveRedditDataProps {
  data: any;
}

function parseRedditData(data: any): RedditPostData[] {
  if (!data) return [];
  
  try {
    let parsed = data;
    if (typeof data === 'string') {
      // Clean up common JSON formatting issues
      let cleanedData = data.trim();
      
      // Remove any trailing invalid characters after valid JSON
      let braceCount = 0;
      let bracketCount = 0;
      let lastValidIndex = -1;
      
      for (let i = 0; i < cleanedData.length; i++) {
        const char = cleanedData[i];
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
        
        // If we have balanced braces and brackets, mark this as a potentially valid end
        if (braceCount === 0 && bracketCount === 0 && (char === '}' || char === ']')) {
          lastValidIndex = i;
        }
      }
      
      // If we found a valid end point, truncate there
      if (lastValidIndex > -1 && lastValidIndex < cleanedData.length - 1) {
        cleanedData = cleanedData.substring(0, lastValidIndex + 1);
      }
      
      // Handle case where data starts with array but no brackets
      if (!cleanedData.startsWith('[') && cleanedData.includes('{"url":')) {
        cleanedData = '[' + cleanedData + ']';
      }
      
      parsed = JSON.parse(cleanedData);
    }

    logger.log('Reddit data structure:', parsed);

    // Handle different structures - direct array of subreddits/posts
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // Handle nested structures
    if (parsed.posts && Array.isArray(parsed.posts)) {
      return parsed.posts;
    }
    
    if (parsed.data && Array.isArray(parsed.data)) {
      return parsed.data;
    }
    
    if (parsed.reddit_posts && Array.isArray(parsed.reddit_posts)) {
      return parsed.reddit_posts;
    }
    
    // Single post/subreddit object
    if (parsed.title || parsed.subreddit || parsed.display_name) {
      return [parsed];
    }
    
    // Handle nested structure
    if (parsed.reddit_data) {
      return parseRedditData(parsed.reddit_data);
    }
    
    return [];
  } catch (error) {
    logger.error('Failed to parse Reddit data:', error);
    logger.log('Raw Reddit data:', data);
    return [];
  }
}

function formatScore(score: number): string {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
}

function getScoreColor(score: number): string {
  if (score >= 1000) return 'text-green-600';
  if (score >= 100) return 'text-green-500';
  if (score >= 10) return 'text-yellow-600';
  return 'text-muted-foreground';
}

export function InteractiveRedditData({ data }: InteractiveRedditDataProps) {
  const posts = parseRedditData(data);
  
  if (!posts.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No Reddit data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        // Check if this is subreddit data or post data
        const isSubreddit = post.display_name && post.subscribers !== undefined;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title || 'Untitled'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {isSubreddit ? (
                        <Badge variant="outline" className="text-xs">
                          r/{post.display_name}
                        </Badge>
                      ) : (
                        <>
                          {post.subreddit && (
                            <Badge variant="outline" className="text-xs">
                              r/{post.subreddit}
                            </Badge>
                          )}
                          {post.author && (
                            <span className="text-xs text-muted-foreground">
                              by u/{post.author}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Score/Subscribers */}
                  {isSubreddit ? (
                    post.subscribers && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {post.subscribers >= 1000000 
                            ? `${(post.subscribers / 1000000).toFixed(1)}M` 
                            : post.subscribers >= 1000 
                              ? `${Math.floor(post.subscribers / 1000)}K` 
                              : post.subscribers.toString()
                          }
                        </span>
                      </div>
                    )
                  ) : (
                    (post.upvotes || post.score) && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <ArrowUp className={`h-4 w-4 ${getScoreColor(post.upvotes || post.score || 0)}`} />
                        <span className={`text-sm font-medium ${getScoreColor(post.upvotes || post.score || 0)}`}>
                          {formatScore(post.upvotes || post.score || 0)}
                        </span>
                      </div>
                    )
                  )}
                </div>
                
                {/* Content Preview */}
                {(post.public_description || post.selftext) && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {post.public_description || post.selftext}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {!isSubreddit && post.comments && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.comments} comments</span>
                      </div>
                    )}
                    
                    {post.created && (
                      <span>
                        {new Date(post.created).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {(post.url || post.reddit_url || post.link) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        const redditUrl = post.url || post.reddit_url || post.link || '';
                        logger.log('Opening Reddit URL:', redditUrl);

                        // Handle Reddit URLs
                        let cleanUrl = redditUrl;
                        if (!cleanUrl.startsWith('http')) {
                          // Add reddit.com prefix for partial URLs
                          if (cleanUrl.startsWith('/')) {
                            cleanUrl = `https://www.reddit.com${cleanUrl}`;
                          } else {
                            cleanUrl = `https://www.reddit.com/${cleanUrl}`;
                          }
                        }
                        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}