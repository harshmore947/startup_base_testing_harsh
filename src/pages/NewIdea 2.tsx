import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import {
  Lock, Eye, TrendingUp, Users, Target, IndianRupee,
  Clock, Zap, Building2, Crown, X, Mail, CheckCircle,
  Sparkles, ArrowRight, ChevronDown
} from 'lucide-react';
import { logger } from '@/lib/logger';

// Helper function to render markdown with bold text and bullet points
const renderMarkdownBold = (text: string) => {
  if (!text) return null;

  // Remove any incomplete bold markers at the end (e.g., "text **Pricing" or "text **")
  let cleanText = text.replace(/\*\*[^*]*$/, '...');

  // Split into lines to handle bullet points
  const lines = cleanText.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => {
        // Check if line starts with bullet point (*)
        const bulletMatch = line.match(/^\s*\*\s+(.+)/);

        if (bulletMatch) {
          // It's a bullet point - render with proper formatting
          const content = bulletMatch[1];
          return (
            <div key={lineIndex} className="flex gap-2 ml-4 mb-1">
              <span className="text-indigo-600 dark:text-indigo-400">•</span>
              <span>{content}</span>
            </div>
          );
        }

        // Regular line - handle bold markers
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={index} className="font-bold text-gray-900 dark:text-white">{boldText}</strong>;
          }
          return <span key={index}>{part}</span>;
        });

        return <div key={lineIndex} className="mb-1">{rendered}</div>;
      })}
    </>
  );
};

