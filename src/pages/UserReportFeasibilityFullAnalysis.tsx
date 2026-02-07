import { Button } from '@/components/ui/button';
import { ChevronLeft, Wrench } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserReport } from '@/hooks/useUserReport';

export default function UserReportFeasibilityFullAnalysis() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: userReport, isLoading } = useUserReport(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="body-text text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!userReport) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Analysis Not Found</h1>
          <p className="body-text text-muted-foreground mb-6">
            The analysis you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/user-report/${id}`)}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Report
            </Button>
            <div className="flex items-center gap-3">
              <Wrench size={24} className="text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Feasibility Analysis</h1>
                <p className="text-sm text-muted-foreground">{userReport.idea_title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <AnalysisContent 
          content={userReport.feasibility_full_analysis} 
          score={userReport.feasibility_score}
        />
      </main>
    </div>
  );
}