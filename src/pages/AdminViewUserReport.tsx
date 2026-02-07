import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FormattedDescription } from '@/lib/formatDescription';
import { TrendChart } from '@/components/TrendChart';
import { 
  ChevronLeft, 
  TrendingUp, 
  Target, 
  Users, 
  LineChart, 
  Sparkles, 
  ChevronRight,
  Wrench,
  Building2,
  Globe,
  User,
  Mail,
  Crown
} from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';

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

// Flip Score Card Component
const FlipScoreCard = ({ title, value, icon: Icon, description, color, analysisPath }: {
  title: string;
  value: number | null;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  analysisPath: string;
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const navigate = useNavigate();
  
  const safeValue = typeof value === 'number' ? Math.max(0, Math.min(10, value)) : null;
  
  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'N/A';
    if (score >= 8) return 'Exceptional';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Moderate';
    return 'Needs Work';
  };

  const handleClick = () => {
    if (analysisPath !== '#') {
      navigate(analysisPath);
    }
  };

  return (
    <div 
      className={`flip-card h-24 ${analysisPath !== '#' ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleClick}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
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

        <Card className="flip-card-back h-full bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-base mb-2 text-primary leading-tight">{title} Analysis</h3>
              <p className="text-sm text-muted-foreground leading-snug flex-1">{description}</p>
            </div>
            {analysisPath !== '#' && (
              <div className="text-xs text-primary mt-2">Click to view full analysis →</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function AdminViewUserReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin-user-report-view', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Fetch report
      const { data: report, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!report) return null;

      // Fetch user details
      const { data: user } = await supabase
        .from('users')
        .select('email, subscription_status, created_at')
        .eq('id', report.user_id)
        .single();

      return { ...report, user };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Report Not Found</h1>
          <Button asChild>
            <Link to="/admin/user-reports">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/user-reports">
                <ChevronLeft size={16} />
                Back to User Reports
              </Link>
            </Button>
            <div className="text-center">
              <h2 className="font-semibold text-lg">Admin View - User Report</h2>
              <p className="text-sm text-muted-foreground">Detailed Analysis</p>
            </div>
            <Button 
              asChild
              variant="default"
            >
              <Link to={`/admin/user-build/${reportData.id}`}>
                <Building2 className="mr-2 h-4 w-4" />
                View Build Plan
              </Link>
            </Button>
          </div>

          {/* User Info Card */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">User Email</p>
                    <p className="font-medium">{reportData.user?.email || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Subscription</p>
                    <Badge variant={reportData.user?.subscription_status === 'premium' ? 'default' : 'secondary'}>
                      {reportData.user?.subscription_status || 'free'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Report Created</p>
                    <p className="font-medium">{format(new Date(reportData.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Report ID</p>
                    <p className="font-medium text-xs truncate">{reportData.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  {reportData.idea_title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  {getIdeaTags(reportData).map((tag, index) => (
                    <Badge key={index} variant={tag.variant}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <FormattedDescription description={reportData.idea_description} />
              </div>
            </div>

            {reportData.trends_data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <TrendingUp size={24} />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart data={reportData.trends_data} trendQuery={reportData.trends_query || ''} height={300} />
                </CardContent>
              </Card>
            )}

            {reportData.why_now_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Sparkles size={24} />
                    Why Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify">
                      {reportData.why_now_summary}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/admin/user-report/${id}/why-now-full-analysis`}>
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {reportData.overall_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Target size={24} />
                    Market Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify">
                      {reportData.overall_summary}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/admin/user-report/${id}/opportunity-full-analysis`}>
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {reportData.community_signal_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Users size={24} />
                    Community Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify">
                      {reportData.community_signal_summary}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/admin/user-report/${id}/community-full-analysis`}>
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {reportData.feasibility_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Wrench size={24} />
                    Feasibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify">
                      {reportData.feasibility_summary}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/admin/user-report/${id}/feasibility-full-analysis`}>
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {reportData.trends_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <LineChart size={24} />
                    Trends & Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-[15px] text-foreground leading-relaxed text-justify">
                      {reportData.trends_summary}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/admin/user-report/${id}/trends-full-analysis`}>
                      See Full Analysis
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="space-y-4">
              <FlipScoreCard 
                title="Opportunity" 
                value={reportData.opportunity_score}
                icon={TrendingUp}
                description="Market size, demand potential, and revenue opportunity assessment"
                color="border-l-blue-500"
                analysisPath={`/admin/user-report/${id}/opportunity-full-analysis`}
              />
              {reportData.feasibility_score && (
                <FlipScoreCard 
                  title="Feasibility" 
                  value={reportData.feasibility_score}
                  icon={Wrench}
                  description="Technical and business execution complexity"
                  color="border-l-green-500"
                  analysisPath={`/admin/user-report/${id}/feasibility-full-analysis`}
                />
              )}
              <FlipScoreCard 
                title="Timing" 
                value={reportData.why_now_score}
                icon={Sparkles}
                description="Market readiness and current timing advantages"
                color="border-l-purple-500"
                analysisPath={`/admin/user-report/${id}/why-now-full-analysis`}
              />
              {reportData.community_signal_score && (
                <FlipScoreCard 
                  title="Community" 
                  value={reportData.community_signal_score}
                  icon={Users}
                  description="Social validation and community interest signals"
                  color="border-l-orange-500"
                  analysisPath={`/admin/user-report/${id}/community-full-analysis`}
                />
              )}
              {reportData.trends_score && (
                <FlipScoreCard 
                  title="Trends" 
                  value={reportData.trends_score}
                  icon={LineChart}
                  description="Market trends and momentum indicators"
                  color="border-l-indigo-500"
                  analysisPath={`/admin/user-report/${id}/trends-full-analysis`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

