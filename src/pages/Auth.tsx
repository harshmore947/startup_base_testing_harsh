import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { UserPlus, LogIn, KeyRound, Mail } from 'lucide-react';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
});

// Client-side rate limiting for forgot password (since user is not authenticated)
const RATE_LIMIT_KEY = 'password_reset_attempts';
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const checkClientRateLimit = (): { allowed: boolean; error?: string } => {
  const storedData = localStorage.getItem(RATE_LIMIT_KEY);
  const now = Date.now();

  if (storedData) {
    const { attempts, firstAttempt } = JSON.parse(storedData);
    if (now - firstAttempt < WINDOW_MS && attempts >= MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil((WINDOW_MS - (now - firstAttempt)) / 60000);
      return { 
        allowed: false, 
        error: `Too many attempts. Please wait ${minutesLeft} minutes before trying again.` 
      };
    }
  }
  return { allowed: true };
};

const recordRateLimitAttempt = () => {
  const storedData = localStorage.getItem(RATE_LIMIT_KEY);
  const now = Date.now();

  if (storedData) {
    const { attempts, firstAttempt } = JSON.parse(storedData);
    if (now - firstAttempt >= WINDOW_MS) {
      // Reset if window has passed
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts: 1, firstAttempt: now }));
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts: attempts + 1, firstAttempt }));
    }
  } else {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts: 1, firstAttempt: now }));
  }
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'login' ? 'login' : modeParam === 'reset' ? 'reset' : modeParam === 'forgot-password' ? 'forgot-password' : 'signup';

  // Get redirect parameter with security validation
  const redirectParam = searchParams.get('redirect');
  const ALLOWED_REDIRECTS = ['/', '/pricing', '/archive', '/dashboard', '/idea-report', '/destination'];

  const getRedirectUrl = (consumeSession: boolean = false) => {
    // Only check sessionStorage/localStorage if explicitly consuming (after OAuth callback)
    if (consumeSession) {
      // Try sessionStorage first
      const storedRedirect = sessionStorage.getItem('auth_redirect_path');
      if (storedRedirect) {
        sessionStorage.removeItem('auth_redirect_path'); // Clean up after reading
        if (storedRedirect.startsWith('/') && ALLOWED_REDIRECTS.some(allowed => storedRedirect.startsWith(allowed))) {
          console.log('[Auth] Using sessionStorage redirect:', storedRedirect);
          localStorage.removeItem('auth_redirect_path'); // Clean up localStorage too
          return storedRedirect;
        }
      }

      // Fallback to localStorage if sessionStorage didn't work
      const localStoredRedirect = localStorage.getItem('auth_redirect_path');
      if (localStoredRedirect) {
        localStorage.removeItem('auth_redirect_path'); // Clean up after reading
        if (localStoredRedirect.startsWith('/') && ALLOWED_REDIRECTS.some(allowed => localStoredRedirect.startsWith(allowed))) {
          console.log('[Auth] Using localStorage redirect:', localStoredRedirect);
          return localStoredRedirect;
        }
      }
    }

    // Then check URL parameter
    if (!redirectParam) {
      console.log('[Auth] No redirect param, defaulting to pricing page');
      return '/pricing';
    }

    // Security: Only allow internal paths, prevent open redirect attacks
    if (redirectParam.startsWith('/') && ALLOWED_REDIRECTS.some(allowed => redirectParam.startsWith(allowed))) {
      console.log('[Auth] Using URL redirect:', redirectParam);
      return redirectParam;
    }

    console.log('[Auth] Invalid redirect, defaulting to pricing page');
    return '/pricing'; // Fallback to pricing page for invalid redirects
  };

  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  // Listen for PASSWORD_RECOVERY event to auto-switch to reset mode
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if already authenticated (but NOT when in reset mode - user needs to set new password)
  if (user && mode !== 'reset') {
    // Check sessionStorage first (OAuth callback), then URL param
    const redirect = getRedirectUrl(true);
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // For signup, validate confirm password
    if (mode === 'signup') {
      if (password !== signupConfirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const { error } = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, getRedirectUrl(false));

      if (error) {
        // Handle specific error cases
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (mode === 'signup') {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account.",
        });
      } else {
        // Successful login - redirect to intended destination (use URL param, not session)
        const redirect = getRedirectUrl(false);
        console.log('[Auth] Login successful, redirecting to:', redirect);
        navigate(redirect);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    const validation = authSchema.shape.password.safeParse(newPassword);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      navigate(getRedirectUrl(false));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate email only
    const emailValidation = authSchema.shape.email.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Validation Error",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Client-side rate limiting (since user is not authenticated)
    const rateLimitCheck = checkClientRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Too Many Attempts",
        description: rateLimitCheck.error,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      // Record the attempt after successful request
      recordRateLimitAttempt();
      
      setResetEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirect = getRedirectUrl(false);
      console.log('[Auth] Google signin, storing redirect:', redirect);
      const { error } = await signInWithGoogle(redirect);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const getHeaderIcon = () => {
    switch (mode) {
      case 'signup':
        return (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
        );
      case 'login':
        return (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <LogIn className="h-7 w-7 text-emerald-500" />
          </div>
        );
      case 'forgot-password':
        return (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <Mail className="h-7 w-7 text-amber-500" />
          </div>
        );
      case 'reset':
        return (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <KeyRound className="h-7 w-7 text-blue-500" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center px-4 sm:px-6 pb-2">
          {getHeaderIcon()}
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {mode === 'reset' 
              ? 'Reset Password' 
              : mode === 'forgot-password'
              ? 'Forgot Password'
              : mode === 'login' 
              ? 'Welcome Back' 
              : 'Create Your Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            {mode === 'reset'
              ? 'Enter your new password below'
              : mode === 'forgot-password'
              ? 'Enter your email to receive a password reset link'
              : mode === 'login'
              ? 'Sign in to continue to your account'
              : 'Join us and start exploring premium startup ideas'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {mode === 'forgot-password' ? (
            resetEmailSent ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-2">
                    Please check your email and click the link to reset your password.
                  </p>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    setResetEmailSent(false);
                    setEmail('');
                  }}
                >
                  Send Another Reset Email
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setEmail('');
                      setResetEmailSent(false);
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-border h-11"
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setEmail('');
                      setPassword('');
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : mode === 'reset' ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-background border-border h-11"
                  placeholder="Enter new password"
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background border-border h-11"
                  placeholder="Re-enter new password"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must contain 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          ) : (
            <>
              {/* Google Sign In Button - Show First */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-white dark:bg-card border-2 border-border hover:bg-white hover:shadow-md dark:hover:bg-accent text-foreground transition-shadow"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                <svg className="mr-2 sm:mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? 'Signing in...' : (mode === 'login' ? 'Sign in with Google' : 'Sign up with Google')}
              </Button>

              {/* Divider */}
              <div className="mt-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-border h-11"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-border h-11"
                    placeholder="Enter your password"
                    minLength={8}
                  />
                  {mode === 'signup' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Must contain 8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>

                {/* Confirm Password - Only for Signup */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      className="bg-background border-border h-11"
                      placeholder="Re-enter your password"
                      minLength={8}
                    />
                  </div>
                )}

                {/* Forgot Password - Only for Login */}
                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setEmail('');
                        setPassword('');
                        setResetEmailSent(false);
                      }}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
            </>
          )}
          
          {mode !== 'reset' && mode !== 'forgot-password' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setPassword('');
                  setSignupConfirmPassword('');
                }}
                className="text-primary font-medium hover:text-primary/80 transition-colors mt-1"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
