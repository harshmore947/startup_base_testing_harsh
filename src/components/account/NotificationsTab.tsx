import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { logger } from '@/lib/logger';

export function NotificationsTab() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { logAuditEvent } = useSecurity();
  // Initialize from userProfile (already fetched by useAuth — no extra API call!)
  const [newsletterEnabled, setNewsletterEnabled] = useState(
    (userProfile as any)?.Newsletter ?? true
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Sync local state when userProfile loads/updates (no API call needed)
  useEffect(() => {
    if (userProfile) {
      setNewsletterEnabled((userProfile as any)?.Newsletter ?? true);
    }
  }, [userProfile]);

  const handleNewsletterToggle = async (checked: boolean) => {
    if (!user?.id || updating) return;

    setUpdating(true);
    const previousValue = newsletterEnabled;

    try {
      // Optimistic update
      setNewsletterEnabled(checked);

      const { error } = await supabase
        .from('users')
        .update({ Newsletter: checked })
        .eq('id', user.id);

      if (error) throw error;

      // Log the change for audit trail
      await logAuditEvent(
        checked ? 'newsletter_subscribed' : 'newsletter_unsubscribed',
        'users',
        user.id,
        { newsletter_status: checked }
      );

      // Refresh the central user profile so other components stay in sync
      refreshUserProfile();

      toast({
        title: checked ? 'Newsletter Enabled' : 'Newsletter Disabled',
        description: checked 
          ? 'You will receive our daily newsletter.' 
          : 'You have unsubscribed from the newsletter.',
      });
    } catch (error: any) {
      // Revert on error
      setNewsletterEnabled(previousValue);
      logger.error('Error updating newsletter preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to update newsletter preference. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Email Notifications
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your email notification preferences
            </p>

            <div className="flex items-center justify-between py-4 border-t border-border">
              <div className="flex-1 pr-4">
                <Label htmlFor="newsletter-toggle" className="text-base font-medium cursor-pointer">
                  Daily Newsletter
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive daily startup ideas and market insights delivered to your inbox
                </p>
              </div>
              <Switch
                id="newsletter-toggle"
                checked={newsletterEnabled}
                onCheckedChange={handleNewsletterToggle}
                disabled={loading || updating}
                aria-label="Toggle daily newsletter"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/50 border-muted">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Changes take effect immediately. You can manage your preferences at any time.
        </p>
      </Card>
    </div>
  );
}
