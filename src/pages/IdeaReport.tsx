import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormattedDescription } from '@/lib/formatDescription';
import { logger } from '@/lib/logger';
import { PremiumGate } from '@/components/PremiumGate';
import { useIdeaById } from '@/hooks/useIdeaById';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Users, 
  IndianRupee, 
  LineChart, 
  Sparkles, 
  Copy,
  ExternalLink,
  ChevronRight,
  Wrench,
  ChevronLeft,
  Building2,
  Globe,
  Rocket
} from 'lucide-react';
import { TrendChart } from '@/components/TrendChart';
import { useNavigate } from 'react-router-dom';
import { InteractiveAmazonData } from '@/components/InteractiveAmazonData';
import YouTubeDiscussions from '@/components/YouTubeDiscussions';
import RedditDiscussions from '@/components/RedditDiscussions';
import React, { useState } from 'react';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { MarketMetricsShowcase } from '@/components/MarketMetricsShowcase';
import { BuildQuickLinks } from '@/components/BuildQuickLinks';

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
    // If not JSON, split by common delimiters and clean up
    const items = stringContent
      .split(/\n|\.(?=\s[A-Z])|;\s*|\|\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 10 && !item.includes('[object Object]'));
    
    return items.length > 0 ? items : [stringContent.trim()].filter(item => item && !item.includes('[object Object]'));
  }
}

// Parse news data from the database
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

// Helper function to get idea tags
const getIdeaTags = (idea: any) => {
  const tags = [];
  
  if (idea.overall_opportunity_score >= 8) {
    tags.push({ label: 'High Opportunity', variant: 'default' as const });
  }
  
  
  if (idea.timing_score >= 8) {
    tags.push({ label: 'Perfect Timing', variant: 'secondary' as const });
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
    if (isFlipped && analysisPath) {
      cardNavigate(analysisPath);
    }
  };

  return (
    <div 
      className="flip-card cursor-pointer h-24" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <Card className={`flip-card-front ${color} border-l-4 h-full`}>
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Icon size={16} className="text-foreground" />
              <div className="text-right">
                <div className="text-xl font-bold text-foreground leading-tight">
                  {safeValue ?? '--'}
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-base mb-1 leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(safeValue)}</p>
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
  );
};

function IdeaReportContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPodcastPlayer, setShowPodcastPlayer] = useState(false);

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      logger.error('Failed to copy text: ', err);
    }
  };

  // Helper function to render interactive content
  const renderInteractiveContent = (data: any, title: string) => {
    if (!data) return null;

    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      parsedData = data;
    }

    if (Array.isArray(parsedData)) {
      return (
        <div className="space-y-4">
          {parsedData.map((item, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">
                    {item.title || item.name || `Item ${index + 1}`}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description || item.summary || JSON.stringify(item)}
                  </p>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-2"
                    >
                      <ExternalLink size={14} />
                      View Source
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(item, null, 2), title)}
                  className="ml-2 hover:bg-muted"
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-mono">
              {typeof parsedData === 'object' ? JSON.stringify(parsedData, null, 2) : parsedData}
            </pre>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(typeof parsedData === 'object' ? JSON.stringify(parsedData, null, 2) : parsedData, title)}
            className="ml-2 hover:bg-muted"
          >
            <Copy size={14} />
          </Button>
        </div>
      </div>
    );
  };

  const { data: idea, isLoading } = useIdeaById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-text text-muted-foreground">Loading idea report...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Idea Not Found</h1>
          <p className="body-text text-muted-foreground mb-6">
            The idea you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/archive">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ideas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button asChild variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 h-10 sm:h-9">
              <Link to="/archive">
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Back to Ideas</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="text-center flex-1">
              <h2 className="font-semibold text-base sm:text-lg">Idea Report</h2>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Detailed Analysis</p>
            </div>
            
            {/* Podcast Button (if available) */}
            {idea.podcast_url && (
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setShowPodcastPlayer(!showPodcastPlayer)}
                className="h-10 sm:h-9 px-3 sm:px-4"
              >
                <span className="mr-2">🎧</span>
                <span className="hidden sm:inline">Listen</span>
              </Button>
            )}
            
            <Button 
              asChild
              variant="default" 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-9 px-3 sm:px-4"
            >
              <Link to={`/build-idea/${idea.id}`}>
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Build This Idea</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {idea.title}
                  </h1>
                  {(idea as any).type && (
                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium border-2 transition-all hover:scale-105 w-fit ${
                      (idea as any).type === 'easy' 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                        : (idea as any).type === 'medium'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}>
                      {(idea as any).type.charAt(0).toUpperCase() + (idea as any).type.slice(1)} Difficulty
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {getIdeaTags(idea).map((tag, index) => (
                    <Badge key={index} variant={tag.variant}>
                      {tag.label}
                    </Badge>
                  ))}
                  {(idea as any).industry && (
                    <Badge variant="outline" className="text-sm">
                      <Building2 className="w-3 h-3 mr-1" />
                      {(idea as any).industry}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Market Metrics Showcase */}
              {((idea as any).tam_value || (idea as any).Revenue_potential) && (
                <MarketMetricsShowcase
                  tamValue={(idea as any).tam_value}
                  tamSummary={(idea as any).tam_summary}
                  revenuePotential={(idea as any).Revenue_potential}
                  revenueSummary={(idea as any).revenue_potential_summary}
                  ideaId={idea.id}
                />
              )}

              <div className="prose prose-sm sm:prose-lg max-w-none">
                <FormattedDescription description={idea.description} />
              </div>
            </div>

            {/* Market Trends */}
            {idea.trend_data_1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <TrendingUp size={24} />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={idea.trend_data_1} trendQuery={idea.trend_query_1 || ''} height={300} />
                </CardContent>
              </Card>
            )}

            {/* Why Now Reasoning */}
            {(idea as any).why_now_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles size={24} />
                    Why Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify mb-4">
                      {(idea as any).why_now_reasoning_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/idea-report/${idea.id}/why-now-full-analysis`)}
                      className="hover-lift"
                    >
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Opportunity */}
            {(idea as any).overall_oppurtunity_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Target size={24} />
                    Market Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify mb-4">
                      {(idea as any).overall_oppurtunity_reasoning_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/idea-report/${idea.id}/opportunity-full-analysis`)}
                      className="hover-lift"
                    >
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Validation */}
            {(idea as any).community_signal_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Users size={24} />
                    Community Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify mb-4">
                      {(idea as any).community_signal_reasoning_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/idea-report/${idea.id}/community-full-analysis`)}
                      className="hover-lift"
                    >
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feasibility Analysis */}
            {(idea as any).feasibility_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Wrench size={24} />
                    Feasibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify mb-4">
                      {(idea as any).feasibility_reasoning_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/idea-report/${idea.id}/feasibility-full-analysis`)}
                      className="hover-lift"
                    >
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trends & Signals */}
            {(idea as any).trends_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <LineChart size={24} />
                    Trends & Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify mb-4">
                      {(idea as any).trends_reasoning_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/idea-report/${idea.id}/trends-full-analysis`)}
                      className="hover-lift"
                    >
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="space-y-4">
              <FlipScoreCard 
                title="Opportunity" 
                value={idea.overall_opportunity_score}
                icon={TrendingUp}
                description="Market size, demand potential, and revenue opportunity assessment"
                color="border-l-blue-500"
                analysisPath={`/idea-report/${idea.id}/opportunity-full-analysis`}
              />
              <FlipScoreCard 
                title="Feasibility" 
                value={(idea as any).feasibilty_score}
                icon={Wrench}
                description="Technical and business execution complexity"
                color="border-l-green-500"
                analysisPath={`/idea-report/${idea.id}/feasibility-full-analysis`}
              />
              <FlipScoreCard 
                title="Timing" 
                value={idea.timing_score}
                icon={Sparkles}
                description="Market readiness and current timing advantages"
                color="border-l-purple-500"
                analysisPath={`/idea-report/${idea.id}/why-now-full-analysis`}
              />
              {idea.community_signal_score && (
                <FlipScoreCard 
                  title="Community" 
                  value={idea.community_signal_score}
                  icon={Users}
                  description="Social validation and community interest signals"
                  color="border-l-orange-500"
                  analysisPath={`/idea-report/${idea.id}/community-full-analysis`}
                />
              )}
            </div>

            {/* Amazon Product Analysis - Only for Product Analysis Done */}
            {(idea as any)?.IdeaType === 'Product Analysis Done' && (idea as any)?.Amazon_data && (
              <InteractiveAmazonData amazonData={(idea as any).Amazon_data} />
            )}

            {/* Market News */}
            {idea.news_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe size={18} />
                    Market News
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const newsData = parseNewsData(idea.news_data);
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => navigate(`/idea-report/${idea.id}/why-now-full-analysis`)}
                  >
                    View All News
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* YouTube Discussions */}
            {idea.youtube_data && (
              <YouTubeDiscussions 
                youtubeData={idea.youtube_data} 
                analysisPath={`/idea-report/${idea.id}/community-full-analysis`}
              />
            )}

            {/* Build Quick Links */}
            <BuildQuickLinks buildPath={`/build-idea/${idea.id}`} />

            {/* Revenue Plan */}
            {idea.revenue_model && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee size={18} />
                    Revenue Plan
                  </CardTitle>
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
                    
                    const revenueData = parseRevenueModel(idea.revenue_model);
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => navigate(`/idea-report/${idea.id}/revenue-full-analysis`)}
                  >
                    See Full Revenue Plan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Execution Plan */}
            {idea.execution_plan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Rocket size={18} />
                    Execution Plan
                  </CardTitle>
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
                    
                    const executionData = parseExecutionPlan(idea.execution_plan);
                    
                    if (executionData.length === 0) {
                      return (
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">No execution plan available</p>
                        </div>
                      );
                    }
                    
                    // Show only the first line
                    const firstLine = executionData[0];
                    
                    return (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-foreground leading-tight">
                          {firstLine}
                        </p>
                      </div>
                    );
                  })()}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => navigate(`/idea-report/${idea.id}/execution-full-analysis`)}
                  >
                    See Full Execution Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Podcast Player - Fixed Bottom Bar */}
      {idea.podcast_url && showPodcastPlayer && (
        <PodcastPlayer
          podcastUrl={idea.podcast_url}
          podcastUrlHindi={idea.podcast_url_hindi}
          ideaTitle={idea.title}
          ideaId={idea.id}
          duration={idea.podcast_duration}
          onClose={() => setShowPodcastPlayer(false)}
        />
      )}
    </div>
  );
}

export default function IdeaReport() {
  return (
    <PremiumGate fallback="page">
      <IdeaReportContent />
    </PremiumGate>
  );
}