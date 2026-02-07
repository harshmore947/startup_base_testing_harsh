import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, FileText, Sparkles, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { trackPurchase } from '@/lib/metaTracking';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  const orderId = searchParams.get('order_id');
  const trackingId = searchParams.get('tracking_id');
  const planType = searchParams.get('plan_type');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) {
          logger.error('Failed to fetch order:', error);
        } else {
          setOrderDetails(order);

          // Debug logging
          console.log('Order fetched:', order);
          console.log('Order ID:', order?.order_id);
          console.log('Is guest checkout?', order?.order_id?.startsWith('GUEST_ORD_'));

          // Check if this is a guest checkout by looking at the order_id pattern
          // Guest orders have order_id starting with "GUEST_ORD_"
          if (order?.order_id?.startsWith('GUEST_ORD_')) {
            console.log('Setting isGuestCheckout to true');
            setIsGuestCheckout(true);
          } else {
            console.log('Not a guest checkout, order_id:', order?.order_id);
          }

          // Track purchase in Meta Conversion API (non-blocking)
          if (order) {
            const planName = order.plan_type === 'premium_annual'
              ? 'Premium Annual Subscription'
              : 'Research Your Idea';

            trackPurchase({
              value: order.actual_amount_paid || order.amount,
              currency: order.currency || 'INR',
              content_name: planName,
              order_id: order.order_id,
              user_email: order.billing_email,
            }).catch(err => {
              // Silent failure - tracking errors won't affect user experience
              logger.error('Meta tracking error (non-blocking):', err);
            });
          }
        }
      } catch (error) {
        logger.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentPlanType = orderDetails?.plan_type || planType;
  const isResearchPlan = currentPlanType === 'research_single';
  const isPremiumPlan = currentPlanType === 'premium_annual';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <CardDescription>
            {isGuestCheckout
              ? 'Thank you for your purchase! Please check your email to complete account setup.'
              : isResearchPlan
              ? 'Thank you for your purchase. Your research report is being prepared.'
              : 'Thank you for your purchase. Your premium membership has been activated.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Guest Checkout - Email Setup Notice */}
          {isGuestCheckout && orderDetails && (
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                    Check Your Email!
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    We've sent an account setup link to <strong>{orderDetails.billing_email}</strong>
                  </p>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300 mt-3">
                    <li>• Click the link in the email to set your password</li>
                    <li>• The setup link is valid for 48 hours</li>
                    <li>• Check your spam folder if you don't see it</li>
                    <li>• After setup, you can log in and access all premium features</li>
                  </ul>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                    Don't see the email? It may take a few minutes to arrive. If you still don't receive it within 15 minutes, contact admin@startupbase.co.in
                  </p>
                </div>
              </div>
            </div>
          )}
          {orderDetails && (
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{orderDetails.order_id}</p>
                </div>
                {trackingId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking ID</p>
                    <p className="font-mono text-sm">{trackingId}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-semibold text-lg">
                    ₹{orderDetails.actual_amount_paid?.toFixed(2) || orderDetails.amount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Mode</p>
                  <p className="font-medium">{orderDetails.payment_mode || 'N/A'}</p>
                </div>
              </div>

              {isPremiumPlan && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Premium Membership</p>
                  <p className="font-medium">Valid for 1 year</p>
                  {orderDetails.completed_at && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Expires on: {formatDate(
                        new Date(new Date(orderDetails.completed_at).setFullYear(
                          new Date(orderDetails.completed_at).getFullYear() + 1
                        )).toISOString()
                      )}
                    </p>
                  )}
                </div>
              )}

              {isResearchPlan && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Research Report</p>
                  <p className="font-medium">Your idea analysis is being prepared</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll receive a comprehensive report within 24-48 hours
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email reminder for authenticated users */}
          {!isGuestCheckout && isPremiumPlan && orderDetails && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Check your email ({orderDetails.billing_email}) for latest account updates
                </p>
              </div>
            </div>
          )}

          {/* What's Next Section - Different for each plan type (skip for guest checkout) */}
          {isPremiumPlan && !isGuestCheckout && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What's Next?
                </p>
              </div>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Access all premium features immediately</li>
                <li>• Explore the full archive of ideas</li>
                <li>• Use Build This Idea tools</li>
                <li>• Generate detailed reports</li>
              </ul>
            </div>
          )}

          {/* Email reminder for research plan users */}
          {!isGuestCheckout && isResearchPlan && orderDetails && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Check your email ({orderDetails.billing_email}) for research updates
                </p>
              </div>
            </div>
          )}

          {isResearchPlan && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  What Happens Next?
                </p>
              </div>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                <li>• Our team will analyze your idea thoroughly</li>
                <li>• You'll receive market research & validation data</li>
                <li>• Comprehensive feasibility analysis included</li>
                <li>• Check your reports in "My Reports" section</li>
              </ul>
            </div>
          )}

          {/* Action Buttons - Different for each plan type */}
          {isGuestCheckout && (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/auth?mode=login')}
                className="flex-1"
                size="lg"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
          )}

          {isPremiumPlan && !isGuestCheckout && (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
                size="lg"
              >
                Go to Home
              </Button>
              <Button
                onClick={() => navigate('/archive')}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Explore Archive
              </Button>
            </div>
          )}

          {isResearchPlan && (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/account')}
                className="flex-1"
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                View My Reports
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
          )}

          {/* Fallback buttons if no plan type detected */}
          {!isPremiumPlan && !isResearchPlan && !isGuestCheckout && (
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
