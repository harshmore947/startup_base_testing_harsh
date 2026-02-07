import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const trackingId = searchParams.get('tracking_id');

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
        }
      } catch (error) {
        logger.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            Thank you for your purchase. Your premium membership has been activated.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
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

              {orderDetails.plan_type === 'premium_annual' && (
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
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              What's Next?
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Access all premium features immediately</li>
              <li>• Explore the full archive of ideas</li>
              <li>• Use Build This Idea tools</li>
              <li>• Generate detailed reports</li>
            </ul>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
