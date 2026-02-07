import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurity } from '@/hooks/useSecurity';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const handleAuthError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message;
};

export function SettingsTab() {
  const { user, signOut } = useAuth();
  const { checkRateLimit, logAuditEvent } = useSecurity();
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteModalClose = (open: boolean) => {
    setDeleteModalOpen(open);
    if (!open) {
      setDeleteConfirmation('');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id || deleteConfirmation !== 'DELETE') return;
    
    const rateLimitResult = await checkRateLimit('account_deletion', 1, 1440);
    if (!rateLimitResult.allowed) {
      toast({
        title: 'Too Many Attempts',
        description: 'Account deletion can only be attempted once per day.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      await logAuditEvent('account_deleted', 'users', user.id);
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      setTimeout(() => {
        signOut();
        navigate('/');
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Error deleting account',
        description: handleAuthError(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Email Address</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your account email address
          </p>
          <p className="text-sm font-medium text-foreground">{user.email}</p>
        </div>
      </Card>

      <Card className="p-6 bg-card border-destructive">
        <div>
          <h3 className="text-lg font-semibold text-destructive mb-1">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteModalOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </Card>

      <AlertDialog open={deleteModalOpen} onOpenChange={handleDeleteModalClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </p>
              <p className="font-semibold">
                Type <span className="text-destructive">DELETE</span> to confirm:
              </p>
              <Input
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                disabled={loading}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading || deleteConfirmation !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
