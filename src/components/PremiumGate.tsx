import { ReactNode, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Crown, Check, ArrowLeft } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  fallback?: 'redirect' | 'overlay' | 'page';
}

export function PremiumGate({ children, fallback = 'redirect' }: PremiumGateProps) {
  const { user, loading: authLoading, isPremium, userProfile } = useAuth();
  const location = useLocation();

  // Store current path for redirect after auth/upgrade
  useEffect(() => {
    if (!authLoading) {
      const currentPath = location.pathname + location.search;
      sessionStorage.setItem('auth_redirect_path', currentPath);
    }
  }, [authLoading, location]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to auth with current path
  if (!user) {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  // Debug logging
  logger.log('PremiumGate Debug:', {
    user: user?.id,
    userProfile,
    isPremium,
    subscriptionStatus: userProfile?.subscription_status
  });

  if (isPremium) {
    return <>{children}</>;
  }

  // Not premium - handle based on fallback type
  if (fallback === 'redirect') {
    return <Navigate to="/pricing" replace />;
  }

  // Page fallback - show dedicated upgrade page
  if (fallback === 'page') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold">
            Unlock Full Idea Reports
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Get complete access to our entire idea database with detailed analysis, 
            market research, and step-by-step building guides.
          </p>
          
          <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4">
            <h3 className="font-semibold text-lg">What's included with Premium:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Complete Idea Database Access</span>
                  <p className="text-sm text-muted-foreground">
                    Explore 100+ validated startup ideas with full reports
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Build This Idea Tools</span>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered prompts, landing page copy, and ad creatives for every idea
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Daily Idea of the Day + Build Guide</span>
                  <p className="text-sm text-muted-foreground">
                    Access building guides and resources for every new daily idea
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/pricing">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium - ₹2999/year
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/archive">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ideas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Overlay fallback - blur content and show upgrade prompt
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4 p-8 bg-card border border-border rounded-lg shadow-lg max-w-md">
          <h3 className="text-2xl font-bold">Premium Feature</h3>
          <p className="text-muted-foreground">
            This feature is only available to premium members. Upgrade your account to access the full idea database and build tools.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}