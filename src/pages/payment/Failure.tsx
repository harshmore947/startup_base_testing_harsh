import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');
  const planType = searchParams.get('plan_type');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('plan_type')
          .eq('order_id', orderId)
          .single();

        if (!fetchError && order) {
          setOrderDetails(order);
        }
      } catch (err) {
        logger.error('Error fetching order for failure page:', err);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const currentPlanType = orderDetails?.plan_type || planType;
  const isResearchPlan = currentPlanType === 'research_single';
  const isPremiumPlan = currentPlanType === 'premium_annual';

  const getErrorMessage = () => {
    if (reason) return decodeURIComponent(reason);
    if (error === 'no_response') return 'No response received from payment gateway';
    if (error === 'decryption_failed') return 'Failed to process payment response';
    if (error === 'order_not_found') return 'Order not found in our system';
    if (error === 'server_error') return 'Server error occurred';
    return 'Payment was not completed successfully';
  };

  const handleRetry = () => {
    if (isResearchPlan) {
      navigate('/research-my-idea');
    } else if (isPremiumPlan) {
      navigate('/pricing');
    } else {
      navigate('/pricing');
    }
  };

  const getRetryButtonText = () => {
    if (isResearchPlan) return 'Try Research Again';
    if (isPremiumPlan) return 'Try Premium Again';
    return 'Try Again';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-3xl">Payment Failed</CardTitle>
          <CardDescription>
            Your payment could not be processed at this time.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              {getErrorMessage()}
            </AlertDescription>
          </Alert>

          {orderId && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Order Reference</p>
              <p className="font-mono text-sm mt-1">{orderId}</p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              What can you do?
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Check if sufficient funds are available</li>
              <li>• Verify your card/payment details</li>
              <li>• Try a different payment method</li>
              <li>• Contact your bank if the issue persists</li>
              <li>• Reach out to our support team for assistance</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRetry}
              className="flex-1"
              size="lg"
            >
              {isResearchPlan ? (
                <FileText className="mr-2 h-4 w-4" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              {getRetryButtonText()}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <a
                href="mailto:support@ideastation.com"
                className="text-primary hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
