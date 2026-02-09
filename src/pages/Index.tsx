import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/TrendChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, ChevronDown, Download, Rocket, Sparkles, TrendingUp, Users, Target, Lightbulb, BarChart3, IndianRupee, CheckCircle, Zap, Building2, Calendar, MapPin, Star, Globe, Share, AlertCircle, Clock, FileText, Share2, ArrowRight, MessageCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { InteractiveYouTubeData } from '@/components/InteractiveYouTubeData';
import { InteractiveRedditData } from '@/components/InteractiveRedditData';
import { InteractiveAmazonData } from '@/components/InteractiveAmazonData';
import YouTubeDiscussions from '@/components/YouTubeDiscussions';
import { FormattedDescription } from '@/lib/formatDescription';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { Navigate, useNavigate } from 'react-router-dom';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { MarketMetricsShowcase } from '@/components/MarketMetricsShowcase';
import { BuildQuickLinks } from '@/components/BuildQuickLinks';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/useAuth';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

// Analysis Section Component for expandable content
interface AnalysisSectionProps {
  title: string;
  icon: any;
  description: string;
  summaryContent: string;
  fullContent: any;
  linkUrl: string;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ 
  title, 
  icon: Icon, 
  description, 
  summaryContent, 
  fullContent,
  linkUrl 
}) => {
  const [showFull, setShowFull] = useState(false);
  const navigate = useNavigate();

  const renderContent = (content: any) => {
    if (!content) return null;
    
    // Handle different content types
    if (typeof content === 'string') {
      return <p className="text-muted-foreground leading-relaxed text-justify">{content}</p>;
    }
    
    if (typeof content === 'object') {
      try {
        // Try to extract meaningful content from object
        const contentStr = JSON.stringify(content, null, 2);
        if (contentStr === '{}' || contentStr === '[]') {
          return <p className="text-muted-foreground">No detailed analysis available</p>;
        }
        
        // If it's a structured object, try to display it nicely
        if (content.summary || content.content || content.description) {
          const text = content.summary || content.content || content.description;
          return <p className="text-muted-foreground leading-relaxed text-justify">{text}</p>;
        }
        
        // If it's an array, display as list
        if (Array.isArray(content)) {
          return (
            <div className="space-y-2">
              {content.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </p>
                </div>
              ))}
            </div>
          );
        }
        
        // For other objects, display key-value pairs
        return (
          <div className="space-y-2">
            {Object.entries(content).map(([key, value], index) => (
              <div key={index} className="border-l-2 border-primary/20 pl-4">
                <h4 className="font-medium text-foreground capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </p>
              </div>
            ))}
          </div>
        );
      } catch (error) {
        return <p className="text-muted-foreground">Unable to display content</p>;
      }
    }
    
    return <p className="text-muted-foreground leading-relaxed">{String(content)}</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={20} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showFull ? (
            <div className="space-y-4">
              {renderContent(fullContent)}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFull(false)}
                  className="mr-2"
                >
                  Show Summary
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(linkUrl)}
                >
                  Full Analysis Page →
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-justify">
                {summaryContent}
              </p>
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFull(true)}
                  className="mr-2"
                >
                  Show Full Analysis
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(linkUrl)}
                >
                  Detailed Page →
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Parse and format text content that might be JSON or plain text
function parseContent(content: string | null | any): string[] {
  if (!content) return [];
  
  // Handle if content is already an object
  if (typeof content === 'object' && content !== null) {
    if (Array.isArray(content)) {
      return content.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle objects with type/description structure
          if (item.type && item.description) {
            return `${item.type}: ${item.description}`;
          }
          // Handle objects with step/action structure
          if (item.step || item.action) {
            return item.step || item.action;
          }
          // Handle target audience objects
          if (item.segment || item.demographic) {
            return `${item.segment || item.demographic}: ${item.description || item.details || ''}`.trim();
          }
          // Convert other objects to readable format
          return Object.entries(item)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
            .join(' | ');
        }
        return String(item);
      }).filter(item => item.trim() && item !== 'undefined');
    } else {
      // Single object - convert to readable format
      if (content.primary || content.secondary) {
        const results = [];
        if (content.primary) {
          if (typeof content.primary === 'object') {
            const primaryText = Object.entries(content.primary)
              .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
              .join(' | ');
            results.push(`Primary: ${primaryText}`);
          } else {
            results.push(`Primary: ${String(content.primary)}`);
          }
        }
        if (content.secondary) {
          if (typeof content.secondary === 'object') {
            const secondaryText = Object.entries(content.secondary)
              .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
              .join(' | ');
            results.push(`Secondary: ${secondaryText}`);
          } else {
            results.push(`Secondary: ${String(content.secondary)}`);
          }
        }
        return results;
      }
      
      return Object.entries(content)
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${String(value)}`)
        .filter(item => item.trim() && !item.includes('undefined'));
    }
  }
  
  // Handle string content
  let stringContent = String(content);
  
  try {
    // Fix common JSON formatting issues for revenue model data
    if (stringContent.includes('"type":') && stringContent.includes('"description":')) {
      // Add missing array brackets if needed
      if (!stringContent.trim().startsWith('[') && !stringContent.trim().startsWith('{')) {
        stringContent = '[' + stringContent + ']';
      } else if (stringContent.trim().startsWith('{') && !stringContent.trim().startsWith('[{')) {
        // Single object that should be in an array
        stringContent = '[' + stringContent + ']';
      }
      
      // Fix missing commas between objects
      stringContent = stringContent.replace(/}\s*{/g, '}, {');
      
      // Fix any trailing commas before closing bracket
      stringContent = stringContent.replace(/,\s*\]/g, ']');
      
      // Handle incomplete JSON at the end
      if (stringContent.endsWith(', {"type"') || stringContent.endsWith(',"description"')) {
        // Remove incomplete trailing objects
        stringContent = stringContent.replace(/, \{"type".*$/, '');
        stringContent = stringContent.replace(/,"description".*$/, '');
        if (!stringContent.endsWith(']')) {
          stringContent += '}]';
        }
      }
    }
    
    // Try to parse as JSON first
    const parsed = JSON.parse(stringContent);
    
    // Recursively handle parsed JSON
    return parseContent(parsed);
  } catch (error) {
    logger.log('JSON parsing failed:', error, 'Content:', stringContent);
    // If not JSON, split by common delimiters and clean up
    const items = stringContent
      .split(/\n|\.(?=\s[A-Z])|;\s*|\|\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 10 && !item.includes('[object Object]')); // Filter out object references
    
    return items.length > 0 ? items : [stringContent.trim()].filter(item => item && !item.includes('[object Object]'));
  }
}

// Parse news data from the database - using the same function name for consistency
function parseNewsData(newsData: any): any[] {
  if (!newsData) return [];
  
  try {
    let parsed = newsData;
    if (typeof newsData === 'string') {
      parsed = JSON.parse(newsData);
    }
    
    // Handle the specific structure from the database
    if (parsed.news_results && Array.isArray(parsed.news_results)) {
      return parsed.news_results;
    }
    
    // Fallback for other structures
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

// Parse community signals data
function parseCommunitySignals(communityData: any): any[] {
  if (!communityData) return [];
  
  try {
    if (typeof communityData === 'string') {
      const parsed = JSON.parse(communityData);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return Array.isArray(communityData) ? communityData : [communityData];
  } catch {
    return [];
  }
}

// Extract a compelling hook from the description (first 2-3 sentences)
const extractHook = (description: string): string => {
  if (!description) return '';
  
  // Remove markdown formatting
  const cleaned = description.replace(/[*_#`]/g, '');
  
  // Get first 2-3 sentences (up to 250 chars)
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  let hook = '';
  
  for (let i = 0; i < Math.min(2, sentences.length); i++) {
    hook += sentences[i];
    if (hook.length > 200) break;
  }
  
  return hook.trim() || cleaned.substring(0, 250) + '...';
};

