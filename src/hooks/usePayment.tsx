import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { trackInitiateCheckout } from '@/lib/metaTracking';

export function usePayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async () => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "Please log in again to continue.",
          variant: "destructive"
        });
        navigate('/auth?mode=login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-ccavenue-order', {
        body: { plan_type: 'premium_annual' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) {
        logger.error('Edge function error:', error);
        toast({
          title: "Error",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (!data?.success || !data?.payment_url || !data?.encrypted_request || !data?.access_code) {
        logger.error('Invalid response from payment gateway');
        toast({
          title: "Error",
          description: "Invalid payment response. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payment_url;

      const encReqInput = document.createElement('input');
      encReqInput.type = 'hidden';
      encReqInput.name = 'encRequest';
      encReqInput.value = data.encrypted_request;
      form.appendChild(encReqInput);

      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = data.access_code;
      form.appendChild(accessCodeInput);

      // Track InitiateCheckout event (non-blocking)
      trackInitiateCheckout({
        value: 999,
        currency: 'INR',
        content_name: 'Premium Annual Subscription',
      }).catch(err => logger.error('InitiateCheckout tracking failed:', err));

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      logger.error('Payment initiation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const initiateGuestPayment = async (guestData: {
    email: string;
    billing_name: string;
    billing_tel?: string;
  }) => {
    setIsProcessing(true);

    try {
      logger.info('Initiating guest checkout for:', guestData.email);

      const { data, error } = await supabase.functions.invoke('create-guest-ccavenue-order', {
        body: {
          plan_type: 'premium_annual',
          email: guestData.email,
          billing_name: guestData.billing_name,
          billing_tel: guestData.billing_tel || '',
        }
      });

      if (error) {
        logger.error('Guest checkout Edge function error:', error);
        toast({
          title: "Error",
          description: "Failed to initiate payment. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (!data?.success || !data?.payment_url || !data?.encrypted_request || !data?.access_code) {
        logger.error('Invalid response from payment gateway');
        toast({
          title: "Error",
          description: "Invalid payment response. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      logger.info('Guest checkout initiated successfully, redirecting to payment gateway');

      // Create and submit form to CCAvenue
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payment_url;

      const encReqInput = document.createElement('input');
      encReqInput.type = 'hidden';
      encReqInput.name = 'encRequest';
      encReqInput.value = data.encrypted_request;
      form.appendChild(encReqInput);

      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = data.access_code;
      form.appendChild(accessCodeInput);

      // Track InitiateCheckout event for guest (non-blocking)
      trackInitiateCheckout({
        value: 999,
        currency: 'INR',
        content_name: 'Premium Annual Subscription',
      }).catch(err => logger.error('Guest InitiateCheckout tracking failed:', err));

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      logger.error('Guest payment initiation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    initiateGuestPayment,
    isProcessing
  };
}
