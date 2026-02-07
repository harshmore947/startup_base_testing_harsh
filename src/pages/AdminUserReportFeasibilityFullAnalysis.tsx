import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Mail, Crown, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUserReportFeasibilityFullAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: userReport, isLoading } = useQuery({
    queryKey: ['admin-user-report-feasibility', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: report, error: reportError } = await supabase
        .from('user_reports')
        .select('idea_title, feasibility_full_analysis, feasibility_score, user_id, created_at')
        .eq('id', id)
        .maybeSingle();
      
      if (reportError) throw reportError;
      if (!report) return null;
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, subscription_status')
        .eq('id', report.user_id)
        .single();
      
      if (userError) throw userError;
      
      return { ...report, user };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="heading-2 mb-4">Analysis Not Found</h2>
          <Button asChild>
            <Link to="/admin/user-reports">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-4">
            <Link to={`/admin/user-report/${id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Report
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Admin View</Badge>
            <h1 className="heading-2">{userReport.idea_title}</h1>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">User:</span>
                  <a href={`mailto:${userReport.user.email}`} className="text-primary hover:underline">
                    {userReport.user.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Plan:</span>
                  <Badge variant={userReport.user.subscription_status === 'premium' ? 'default' : 'secondary'}>
                    {userReport.user.subscription_status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(userReport.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Report ID:</span>
                  <span className="font-mono text-xs">{id?.slice(0, 8)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <AnalysisContent 
          content={userReport.feasibility_full_analysis} 
          score={userReport.feasibility_score}
        />
      </div>
    </div>
  );
}
