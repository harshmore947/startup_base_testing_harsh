import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessCodeModal = ({ isOpen, onClose }: AccessCodeModalProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { grantAccess } = useEarlyAccess();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter an access code');
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('validate-access-code', {
        body: { code: code.trim() }
      });

      if (invokeError) {
        logger.error('Error invoking function:', invokeError);
        setError('Failed to verify code. Please try again.');
        setIsVerifying(false);
        return;
      }

      if (data.valid) {
        // Grant access and redirect
        grantAccess(data.token, data.expiresAt);
        toast({
          title: "Access Granted!",
          description: "Welcome to Startup Base.",
        });
        onClose();
        navigate('/');
      } else {
        setError('Invalid access code. Please try again.');
      }
    } catch (err) {
      logger.error('Error verifying access code:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCode('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Your Early Access Code</DialogTitle>
          <DialogDescription>
            Enter the code you received to get early access to Startup Base.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="Enter your code"
              className={error ? 'border-destructive' : ''}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Access'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessCodeModal;
