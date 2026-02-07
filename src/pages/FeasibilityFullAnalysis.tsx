import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { AnalysisContent } from '@/components/AnalysisContent';
import { useNavigate } from 'react-router-dom';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

export default function FeasibilityFullAnalysis() {
  const navigate = useNavigate();
  const { data: ideaOfTheDay, isLoading } = useIdeaOfTheDay();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Analysis Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Feasibility Analysis</h1>
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
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Feasibility Analysis</h1>
                <p className="text-[15px] text-foreground leading-relaxed text-justify max-w-4xl mt-2">
                  {ideaOfTheDay.title} - Comprehensive analysis of technical and business feasibility
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <AnalysisContent 
          content={ideaOfTheDay.feasibility_reasoning_full_analysis} 
          score={ideaOfTheDay.feasibilty_score}
        />
      </div>
    </div>
  );
}