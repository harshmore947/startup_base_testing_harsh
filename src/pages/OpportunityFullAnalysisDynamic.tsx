import { Button } from '@/components/ui/button';
import { ChevronLeft, Target } from 'lucide-react';
import { InteractiveOpportunityAnalysis } from '@/components/InteractiveOpportunityAnalysis';
import { useNavigate, useParams } from 'react-router-dom';
import { useIdeaById } from '@/hooks/useIdeaById';

export default function OpportunityFullAnalysisDynamic() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: idea, isLoading } = useIdeaById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Analysis Not Found</h1>
          <Button onClick={() => navigate(`/idea-report/${id}`)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(`/idea-report/${id}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Idea Report
            </Button>
            <h1 className="text-xl font-semibold">Market Opportunity</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Main Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Market Opportunity</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {idea.title} - Comprehensive market size and growth potential analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <InteractiveOpportunityAnalysis 
          content={idea.overall_oppurtunity_full_analysis} 
          score={idea.overall_opportunity_score}
        />
      </div>
    </div>
  );
}