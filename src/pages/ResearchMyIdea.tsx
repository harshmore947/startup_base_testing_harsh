import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lightbulb, CreditCard, Clock, CheckCircle, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const researchFormSchema = z.object({
  ideaTitle: z.string()
    .trim()
    .min(5, { message: "Idea title must be at least 5 characters" })
    .max(200, { message: "Idea title must be less than 200 characters" }),
  ideaDescription: z.string()
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(2000, { message: "Description must be less than 2000 characters" })
});

type EligibilityStatus = {
  can_submit: boolean;
  reason?: 'has_active_request' | 'has_unpaid_order' | 'ok';
  active_report?: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  };
  pending_order?: {
    order_id: string;
    amount: number;
    idea_title: string;
  };
};

export default function ResearchMyIdea() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ideaTitle: '',
    ideaDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check user eligibility for new research submission
  const { data: eligibility, isLoading: eligibilityLoading, refetch: refetchEligibility } = useQuery({
    queryKey: ['research-eligibility', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.rpc('check_user_research_eligibility' as any, {
        p_user_id: user.id
      });

      if (error) {
        logger.error('Error checking eligibility:', error);
        throw error;
      }

      return data as unknown as EligibilityStatus;
    },
    enabled: !!user,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      researchFormSchema.parse({
        ideaTitle: formData.ideaTitle,
        ideaDescription: formData.ideaDescription
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmitWithPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your idea for research.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call store-research-request edge function
      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-research-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ideaTitle: formData.ideaTitle.trim(),
            ideaDescription: formData.ideaDescription.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (result.reason === 'has_active_request') {
          toast({
            title: "Active Research In Progress",
            description: "You already have a research request being processed. Please wait for it to complete.",
            variant: "destructive"
          });
          refetchEligibility(); // Refresh eligibility to show active request
          return;
        }

        if (result.reason === 'has_unpaid_order') {
          toast({
            title: "Pending Payment",
            description: "You have an incomplete payment. Please complete it or wait for it to expire.",
            variant: "destructive"
          });
          refetchEligibility(); // Refresh eligibility to show unpaid order
          return;
        }

        throw new Error(result.error || 'Failed to process request');
      }

      logger.info('Research request created, redirecting to payment:', result);

      // Create hidden form to submit to CCAvenue
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.paymentUrl;

      // Add encrypted request
      const encReqInput = document.createElement('input');
      encReqInput.type = 'hidden';
      encReqInput.name = 'encRequest';
      encReqInput.value = result.encRequest;
      form.appendChild(encReqInput);

      // Add access code
      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = result.accessCode;
      form.appendChild(accessCodeInput);

      // Submit form
      document.body.appendChild(form);
      form.submit();

    } catch (error: any) {
      logger.error('Error submitting research request:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading || eligibilityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                Login Required
              </CardTitle>
              <CardDescription>
                Please log in to submit your idea for research
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user has active research request, show status
  if (eligibility && !eligibility.can_submit && eligibility.reason === 'has_active_request') {
    const activeReport = eligibility.active_report!;
    const isCompleted = activeReport.status === 'Research Analysis Complete';

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isCompleted ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <Clock className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <CardTitle className={`text-2xl ${
                isCompleted ? 'text-green-700' : 'text-blue-700'
              }`}>
                {isCompleted ? 'Your Report is Ready!' : 'Analysis in Progress'}
              </CardTitle>
              <CardDescription>
                {isCompleted
                  ? 'Your comprehensive idea analysis is complete and ready to view.'
                  : 'We are analyzing your idea and will email you once the report is ready.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isCompleted && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>Average processing time:</strong> 12-24 hours
                  </p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Submitted Idea:</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-muted-foreground mt-1">{activeReport.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(activeReport.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                {isCompleted ? (
                  <Button
                    onClick={() => navigate(`/user-report/${activeReport.id}`)}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Your Report
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    We'll notify you via email when your analysis is complete.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user has unpaid order, show payment reminder
  if (eligibility && !eligibility.can_submit && eligibility.reason === 'has_unpaid_order') {
    const pendingOrder = eligibility.pending_order!;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="max-w-2xl mx-auto border-orange-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-700">
                Pending Payment
              </CardTitle>
              <CardDescription>
                You have an incomplete payment for a research request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  Please complete your pending payment or wait for it to expire (1 hour) before submitting a new request.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Pending Research Request:</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Idea Title</Label>
                    <p className="text-sm text-muted-foreground mt-1">{pendingOrder.idea_title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-sm text-muted-foreground mt-1">₹{pendingOrder.amount}</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your payment link has been sent to your email. The order will expire in 1 hour if not completed.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show submission form (user can submit)
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Research Your Idea</CardTitle>
            <CardDescription className="text-base">
              Get a comprehensive analysis of your startup idea, including market trends, feasibility, opportunity assessment, and execution plan.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmitWithPayment} className="space-y-6">
              {/* Pricing Display */}
              <Alert className="bg-green-50 border-green-200">
                <CreditCard className="h-4 w-4 text-green-600" />
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-sm font-medium">Special Launch Price:</span>
                  <span className="text-lg font-bold text-green-600">₹599</span>
                  <span className="text-sm text-muted-foreground line-through">₹999</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">
                    Save ₹400
                  </span>
                </AlertDescription>
              </Alert>

              {/* Idea Title */}
              <div className="space-y-2">
                <Label htmlFor="ideaTitle">
                  Idea Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ideaTitle"
                  placeholder="E.g., AI-powered meal planning for busy professionals"
                  value={formData.ideaTitle}
                  onChange={(e) => handleInputChange('ideaTitle', e.target.value)}
                  className={errors.ideaTitle ? 'border-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.ideaTitle && (
                  <p className="text-sm text-destructive">{errors.ideaTitle}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.ideaTitle.length}/200 characters
                </p>
              </div>

              {/* Idea Description */}
              <div className="space-y-2">
                <Label htmlFor="ideaDescription">
                  Idea Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="ideaDescription"
                  placeholder="Describe your startup idea in detail. What problem does it solve? Who is your target audience? What makes it unique?"
                  value={formData.ideaDescription}
                  onChange={(e) => handleInputChange('ideaDescription', e.target.value)}
                  className={`min-h-[150px] ${errors.ideaDescription ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.ideaDescription && (
                  <p className="text-sm text-destructive">{errors.ideaDescription}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.ideaDescription.length}/2000 characters
                </p>
              </div>

              {/* What You'll Get */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  What You'll Get:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Comprehensive market analysis and trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Feasibility assessment and execution plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Target audience insights and pain points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Revenue potential and monetization strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>AI-powered building tools and prompts</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ₹599 & Submit for Research
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment via CCAvenue • Report delivered within 12-24 hours
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
