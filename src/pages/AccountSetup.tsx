import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AccountSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      toast({
        title: 'Invalid Link',
        description: 'No setup token found. Please check your email for the correct link.',
        variant: 'destructive',
      });
      setIsVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-setup-token', {
        body: { token },
      });

      if (error || !data?.valid) {
        toast({
          title: 'Invalid or Expired Link',
          description: data?.error || 'This setup link is invalid or has expired. Please contact support.',
          variant: 'destructive',
        });
        setTokenValid(false);
      } else {
        setTokenValid(true);
        setEmail(data.email);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify setup link. Please try again.',
        variant: 'destructive',
      });
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are identical.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('complete-account-setup', {
        body: { token, password },
      });

      if (error || !data?.success) {
        toast({
          title: 'Setup Failed',
          description: data?.error || 'Failed to complete account setup. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: 'Account Setup Complete! 🎉',
        description: 'Your password has been set. Redirecting to login...',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/auth?mode=login');
      }, 2000);
    } catch (error) {
      console.error('Account setup error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-muted-foreground">Verifying your setup link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Card className="w-full max-w-md mx-4 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Invalid Setup Link</CardTitle>
            </div>
            <CardDescription>
              This setup link is invalid or has expired. Setup links are only valid for 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you need a new setup link, please contact our support team at{' '}
              <a href="mailto:admin@startupbase.co.in" className="text-indigo-600 hover:underline">
                admin@startupbase.co.in
              </a>
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-6 w-6" />
            <CardTitle>Complete Your Account Setup</CardTitle>
          </div>
          <CardDescription>
            Welcome! Set your password to access your premium StartupBase account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === 'weak'
                          ? 'w-1/3 bg-red-500'
                          : passwordStrength === 'medium'
                          ? 'w-2/3 bg-yellow-500'
                          : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      passwordStrength === 'weak'
                        ? 'text-red-600'
                        : passwordStrength === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {passwordStrength === 'weak'
                      ? 'Weak'
                      : passwordStrength === 'medium'
                      ? 'Medium'
                      : 'Strong'}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. Use a mix of letters, numbers, and symbols for better security.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Complete Setup & Login'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{' '}
              <a
                href="mailto:admin@startupbase.co.in"
                className="text-indigo-600 hover:underline"
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