export default function NewIdea() {
  const { user, signInWithGoogle, isPremium } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasScrolledPastGate, setHasScrolledPastGate] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const SCROLL_GATE_PERCENTAGE = 30; // Show gate at 30% scroll

  // Fetch idea of the day
  const { data: ideaOfTheDay, isLoading } = useQuery({
    queryKey: ['idea-of-the-day-new'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('ideas')
          .select('*')
          .eq('is_idea_of_the_day', true)
          .maybeSingle();
        return data;
      } catch (error) {
        logger.error('Error fetching idea of the day:', error);
        throw error;
      }
    }
  });

  // isPremium is now provided directly by useAuth — no extra API call needed!

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrolled = window.scrollY;
        const height = contentRef.current.scrollHeight - window.innerHeight;
        const scrollPercent = (scrolled / height) * 100;

        setScrollPosition(scrollPercent);

        // Show signup modal at gate percentage if not logged in
        if (scrollPercent >= SCROLL_GATE_PERCENTAGE && !user && !hasScrolledPastGate) {
          setShowSignupModal(true);
          setHasScrolledPastGate(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, hasScrolledPastGate]);

  // Handle Google signup
  const handleGoogleSignup = async () => {
    try {
      const { error } = await signInWithGoogle('/pricing');
      if (error) throw error;
    } catch (error) {
      logger.error('Google signup error:', error);
    }
  };

  if (!ideaOfTheDay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Check back later for today's startup idea!</p>
        </div>
      </div>
    );
  }

  if(isLoading){
  return (
    <div className='text-7xl'>
        loading
    </div>
  )
  }

  return (
    <div className="min-h-screen bg-background" ref={contentRef}>
      {/* Signup Modal - Enhanced */}
      {showSignupModal && !user && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md relative animate-in zoom-in slide-in-from-bottom-4 duration-300 shadow-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
            {/* Gradient Top Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-6 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/50">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Unlock Full Report
              </CardTitle>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                Sign in to continue reading this validated startup idea
              </p>
            </CardHeader>

            <CardContent className="space-y-5 px-6 pb-8">
              {/* Google Signup - Primary with gradient hover */}
              <Button
                onClick={handleGoogleSignup}
                className="w-full h-14 text-base bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-900 border-2 border-gray-300 hover:border-indigo-400 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                size="lg"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Email Signup - Link to Auth Page */}
              <Button
                asChild
                className="w-full h-12 text-base"
                variant="outline"
              >
                <Link to="/auth?mode=signup&redirect=/pricing">
                  Sign Up with Email <Mail className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="pt-6 space-y-3 text-center border-t-2 border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900">
                    <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Free Forever</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">No Card Needed</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900">
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    Join 1,000+ founders building their ideas
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth?mode=login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky Bottom Upgrade Bar - Show after signup for free users */}
      {user && !isPremium && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <span className="font-semibold text-sm sm:text-base">
                Upgrade: ₹999/year • 30+ Ideas + Build Tools
              </span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm" className="h-9">
                <Link to="/pricing">Learn More</Link>
              </Button>
              <Button asChild size="sm" className="bg-white text-orange-600 hover:bg-gray-100 h-9">
                <Link to="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container max-w-4xl mx-auto px-4 py-12 sm:py-16 relative">
          {/* Live Counter - Animated */}
          <div className="flex items-center justify-center gap-2 mb-6 animate-pulse">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.floor(Math.random() * 200) + 100} founders reading now
            </span>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg">
              🎄 Idea of the Day
            </Badge>
          </div>

          {/* Main Title - Enhanced */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-center bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
            {ideaOfTheDay.title}
          </h1>

          {/* Subtitle/Value Prop */}
          <p className="text-lg sm:text-xl text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Validated startup idea with market research, revenue models, and step-by-step build guide
          </p>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Market Validated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Ready to Build</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free Forever</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!user && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12 pb-24">
        {/* Progress Bar */}
        {!user && (
          <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(scrollPosition, 100)}%` }}
            />
          </div>
        )}

        {/* Key Metrics - Enhanced with Hover Effects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <Card className="border-2 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {ideaOfTheDay.tam_value?.split('|')[0] || '₹500Cr+'}
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Market Size</div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-950">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">2-4 wks</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Launch Time</div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-950">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">8.5/10</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Viability</div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medium</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Difficulty</div>
            </CardContent>
          </Card>
        </div>

        {/* Free Teaser Content - Enhanced */}
        <div className="space-y-8 mb-12">
          <Card className="border-2 border-indigo-100 dark:border-indigo-900 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-950">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                The Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-3">
                {renderMarkdownBold(ideaOfTheDay.description?.substring(0, 300) + '...')}
              </div>
            </CardContent>
          </Card>

          {!user && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-background px-6 py-4 rounded-full border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Keep scrolling to unlock full analysis
                  </p>
                  <div className="flex justify-center">
                    <ChevronDown className="h-6 w-6 text-indigo-500 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gated Content - Shows after signup */}
        {user && (
          <div className="space-y-6">
            {/* Full Description */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Idea Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="leading-relaxed space-y-3">
                  {renderMarkdownBold(ideaOfTheDay.description || '')}
                </div>
              </CardContent>
            </Card>

            {/* Market Opportunity */}
            {ideaOfTheDay.overall_oppurtunity_reasoning_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderMarkdownBold(ideaOfTheDay.overall_oppurtunity_reasoning_summary)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Upsell Card */}
            {!isPremium && (
              <Card className="border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Crown className="h-6 w-6" />
                    Want to Build This Idea?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-amber-900/80 dark:text-amber-100/80">
                    Unlock Premium to get AI-powered build tools, complete revenue models, and 30+ more validated startup ideas.
                  </p>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>AI MVP Builder & Landing Page Generator</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Email Sequences & Ad Creative Templates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>30+ More Validated Ideas + Daily Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Complete Revenue & TAM Projections</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button asChild className="flex-1 bg-amber-600 hover:bg-amber-700">
                      <Link to="/pricing">
                        <Crown className="mr-2 h-4 w-4" />
                        Unlock for ₹999/year
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link to="/archive">Preview 30+ Ideas</Link>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    🎁 Holiday Special: Save ₹3,000 (Limited Time)
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Target Audience */}
            {ideaOfTheDay.papu && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {renderMarkdownBold(ideaOfTheDay.papu)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Features - Locked for Free Users */}
            {!isPremium && (
              <>
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center p-6">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to access build tools and complete market analysis
                      </p>
                      <Button asChild>
                        <Link to="/pricing">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Revenue Model & Build Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="blur-sm select-none">
                    <p className="leading-relaxed">
                      This section contains detailed revenue projections, pricing strategies, and step-by-step implementation guides...
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Final CTA - Bottom */}
        {!user && (
          <div className="mt-12 text-center">
            <Card className="border-2 border-primary">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Build Your Startup?</h3>
                <p className="text-muted-foreground mb-6">
                  Sign up free to unlock the complete idea analysis and start building today
                </p>
                <Button onClick={() => setShowSignupModal(true)} size="lg" className="w-full sm:w-auto">
                  Get Free Access Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