// Generate tags for an idea based on scoring
const getIdeaTags = (idea: any): Array<{label: string, variant: any}> => {
  const tags: Array<{label: string, variant: any}> = [];
  
  if (idea.timing_score >= 7) {
    tags.push({ label: 'Perfect Timing', variant: 'default' });
  }
  
  
  if (idea.trends_score >= 7) {
    tags.push({ label: 'Hot Trend', variant: 'secondary' });
  }
  
  if ((idea as any)?.overall_opportunity_score >= 8) {
    tags.push({ label: 'Massive Market', variant: 'outline' });
  }
  
  if (idea.community_signal_score >= 7) {
    tags.push({ label: 'Community Validated', variant: 'outline' });
  }
  
  return tags;
};

// Flip Score Card Component with 3D animations
const FlipScoreCard = ({ title, value, icon: Icon, description, color, analysisPath }: {
  title: string;
  value: number | null;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  analysisPath: string;
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  const safeValue = typeof value === 'number' ? Math.max(0, Math.min(10, value)) : null;
  
  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'N/A';
    if (score >= 8) return 'Exceptional';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Moderate';
    return 'Needs Work';
  };

  const cardNavigate = useNavigate();
  const handleCardClick = () => {
    if (isFlipped) {
      cardNavigate(analysisPath);
    }
  };

  return (
    <div style={{ isolation: 'isolate' }}>
      <div 
        className="flip-card cursor-pointer h-32 sm:h-28 md:h-24" 
        onClick={handleCardClick}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onTouchStart={() => setIsFlipped(!isFlipped)}
        style={{ zIndex: isFlipped ? 999 : 1 }}
      >
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <Card className={`flip-card-front ${color} border-l-4 h-full`}>
          <CardContent className="p-3 sm:p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Icon size={18} className="text-foreground sm:w-4 sm:h-4" />
              <div className="text-right">
                <div className="text-2xl sm:text-xl font-bold text-foreground leading-tight">
                  {safeValue ?? '--'}
                  <span className="text-sm sm:text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base mb-1 leading-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{getScoreLabel(safeValue)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="flip-card-back h-full bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-base mb-2 text-primary leading-tight">{title} Analysis</h3>
              <p className="text-sm text-muted-foreground leading-snug flex-1">{description}</p>
            </div>
            <Button 
              size="sm" 
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-xs h-7"
            >
              View Full Analysis →
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

// Business Fit Component
interface BusinessFitProps {
  executionPlan: string | null;
  revenueModel: string | null;
}

function BusinessFit({ executionPlan, revenueModel }: BusinessFitProps) {
  // Simple heuristic to determine business metrics
  const executionComplexity = executionPlan ? Math.min(10, Math.floor(executionPlan.length / 100)) : 5;
  const revenueStreams = revenueModel ? parseContent(revenueModel).length : 1;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 size={18} />
          Business Fit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Revenue Potential</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <IndianRupee 
                  key={i} 
                  size={14} 
                  className={i < Math.min(3, revenueStreams) ? 'text-green-500' : 'text-muted-foreground/30'}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Execution Difficulty</span>
            <div className="text-sm font-medium">
              {executionComplexity}/10
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Go-to-Market</span>
            <Badge variant="outline" className="text-xs">Moderate</Badge>
          </div>
        </div>
        <div className="pt-3 border-t">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">Right for You?</p>
            <Badge variant="secondary" className="text-xs">
              {executionComplexity <= 6 ? 'Good Match' : 'Complex Project'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Community Sidebar Component
function CommunitySidebar({ communityData }: { communityData: any }) {
  const communities = parseCommunitySignals(communityData);
  
  if (!communities.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users size={18} />
          Community Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {communities.slice(0, 3).map((community, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Users size={12} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">r/{community.display_name || community.title}</p>
                {community.subscribers && (
                  <p className="text-xs text-muted-foreground">{(community.subscribers / 1000).toFixed(0)}k</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {communities.length > 3 && (
          <p className="text-xs text-center text-muted-foreground">
            +{communities.length - 3} more communities
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasAccess, isLoading: isCheckingAccess } = useEarlyAccess();
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);

  logger.log('Index component starting to render');

  // Handle OAuth redirect fallback - if user just logged in and there's a stored redirect path
  useEffect(() => {
    if (user) {
      const ALLOWED_REDIRECTS = ['/pricing', '/archive', '/dashboard', '/idea-report'];

      // Check sessionStorage first
      const sessionRedirect = sessionStorage.getItem('auth_redirect_path');
      if (sessionRedirect) {
        sessionStorage.removeItem('auth_redirect_path');
        if (sessionRedirect.startsWith('/') && ALLOWED_REDIRECTS.some(allowed => sessionRedirect.startsWith(allowed))) {
          logger.log('[Index] Found sessionStorage redirect, navigating to:', sessionRedirect);
          localStorage.removeItem('auth_redirect_path'); // Clean up
          navigate(sessionRedirect, { replace: true });
          return;
        }
      }

      // Fallback to localStorage
      const localRedirect = localStorage.getItem('auth_redirect_path');
      if (localRedirect) {
        localStorage.removeItem('auth_redirect_path');
        if (localRedirect.startsWith('/') && ALLOWED_REDIRECTS.some(allowed => localRedirect.startsWith(allowed))) {
          logger.log('[Index] Found localStorage redirect, navigating to:', localRedirect);
          navigate(localRedirect, { replace: true });
          return;
        }
      }
    }
  }, [user, navigate]);

  const handleShareIdea = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      logger.error('Failed to copy link: ', err);
    }
  };
  
  const getIdeaDifficultyColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';  
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Fetch the idea of the day
  const { data: ideaOfTheDay, isLoading, isError, error, refetch } = useIdeaOfTheDay();

  logger.log('Query state - isLoading:', isLoading, 'isError:', isError, 'data:', ideaOfTheDay);

  // Debug Reddit data
  if (ideaOfTheDay) {
    logger.log('Index - reddit_data available:', ideaOfTheDay.reddit_data);
  }

  // Show a single loader while checking access or fetching idea data
  if (isCheckingAccess || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!hasAccess) {
    return <Navigate to="/waitlist" replace />;
  }

  // Show error state with retry button when fetching fails
  if (isError) {
    logger.error('Failed to fetch idea of the day:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            We couldn't load the data. Please check your internet connection and try again.
          </p>
          <Button onClick={() => refetch()} size="lg">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    logger.log('No idea of the day found, rendering no data state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" >No Idea of the Day</h1>
          <p className="text-muted-foreground">Check back later for fresh opportunities!</p>
        </div>
      </div>
    );
  }

  logger.log('Rendering main content with idea:', ideaOfTheDay.title);

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Introduction */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Welcome to Startup Base 👋
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Every day, we deliver a <strong className="text-foreground">fully researched startup idea</strong> with market analysis, 
            revenue potential, and competitor insights. Explore the opportunity below, then use our 
            <strong className="text-foreground"> AI-powered tools</strong> to build it into reality.
          </p>
        </div>
      </div>

      {/* Secondary Header - Idea of the Day */}
      <div className="bg-gray-50 border-b border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* Centered Title & Date */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">🎄 Idea of the Day</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* RIGHT SECTION - Share Button Only */}
            <div className="absolute right-6">
              <button
                onClick={handleShareIdea}
                className="inline-flex items-center justify-center bg-white text-gray-700 p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                title="Share This Idea"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between">
            {/* Centered Title & Date */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">🎄 Idea of the Day</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShareIdea}
              className="inline-flex items-center justify-center bg-white text-gray-700 p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
              title="Share This Idea"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Full-Width Hero Section - Truly Centered */}
        <div className="flex flex-col items-center text-center space-y-6 py-8 max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-center">
            {ideaOfTheDay.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {getIdeaTags(ideaOfTheDay).map((tag, index) => (
              <Badge key={index} variant={tag.variant} className="text-xs sm:text-sm">
                {tag.label}
              </Badge>
            ))}
            {(ideaOfTheDay as any).industry && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Building2 className="w-3 h-3 mr-1" />
                {(ideaOfTheDay as any).industry}
              </Badge>
            )}
            {ideaOfTheDay.type && (
              <Badge className={`${getIdeaDifficultyColor(ideaOfTheDay.type)} px-3 py-1 text-sm font-medium capitalize`}>
                {ideaOfTheDay.type} Difficulty
              </Badge>
            )}
          </div>

          {/* Short hook - first 2-3 sentences */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl text-center leading-relaxed">
            {extractHook(ideaOfTheDay.description)}
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/build-this-idea')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Build This Idea
            </Button>
            {ideaOfTheDay.podcast_url && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowPodcastPlayer(true)}
              >
                🎧 Listen
              </Button>
            )}
          </div>
          
          {/* WhatsApp Channel CTA */}
          <a 
            href="https://whatsapp.com/channel/0029Vb7QNpWGU3BKBThZe21X"
            target="_blank"
            rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
                           text-white bg-[#25D366] hover:bg-[#20bd5a] 
                           border border-[#25D366] hover:border-[#20bd5a] 
                           rounded-full transition-all duration-300"
              >
                <MessageCircle size={18} />
            Join our WhatsApp Channel
          </a>
        </div>

        {/* Visual Separator with scroll indicator */}
        <div className="flex flex-col items-center justify-center py-8 space-y-2 mb-12">
          <p className="text-sm text-muted-foreground">Scroll to explore detailed analysis</p>
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>

        {/* Grid Layout for Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">

            {/* Detailed Analysis Section - Below fold */}
            <div className="space-y-6 sm:space-y-8">
              {/* Market Metrics */}
              {((ideaOfTheDay as any).tam_value || (ideaOfTheDay as any).Revenue_potential) && (
                <MarketMetricsShowcase
                  tamValue={(ideaOfTheDay as any).tam_value}
                  tamSummary={(ideaOfTheDay as any).tam_summary}
                  revenuePotential={(ideaOfTheDay as any).Revenue_potential}
                  revenueSummary={(ideaOfTheDay as any).revenue_potential_summary}
                />
              )}

              {/* Full Description */}
              <Card>
                <CardHeader>
                  <CardTitle>The Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none [&_p]:text-justify [&_li]:text-justify">
                    <FormattedDescription description={ideaOfTheDay.description} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Data & Chart */}
            {(ideaOfTheDay as any).trend_data_1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Market Trends
                  </CardTitle>
                  <CardDescription>
                    Historical trend data and market signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendChart data={(ideaOfTheDay as any).trend_data_1} trendQuery={(ideaOfTheDay as any).trend_query_1} height={300} />
                </CardContent>
              </Card>
            )}

            {/* Why Now Section */}
            {(ideaOfTheDay as any).why_now_reasoning_summary && (
              <Card className="border-l-4 border-l-orange-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-orange-50/30 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      <Sparkles size={24} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>Why Now?</span>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">Perfect Timing</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {(ideaOfTheDay as any).why_now_reasoning_summary}
                    </p>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/why-now-full-analysis')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 group"
                      >
                        See Full Analysis
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Opportunity */}
            {(ideaOfTheDay as any).overall_oppurtunity_reasoning_summary && (
              <Card className="border-l-4 border-l-indigo-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-indigo-50/30 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                      <Target size={24} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>Market Opportunity</span>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">High Potential</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {(ideaOfTheDay as any).overall_oppurtunity_reasoning_summary}
                    </p>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/opportunity-full-analysis')}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 group"
                      >
                        See Full Analysis
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trends & Signals */}
            {(ideaOfTheDay as any).trends_reasoning_summary && (
              <Card className="border-l-4 border-l-blue-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50/30 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <BarChart3 size={24} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>Trends & Signals</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Trending</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {(ideaOfTheDay as any).trends_reasoning_summary}
                    </p>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/trends-full-analysis')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 group"
                      >
                        See Full Analysis
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Signals */}
            {(ideaOfTheDay as any).community_signal_reasoning_summary && (
              <Card className="border-l-4 border-l-purple-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-purple-50/30 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      <Users size={24} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>Community Validation</span>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">Community Driven</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {(ideaOfTheDay as any).community_signal_reasoning_summary}
                    </p>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/community-full-analysis')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 group"
                      >
                        See Full Analysis
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feasibility */}
            {(ideaOfTheDay as any).feasibility_reasoning_summary && (
              <Card className="border-l-4 border-l-green-500 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-green-50/30 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <CheckCircle size={24} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>Feasibility Analysis</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Validated</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      {(ideaOfTheDay as any).feasibility_reasoning_summary}
                    </p>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/feasibility-full-analysis')}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 group"
                      >
                        See Full Analysis
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}




          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-24 lg:h-fit">
            {/* Score Cards */}
            <Card className="shadow-sm" style={{ overflow: 'visible' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4" style={{ overflow: 'visible' }}>
              <FlipScoreCard 
                title="Opportunity" 
                value={(ideaOfTheDay as any)?.overall_opportunity_score}
                icon={TrendingUp}
                description="Market size, demand potential, and revenue opportunity assessment"
                color="border-l-blue-500"
                analysisPath="/opportunity-full-analysis"
              />
              <FlipScoreCard 
                title="Feasibility" 
                value={(ideaOfTheDay as any).feasibilty_score}
                icon={CheckCircle}
                description="Technical and business execution complexity"
                color="border-l-green-500"
                analysisPath="/feasibility-full-analysis"
              />
              <FlipScoreCard 
                title="Timing" 
                value={ideaOfTheDay.timing_score}
                icon={Sparkles}
                description="Market readiness and current timing advantages"
                color="border-l-purple-500"
                analysisPath="/why-now-full-analysis"
              />
              {ideaOfTheDay.community_signal_score && (
                <FlipScoreCard 
                  title="Community" 
                  value={ideaOfTheDay.community_signal_score}
                  icon={Users}
                  description="Social validation and community interest signals"
                  color="border-l-orange-500"
                  analysisPath="/community-full-analysis"
                />
              )}
              </CardContent>
            </Card>

            {/* Amazon Product Analysis - Only for Product Analysis Done */}
            {(ideaOfTheDay as any)?.IdeaType === 'Product Analysis Done' && (ideaOfTheDay as any)?.Amazon_data && (
              <InteractiveAmazonData amazonData={(ideaOfTheDay as any).Amazon_data} />
            )}

            {/* Community Signals */}
            {(ideaOfTheDay as any)?.community_signals_data && (
              <CommunitySidebar communityData={(ideaOfTheDay as any)?.community_signals_data} />
            )}

            {/* News Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe size={18} />
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const newsData = parseNewsData(ideaOfTheDay.news_data);
                  const displayArticles = newsData.slice(0, 3);
                  
                  if (displayArticles.length === 0) {
                    return (
                      <div className="p-3 bg-muted/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">No news articles available</p>
                      </div>
                    );
                  }
                  
                  return displayArticles.map((article, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (article.link) {
                          window.open(article.link, '_blank');
                        }
                      }}
                    >
                      <h4 className="font-medium text-sm text-foreground leading-tight mb-1">
                        {article.title || 'Untitled Article'}
                      </h4>
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                       {article.source?.name && <span>{article.source.name}</span>}
                        <span>
                          {article.date && 
                            new Date(article.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          }
                        </span>
                      </div>
                    </div>
                  ));
                })()}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/why-now-details')}>
                  View All News
                </Button>
              </CardContent>
            </Card>

            {/* YouTube Discussions */}
            <YouTubeDiscussions youtubeData={ideaOfTheDay.youtube_data} />

            {/* Build Quick Links */}
            <BuildQuickLinks />

            {/* Revenue Plan */}
            {ideaOfTheDay.revenue_model && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee size={18} />
                    Revenue Plan
                  </CardTitle>
                  <CardDescription>Complete monetization strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    // Enhanced parsing for revenue model that handles nested JSON
                    const parseRevenueModel = (content: any): string[] => {
                      if (!content) return [];
                      
                      try {
                        let parsed = content;
                        if (typeof content === 'string') {
                          parsed = JSON.parse(content);
                        }
                        
                        // Check if it has a summary field
                        if (parsed && typeof parsed === 'object' && parsed.summary) {
                          if (typeof parsed.summary === 'string') {
                            return [parsed.summary];
                          }
                          if (Array.isArray(parsed.summary)) {
                            return parsed.summary.map(item => typeof item === 'string' ? item : JSON.stringify(item));
                          }
                        }
                        
                        // Fallback to regular parsing
                        return parseContent(content);
                      } catch (error) {
                        return parseContent(content);
                      }
                    };
                    
                    const revenueData = parseRevenueModel(ideaOfTheDay.revenue_model);
                    const displayItems = revenueData.slice(0, 3);
                    
                    if (displayItems.length === 0) {
                      return (
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">No revenue plan available</p>
                        </div>
                      );
                    }
                    
                    return displayItems.map((item, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-foreground leading-tight">
                          {item}
                        </p>
                      </div>
                    ));
                  })()}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/revenue-full-analysis')}>
                    See Full Revenue Plan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Execution Plan */}
            {ideaOfTheDay.execution_plan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket size={18} />
                    Execution Plan
                  </CardTitle>
                  <CardDescription>Step-by-step implementation roadmap</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    // Enhanced parsing for execution plan that handles nested JSON
                    const parseExecutionPlan = (content: any): string[] => {
                      if (!content) return [];
                      
                      try {
                        let parsed = content;
                        if (typeof content === 'string') {
                          parsed = JSON.parse(content);
                        }
                        
                        // Check if it has a summary field
                        if (parsed && typeof parsed === 'object' && parsed.summary) {
                          if (typeof parsed.summary === 'string') {
                            return [parsed.summary];
                          }
                          if (Array.isArray(parsed.summary)) {
                            return parsed.summary.map(item => typeof item === 'string' ? item : JSON.stringify(item));
                          }
                        }
                        
                        // Fallback to regular parsing
                        return parseContent(content);
                      } catch (error) {
                        return parseContent(content);
                      }
                    };
                    
                    const executionData = parseExecutionPlan(ideaOfTheDay.execution_plan);
                    
                    if (executionData.length === 0) {
                      return (
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">No execution plan available</p>
                        </div>
                      );
                    }
                    
                    // Show only the first line without number
                    const firstLine = executionData[0];
                    
                    return (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-foreground leading-tight">
                          {firstLine}
                        </p>
                      </div>
                    );
                  })()}
                  <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/execution-full-analysis')}>
                    See Full Execution Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Podcast Player - Fixed Bottom Bar */}
      {ideaOfTheDay.podcast_url && showPodcastPlayer && (
        <PodcastPlayer
          podcastUrl={ideaOfTheDay.podcast_url}
          podcastUrlHindi={ideaOfTheDay.podcast_url_hindi}
          ideaTitle={ideaOfTheDay.title}
          ideaId={ideaOfTheDay.id}
          duration={ideaOfTheDay.podcast_duration}
          onClose={() => setShowPodcastPlayer(false)}
        />
      )}
    </div>
  );
};

export default Index;
