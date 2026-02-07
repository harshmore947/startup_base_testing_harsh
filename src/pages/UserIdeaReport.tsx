import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserReport } from '@/hooks/useUserReport';
import { FormattedDescription } from '@/lib/formatDescription';
import { logger } from '@/lib/logger';
import { TrendChart } from '@/components/TrendChart';
import { InteractiveYouTubeData } from '@/components/InteractiveYouTubeData';
import { InteractiveRedditData } from '@/components/InteractiveRedditData';
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
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import YouTubeDiscussions from '@/components/YouTubeDiscussions';
import RedditDiscussions from '@/components/RedditDiscussions';
import { MarketMetricsShowcase } from '@/components/MarketMetricsShowcase';
import { BuildQuickLinks } from '@/components/BuildQuickLinks';

// Helper function to get idea tags based on scores
const getIdeaTags = (report: any) => {
  const tags = [];
  
  if (report.opportunity_score >= 8) {
    tags.push({ label: 'High Opportunity', variant: 'default' as const });
  }
  
  
  if (report.why_now_score >= 8) {
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

export default function UserIdeaReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const { data: userReport, isLoading } = useUserReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-text text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Report Not Found</h1>
          <p className="body-text text-muted-foreground mb-6">
            The report you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/research-my-idea">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Research
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
              <Link to="/research-my-idea">
                <ChevronLeft size={16} />
                Back to Research
              </Link>
            </Button>
            <div className="text-center">
              <h2 className="font-semibold text-lg">Your Idea Report</h2>
              <p className="text-sm text-muted-foreground">Detailed Analysis</p>
            </div>
            <Button 
              asChild
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to={`/user-build-idea/${userReport.id}`}>
                <Building2 className="mr-2 h-4 w-4" />
                Build This Idea
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    {userReport.idea_title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {getIdeaTags(userReport).map((tag, index) => (
                    <Badge key={index} variant={tag.variant}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Market Metrics Showcase */}
              {(userReport.tam_value || userReport.Revenue_potential) && (
                <MarketMetricsShowcase
                  tamValue={userReport.tam_value}
                  tamSummary={userReport.tam_summary}
                  revenuePotential={userReport.Revenue_potential}
                  revenueSummary={userReport.revenue_potential_summary}
                  ideaId={userReport.id}
                  reportType="user-report"
                />
              )}

              <div className="prose prose-lg max-w-none">
                <FormattedDescription description={userReport.idea_description} />
              </div>
            </div>

            {/* Market Trends */}
            {userReport.trends_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <TrendingUp size={24} />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={userReport.trends_data} trendQuery={userReport.trends_query || ''} height={300} />
                </CardContent>
              </Card>
            )}

            {/* Why Now Analysis */}
            {userReport.why_now_summary && (
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
                      {userReport.why_now_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/user-report/${userReport.id}/why-now-full-analysis`)}
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
            {userReport.overall_summary && (
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
                      {userReport.overall_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/user-report/${userReport.id}/opportunity-full-analysis`)}
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
            {userReport.community_signal_summary && (
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
                      {userReport.community_signal_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/user-report/${userReport.id}/community-full-analysis`)}
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
            {userReport.feasibility_summary && (
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
                      {userReport.feasibility_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/user-report/${userReport.id}/feasibility-full-analysis`)}
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
            {userReport.trends_summary && (
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
                      {userReport.trends_summary.substring(0, 300)}...
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/user-report/${userReport.id}/trends-full-analysis`)}
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
                value={userReport.opportunity_score}
                icon={TrendingUp}
                description="Market size, demand potential, and revenue opportunity assessment"
                color="border-l-blue-500"
                analysisPath={`/user-report/${userReport.id}/opportunity-full-analysis`}
              />
              {userReport.feasibility_score && (
                <FlipScoreCard 
                  title="Feasibility" 
                  value={userReport.feasibility_score}
                  icon={Wrench}
                  description="Technical and business execution complexity"
                  color="border-l-green-500"
                  analysisPath={`/user-report/${userReport.id}/feasibility-full-analysis`}
                />
              )}
              <FlipScoreCard 
                title="Timing" 
                value={userReport.why_now_score}
                icon={Sparkles}
                description="Market readiness and current timing advantages"
                color="border-l-purple-500"
                analysisPath={`/user-report/${userReport.id}/why-now-full-analysis`}
              />
              {userReport.community_signal_score && (
                <FlipScoreCard 
                  title="Community" 
                  value={userReport.community_signal_score}
                  icon={Users}
                  description="Social validation and community interest signals"
                  color="border-l-orange-500"
                  analysisPath={`/user-report/${userReport.id}/community-full-analysis`}
                />
              )}
              {userReport.trends_score && (
                <FlipScoreCard 
                  title="Trends" 
                  value={userReport.trends_score}
                  icon={LineChart}
                  description="Market trends and momentum indicators"
                  color="border-l-indigo-500"
                  analysisPath={`/user-report/${userReport.id}/trends-full-analysis`}
                />
              )}
            </div>

            {/* Market News */}
            {userReport.news_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Market News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const parseNewsData = (newsData: any): any[] => {
                      if (!newsData) return [];
                      
                      try {
                        let parsed = newsData;
                        if (typeof newsData === 'string') {
                          parsed = JSON.parse(newsData);
                        }
                        
                        if (Array.isArray(parsed)) {
                          return parsed;
                        }
                        
                        if (parsed && typeof parsed === 'object') {
                          if (parsed.articles && Array.isArray(parsed.articles)) {
                            return parsed.articles;
                          }
                          if (parsed.data && Array.isArray(parsed.data)) {
                            return parsed.data;
                          }
                          return [parsed];
                        }
                        
                        return [];
                      } catch (error) {
                        logger.error('Error parsing news data:', error);
                        return [];
                      }
                    };

                    const newsData = parseNewsData(userReport.news_data);
                    
                    if (newsData.length === 0) {
                      return (
                        <div className="p-4 bg-muted/30 rounded-lg text-center">
                          <p className="text-muted-foreground">No news articles available</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {newsData.slice(0, 3).map((article, index) => (
                          <div 
                            key={index} 
                            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                            onClick={() => {
                              if (article.link) {
                                window.open(article.link, '_blank');
                              }
                            }}
                          >
                            <h4 className="font-medium text-foreground leading-tight mb-1">
                              {article.title || 'Untitled Article'}
                            </h4>
                            {article.summary && (
                              <p className="text-muted-foreground text-sm mb-2 leading-relaxed line-clamp-2">
                                {article.summary}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              {article.source?.name && (
                                <span className="font-medium">{article.source.name}</span>
                              )}
                              <span className={!article.source?.name ? 'ml-auto' : ''}>
                                {article.date && 
                                  new Date(article.date).toLocaleDateString('en-US', {
                                    month: 'short', 
                                    day: 'numeric'
                                  })
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                        {newsData.length > 3 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4"
                            onClick={() => navigate(`/user-report/${userReport.id}/market-news`)}
                          >
                            Show All Market News ({newsData.length})
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* YouTube Discussions */}
            {userReport.youtube_data && (
              <YouTubeDiscussions 
                youtubeData={userReport.youtube_data} 
                analysisPath={`/user-report/${userReport.id}/community-full-analysis`}
              />
            )}

            {/* Build Quick Links */}
            <BuildQuickLinks buildPath={`/user-build-idea/${id}`} />

            {/* Revenue Model Summary */}
            {userReport.revenue_plan && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee size={18} />
                    Revenue Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {(() => {
                      try {
                        const parsed = typeof userReport.revenue_plan === 'string' 
                          ? JSON.parse(userReport.revenue_plan) 
                          : userReport.revenue_plan;
                        if (typeof parsed === 'object' && parsed !== null) {
                          // Extract first meaningful text content
                          const firstValue = Object.values(parsed)[0];
                          return typeof firstValue === 'string' ? firstValue.substring(0, 150) + '...' : 'Revenue plan available';
                        }
                        return String(parsed).substring(0, 150) + '...';
                      } catch (e) {
                        return typeof userReport.revenue_plan === 'string' 
                          ? userReport.revenue_plan.substring(0, 150) + '...'
                          : 'Revenue plan available';
                      }
                    })()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/user-report/${userReport.id}/revenue-full-analysis`)}
                    className="w-full"
                  >
                    View Full Analysis
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Execution Plan Summary */}
            {userReport.execution_plan && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 size={18} />
                    Execution Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {(() => {
                      try {
                        const parsed = typeof userReport.execution_plan === 'string' 
                          ? JSON.parse(userReport.execution_plan) 
                          : userReport.execution_plan;
                        if (typeof parsed === 'object' && parsed !== null) {
                          // Extract first meaningful text content
                          const firstValue = Object.values(parsed)[0];
                          return typeof firstValue === 'string' ? firstValue.substring(0, 150) + '...' : 'Execution plan available';
                        }
                        return String(parsed).substring(0, 150) + '...';
                      } catch (e) {
                        return typeof userReport.execution_plan === 'string' 
                          ? userReport.execution_plan.substring(0, 150) + '...'
                          : 'Execution plan available';
                      }
                    })()}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/user-report/${userReport.id}/execution-full-analysis`)}
                    className="w-full"
                  >
                    View Full Analysis
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}