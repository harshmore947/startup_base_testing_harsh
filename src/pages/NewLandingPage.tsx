import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  ArrowRight,
  Mail,
  Rocket,
  Search,
  TrendingUp,
  Users,
  Target,
  Clock,
  BarChart,
  Database,
  FileText,
  Zap,
  Star,
  ChevronDown,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { useIdeaOfTheDay } from '@/hooks/useIdeaOfTheDay';

// Count-up animation hook
const useCountUpAnimation = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animatedTarget = useRef<number | null>(null);

  useEffect(() => {
    // Don't animate if target is 0 or if we've already animated to this target
    if (target === 0 || animatedTarget.current === target) {
      if (target === 0) setCount(0);
      return;
    }

    // Mark this target as being animated
    animatedTarget.current = target;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration]);

  return { count, ref };
};

// Count-up animation hook for ranges
const useCountUpAnimationRange = (targetLower: number, targetUpper: number, duration: number = 2000) => {
  const [countLower, setCountLower] = useState(0);
  const [countUpper, setCountUpper] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animatedTargets = useRef<{ lower: number | null; upper: number | null }>({ lower: null, upper: null });

  useEffect(() => {
    // Don't animate if both targets are 0 or if we've already animated to these targets
    if ((targetLower === 0 && targetUpper === 0) ||
        (animatedTargets.current.lower === targetLower && animatedTargets.current.upper === targetUpper)) {
      if (targetLower === 0 && targetUpper === 0) {
        setCountLower(0);
        setCountUpper(0);
      }
      return;
    }

    // Mark these targets as being animated
    animatedTargets.current = { lower: targetLower, upper: targetUpper };

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      setCountLower(Math.floor(easeOutCubic * targetLower));
      setCountUpper(Math.floor(easeOutCubic * targetUpper));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [targetLower, targetUpper, duration]);

  return { countLower, countUpper, ref };
};

// Parse metric value helper
const parseMetricValue = (value: string | null) => {
  if (!value) return { display: '--', numeric: 0, numericUpper: 0, unit: '', isRange: false };

  const parts = value.split('|');

  // OLD FORMAT: [Text]|[Number]|[Unit] (3 parts)
  if (parts.length === 3) {
    return {
      display: parts[0] || '--',
      numeric: parseInt(parts[1]) || 0,
      numericUpper: 0,
      unit: parts[2] || '',
      isRange: false
    };
  }

  // NEW FORMAT: [Text]|[Lower]|[Upper]|[Unit] (4 parts)
  if (parts.length === 4) {
    const lower = parseInt(parts[1]) || 0;
    const upper = parseInt(parts[2]) || 0;
    return {
      display: parts[0] || '--',
      numeric: lower,
      numericUpper: upper,
      unit: parts[3] || '',
      isRange: true
    };
  }

  // Fallback
  return { display: '--', numeric: 0, numericUpper: 0, unit: '', isRange: false };
};

// Mini Idea Preview Component
const MiniIdeaPreview = () => {
  // Fetch idea of the day using centralized hook
  const { data: ideaOfTheDay, isLoading } = useIdeaOfTheDay();

  // Parse TAM data from Supabase
  const tam = parseMetricValue(ideaOfTheDay?.tam_value || null);

  // Hardcoded revenue potential: 45-60 Crores for all ideas (only when data is loaded)
  const revenue = ideaOfTheDay ? {
    display: '₹45-60 Crores ARR by Year 3',
    numeric: 45,
    numericUpper: 60,
    unit: 'Crore',  // Singular so the replace adds 's' correctly
    isRange: true
  } : {
    display: '--',
    numeric: 0,
    numericUpper: 0,
    unit: '',
    isRange: false
  };

  // Setup count-up animations
  const tamCounter = useCountUpAnimation(tam.numeric);

  // Revenue counter with hardcoded values (only animates when data is loaded)
  const revenueCounter = useCountUpAnimationRange(revenue.numeric, revenue.numericUpper);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          <div className="space-y-4 mt-8">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ideaOfTheDay) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-indigo-100 dark:border-indigo-800 text-center">
        <p className="text-gray-600 dark:text-gray-400">No idea available today. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge */}
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg">
        🎄 Today's Validated Idea
      </Badge>

      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
        {ideaOfTheDay.title}
      </h3>

      {/* TAM Card */}
      <div
        ref={tamCounter.ref}
        className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">Market Size</span>
        </div>
        <div className="text-4xl md:text-5xl font-bold mb-2">
          ₹{tamCounter.count > 0 ? tamCounter.count.toLocaleString('en-IN') : '--'}
        </div>
        {tam.unit && (
          <div className="text-xl font-semibold opacity-95">{tam.unit.replace('Crore', 'Crores')}</div>
        )}
      </div>

      {/* Revenue Card */}
      <div
        ref={revenueCounter.ref}
        className="bg-gradient-to-br from-orange-500 via-pink-600 to-rose-700 text-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium opacity-90">Revenue Potential</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold mb-1 leading-tight">
          <div className="text-lg opacity-90 mb-1">ARR</div>
          {revenue.numeric > 0 ? (
            revenue.isRange ? (
              <>
                ₹{revenueCounter.countLower.toLocaleString('en-IN')}
                <span className="mx-1">-</span>
                ₹{revenueCounter.countUpper.toLocaleString('en-IN')}
              </>
            ) : (
              <>
                ₹{revenueCounter.countLower.toLocaleString('en-IN')}
              </>
            )
          ) : (
            <>{revenue.display || '--'}</>
          )}
        </div>
        {revenue.unit && (
          <div className="text-xl font-semibold opacity-95">
            {revenue.unit.replace(/Crore/g, 'Crores').replace(/Lakh/g, 'Lakhs')} by Year 3
          </div>
        )}
      </div>

      {/* CTA */}
      <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-base h-12">
        <Link to="/new-idea">
          See Full Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

export default function NewLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left Column - 60% */}
            <div className="lg:col-span-3 space-y-8">
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-4 py-2 text-sm font-semibold">
                🎯 NEW: Daily AI-Researched Ideas
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Launch Your First Business in 45 Days With Validated Ideas & AI Tools (Zero Guesswork)
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Stop researching forever. Get a fully validated startup idea daily with market data, feasibility scores & AI tools that build your business in hours.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Data-backed startup idea delivered every morning
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    AI-powered tools build your business in hours, not months
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    365+ validated ideas with market trends included
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all"
                >
                  <Link to="/auth?mode=signup">
                    Get Today's Validated Startup Idea Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No credit card required. Explore unlimited ideas for free.
                </p>
              </div>
            </div>

            {/* Right Column - 40% - Mini Idea Preview */}
            <div className="lg:col-span-2">
              <MiniIdeaPreview />
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - PAIN + BENEFIT */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Headline */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Most Aspiring Entrepreneurs Waste 6+ Months
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">
                Researching Ideas That Never Launch
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Here's why you won't be one of them
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="relative grid md:grid-cols-2 gap-12 md:gap-8 items-start mb-16">
            {/* Left Side - Problems */}
            <div>
              {/* Header Badge */}
              <div className="mb-6 flex items-center justify-center md:justify-start">
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                  WITHOUT STARTUP BASE
                </Badge>
              </div>

              {/* Problem Points */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Endless Googling</h4>
                    <p className="text-gray-600 dark:text-gray-400">Months spent on YouTube videos, blog posts, and scattered research that leads nowhere</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Analysis Paralysis</h4>
                    <p className="text-gray-600 dark:text-gray-400">Second-guessing every idea, frozen by uncertainty and fear of failure</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">No Real Data</h4>
                    <p className="text-gray-600 dark:text-gray-400">Making decisions based on gut feelings instead of market validation</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">6+ Months Wasted</h4>
                    <p className="text-gray-600 dark:text-gray-400">Time that could have been spent building, testing, and earning</p>
                  </div>
                </div>
              </div>

              {/* Meanwhile Callout */}
              <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-600 rounded-r-lg">
                <p className="text-orange-900 dark:text-orange-200 font-semibold italic">
                  Meanwhile, others are launching and making money...
                </p>
              </div>
            </div>

            {/* Vertical Divider with VS */}
            <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 items-center justify-center -translate-x-1/2">
              <div className="bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent h-full w-px"></div>
              <div className="absolute bg-white dark:bg-gray-900 px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">VS</span>
              </div>
            </div>

            {/* Right Side - Solutions */}
            <div>
              {/* Header Badge */}
              <div className="mb-6 flex items-center justify-center md:justify-start">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                  WITH STARTUP BASE
                </Badge>
              </div>

              {/* Solution Points */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Complete Market Analysis</h4>
                    <p className="text-gray-600 dark:text-gray-400">Real demand, trends, and competitor insights delivered daily</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Feasibility Scores</h4>
                    <p className="text-gray-600 dark:text-gray-400">Know exactly if it's doable before you invest a single rupee</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue Projections</h4>
                    <p className="text-gray-600 dark:text-gray-400">Realistic earnings potential with data-backed calculations</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Build in Hours, Not Months</h4>
                    <p className="text-gray-600 dark:text-gray-400">AI tools turn validated ideas into reality the same day</p>
                  </div>
                </div>
              </div>

              {/* Success Callout */}
              <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 dark:border-green-600 rounded-r-lg">
                <p className="text-green-900 dark:text-green-200 font-semibold">
                  ✓ Launch within 45 days with complete confidence
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all">
              <a href="#how-it-works">
                See How It Works
                <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Headline */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
              🎯 PROVEN RESULTS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Join 1,200+ Indians
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Who Stopped Planning & Started Building
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real entrepreneurs getting real results with validated ideas and AI tools
            </p>
          </div>

          {/* Stats - Enhanced with gradients */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 hover:scale-105 transition-transform duration-300 shadow-2xl">
              <CardContent className="p-8 text-center relative z-10">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-4xl md:text-5xl font-bold mb-2">365+</div>
                <div className="text-lg font-semibold mb-2 opacity-90">Validated Ideas</div>
                <p className="text-sm opacity-75">Market-tested opportunities ready to launch</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-pink-600 text-white border-0 hover:scale-105 transition-transform duration-300 shadow-2xl">
              <CardContent className="p-8 text-center relative z-10">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-4xl md:text-5xl font-bold mb-2">3.5 Hrs</div>
                <div className="text-lg font-semibold mb-2 opacity-90">Average Launch Time</div>
                <p className="text-sm opacity-75">From idea to live product using AI tools</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 hover:scale-105 transition-transform duration-300 shadow-2xl">
              <CardContent className="p-8 text-center relative z-10">
                <Rocket className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <div className="text-4xl md:text-5xl font-bold mb-2">82%</div>
                <div className="text-lg font-semibold mb-2 opacity-90">Launch Success Rate</div>
                <p className="text-sm opacity-75">Members launch within 60 days</p>
              </CardContent>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            </Card>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm italic mb-4 text-gray-700 dark:text-gray-300">
                  "I wasted 4 months trying to find the 'perfect' idea. Startup Base gave me 3 validated options in my first week. I launched in 12 days using their AI tools and got my first customer within 3 weeks."
                </p>
                <p className="font-bold">Rahul Sharma</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">SaaS Founder, Mumbai</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm italic mb-4 text-gray-700 dark:text-gray-300">
                  "The daily idea emails completely changed how I think about entrepreneurship. Instead of overthinking, I picked an idea with strong feasibility scores and built it over a weekend. Already generating ₹45,000/month."
                </p>
                <p className="font-bold">Priya Mehta</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">E-commerce Store Owner, Bangalore</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm italic mb-4 text-gray-700 dark:text-gray-300">
                  "Their custom research service validated MY idea with real market data. Saved me from building something nobody wanted. Now I'm focused on an opportunity that actually works."
                </p>
                <p className="font-bold">Arjun Patel</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">App Developer, Delhi</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-green-700">
              <Link to="/auth?mode=signup">
                Get Your First Validated Idea Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* VALUE PROP 1: Daily Idea Delivery */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                ✉️ DAILY DELIVERY
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Wake Up to Fresh Ideas
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Every Morning
                </span>
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Never run out of winning startup opportunities. Get a complete, validated business idea delivered to your inbox daily.
              </p>

              {/* Feature bullets with icons */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Complete Market Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trends, feasibility, competitors, and timing insights</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Ready to Build</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pick ideas matching your skills and launch with AI tools</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Zero Decision Paralysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No more "what should I build?" — just start</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-xl">
                  <Link to="/auth?mode=signup">
                    Get Today's Idea Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/new-idea">
                    See Sample Idea
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Visual - Enhanced Email Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Email header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Today's Validated Idea</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Startup Base • Every morning at 8 AM</p>
                  </div>
                </div>

                {/* Email content preview */}
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded w-full animate-pulse animation-delay-200" />
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded w-5/6 animate-pulse animation-delay-400" />

                  <div className="pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">Market Size</p>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">₹500Cr+</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-semibold text-orange-900 dark:text-orange-200">Revenue</p>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-300">₹45-60Cr</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg p-3 text-center font-semibold shadow-lg">
                    View Full Analysis →
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
                365+ Ideas/Year
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 2: 6-Point Framework */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-40 left-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Right side - Content (showing first on mobile) */}
            <div className="order-1 md:order-2">
              <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                📊 6-POINT VALIDATION
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Complete Market Analysis
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  With Every Single Idea
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="text-xl">
                  Get trends, feasibility, community insights & the perfect timing to launch confidently.
                </p>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-l-4 border-indigo-500 rounded-r-lg p-6">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200 text-xl">
                    This is the same research consultants charge ₹50,000+ to deliver.
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-300 mt-2">
                    You get it for free every single day.
                  </p>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                  Every idea goes through our proprietary 6-point validation framework. Launch with confidence knowing your idea is backed by real market validation, not guesswork.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl">
                  <Link to="/new-idea">
                    See Sample Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/auth?mode=signup">
                    Get Today's Idea Free
                  </Link>
                </Button>
              </div>
            </div>

            {/* Left side - Framework Grid */}
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-2 gap-4">
                {/* Trends Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Trends</h4>
                    <p className="text-sm opacity-90">What's gaining momentum right now</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>

                {/* Feasibility Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-emerald-700 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Feasibility</h4>
                    <p className="text-sm opacity-90">Can you actually build this</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>

                {/* Opportunity Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Opportunity</h4>
                    <p className="text-sm opacity-90">Market gaps competitors miss</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>

                {/* Community Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-cyan-700 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Community</h4>
                    <p className="text-sm opacity-90">Who wants this & how to reach them</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>

                {/* Why Now Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-pink-600 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <Clock className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Why Now</h4>
                    <p className="text-sm opacity-90">Perfect timing indicators</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>

                {/* Data-Backed Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500 to-rose-700 text-white hover:scale-105 transition-transform duration-300 shadow-xl group">
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                      <BarChart className="h-7 w-7 text-white" />
                    </div>
                    <h4 className="font-bold mb-2 text-lg">Data-Backed</h4>
                    <p className="text-sm opacity-90">Real numbers, not guesses</p>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 3: One-Click AI Build */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-pink-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                ⚡ AI-POWERED BUILD
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Launch in Hours
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Using Ready-Made AI Tools
                </span>
              </h2>

              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                No coding required. No technical skills needed. Just click, copy, and build.
              </p>

              {/* Feature Grid */}
              <div className="grid gap-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100 dark:border-purple-900">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Pre-Written AI Prompts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Optimized for ChatGPT, Claude & other AI tools</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-pink-100 dark:border-pink-900">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">One-Click Tool Access</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Direct links to logo makers, website builders & more</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-indigo-100 dark:border-indigo-900">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Step-by-Step Guides</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Detailed instructions for every build component</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-orange-100 dark:border-orange-900">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Template Resources</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ready-to-use templates to speed up execution</p>
                  </div>
                </div>
              </div>

              {/* Highlight callout */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-l-4 border-purple-500 rounded-r-lg p-6 mb-8">
                <p className="font-bold text-purple-900 dark:text-purple-200 text-xl">
                  What used to take months now takes hours.
                </p>
                <p className="text-purple-800 dark:text-purple-300 mt-2">
                  Average build time: Just 3.5 hours from idea to launch
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl">
                  <Link to="/build-this-idea">
                    See the AI Build System
                    <Zap className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/new-idea">
                    Try a Sample Idea
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Visual - Enhanced Mockup */}
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Build This Idea</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Launch Kit</p>
                  </div>
                </div>

                {/* Tool cards */}
                <div className="space-y-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <p className="font-semibold text-purple-900 dark:text-purple-200 text-sm">Logo & Brand Design</p>
                    </div>
                    <div className="h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700 w-full animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <p className="font-semibold text-pink-900 dark:text-pink-200 text-sm">Website Builder</p>
                    </div>
                    <div className="h-2 bg-pink-200 dark:bg-pink-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-rose-700 w-2/3 animate-pulse animation-delay-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <p className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Marketing Copy</p>
                    </div>
                    <div className="h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 w-5/6 animate-pulse animation-delay-400" />
                    </div>
                  </div>
                </div>

                {/* CTA in mockup */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 text-center font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  Launch Your Business Now →
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                3.5 Hours Avg
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
                No Code Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 4: 365+ Database */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Visual */}
            <div className="order-2 md:order-1 relative">
              {/* Main database card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Idea Database</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">365+ Validated Opportunities</p>
                  </div>
                </div>

                {/* Idea cards preview */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        AI
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">AI-Powered SaaS Tool</p>
                        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">High Feasibility</span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded">₹50Cr TAM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        D2C
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-purple-900 dark:text-purple-200 text-sm mb-1">Sustainable E-commerce</p>
                        <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400">
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">Medium Feasibility</span>
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded">₹100Cr TAM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                        B2B
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-orange-900 dark:text-orange-200 text-sm mb-1">Service Marketplace</p>
                        <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-400">
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">High Feasibility</span>
                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">₹80Cr TAM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">+ 362 more validated ideas</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
                365+ Ideas
              </div>
            </div>

            {/* Right side - Content */}
            <div className="order-1 md:order-2">
              <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                🗂️ IDEA LIBRARY
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  365+ Validated Ideas
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Pick Your Perfect Match
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="text-xl">
                  Not every idea will resonate with you. And that's perfectly okay.
                </p>

                <p>
                  Get instant access to a full year of fully researched startup opportunities spanning every industry:
                </p>

                {/* Industry tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full text-blue-900 dark:text-blue-200 font-semibold text-sm border border-blue-200 dark:border-blue-800">
                    SaaS & Tech
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full text-purple-900 dark:text-purple-200 font-semibold text-sm border border-purple-200 dark:border-purple-800">
                    E-commerce & D2C
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full text-green-900 dark:text-green-200 font-semibold text-sm border border-green-200 dark:border-green-800">
                    Content & Creator
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full text-orange-900 dark:text-orange-200 font-semibold text-sm border border-orange-200 dark:border-orange-800">
                    Service Businesses
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full text-cyan-900 dark:text-cyan-200 font-semibold text-sm border border-cyan-200 dark:border-cyan-800">
                    Local & Hyperlocal
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full text-indigo-900 dark:text-indigo-200 font-semibold text-sm border border-indigo-200 dark:border-indigo-800">
                    B2B Solutions
                  </span>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border-l-4 border-indigo-500 rounded-r-lg p-6">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">
                    Filter by feasibility, revenue potential, or time-to-launch.
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-300 mt-2">
                    Find the perfect match for YOUR situation, skills, and goals.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-xl">
                  <Link to="/archive">
                    Browse Idea Database
                    <Search className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/auth?mode=signup">
                    Start Free Today
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 5: Custom Research */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-white via-green-50 to-emerald-50 dark:from-gray-900 dark:via-green-950 dark:to-emerald-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-green-300 dark:bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                🔍 CUSTOM VALIDATION
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Validate Your Own Idea
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Before You Build It
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="text-xl">
                  Already have an idea you're passionate about?
                </p>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-l-4 border-red-500 rounded-r-lg p-6">
                  <p className="font-bold text-red-900 dark:text-red-200 text-xl">
                    Don't launch blindly.
                  </p>
                  <p className="text-red-800 dark:text-red-300 mt-2">
                    Get it professionally validated first and save months of wasted effort.
                  </p>
                </div>

                <p>
                  Our Custom Research Service applies the same 6-point validation framework to YOUR specific idea:
                </p>

                {/* Features Grid */}
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-100 dark:border-green-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Market Demand Analysis</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-100 dark:border-green-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Competitor Landscape & Gaps</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-100 dark:border-green-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Feasibility & Technical Assessment</p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-100 dark:border-green-900">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Revenue Projections & Business Model</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-500 rounded-r-lg p-6">
                  <p className="font-bold text-green-900 dark:text-green-200">
                    Know if it's worth building BEFORE you invest time and money.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl">
                  <Link to="/research-my-idea">
                    Validate My Idea
                    <FileText className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/new-idea">
                    See Sample Report
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Visual - Research Report Mockup */}
            <div className="relative">
              {/* Main report card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Validation Report</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your Custom Analysis</p>
                  </div>
                </div>

                {/* Report sections */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-green-900 dark:text-green-200 text-sm">Market Demand</p>
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">HIGH</span>
                    </div>
                    <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 w-5/6" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Feasibility Score</p>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold">78/100</span>
                    </div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 w-3/4" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-purple-900 dark:text-purple-200 text-sm">Revenue Potential</p>
                      <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-bold">₹45Cr+</span>
                    </div>
                    <div className="h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 w-4/5" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-orange-900 dark:text-orange-200 text-sm">Competition Level</p>
                      <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-bold">MEDIUM</span>
                    </div>
                    <div className="h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-600 w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 text-center font-semibold shadow-lg">
                  Download Full Report →
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
                48hr Delivery
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
                ₹2,999 Only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP 6: Free Exploration */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 dark:from-gray-800 dark:via-green-900 dark:to-emerald-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-green-300 dark:bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Pricing Card */}
            <div className="order-2 md:order-1">
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">Free vs Paid Features</h3>

                <div className="space-y-6">
                  {/* Free tier */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-6 border-2 border-green-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 dark:text-green-200 text-lg">Free Forever</h4>
                        <p className="text-sm text-green-700 dark:text-green-400">No credit card required</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">Daily idea summaries delivered to inbox</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">Market trend insights & analysis</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">Browse complete idea archive</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium tier */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-6 border-2 border-indigo-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-lg">Premium</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">₹999/month or ₹9,999/year</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">Full research reports with all data</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">AI build tools & optimized prompts</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">365+ idea database full access</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-gray-100">Custom research service (₹2,999)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full shadow-lg font-bold text-xs">
                  RISK-FREE
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="order-1 md:order-2">
              <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
                🆓 TRY BEFORE YOU BUY
              </Badge>

              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Explore Ideas Free
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Pay Only When Ready
                </span>
              </h2>

              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="text-xl">
                  We believe you should see the value before you pay.
                </p>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-l-4 border-green-500 rounded-r-lg p-6">
                  <p className="font-bold text-green-900 dark:text-green-200 text-xl">
                    The Idea of the Day is completely free forever.
                  </p>
                  <ul className="mt-3 space-y-2 text-green-800 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      No credit card required
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      No trial limits or expiration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      No pressure or hidden fees
                    </li>
                  </ul>
                </div>

                <p>
                  Get a fully researched startup opportunity in your inbox every morning. Read it. Analyze it. Get inspired.
                </p>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-l-4 border-indigo-500 rounded-r-lg p-6">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200 text-xl mb-2">
                    Only pay when you're ready to build.
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-300">
                    Zero risk. All upside. Maximum flexibility.
                  </p>
                </div>

                <p className="text-base text-gray-600 dark:text-gray-400 italic">
                  Join 1,200+ aspiring entrepreneurs who started with free ideas and now have profitable businesses.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl">
                  <Link to="/auth?mode=signup">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
                  <Link to="/new-idea">
                    See Sample Idea
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Startup Base Works When Everything Else Fails
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Stop wasting time on methods that keep you stuck in research mode
            </p>
            <Button asChild size="lg">
              <Link to="/auth?mode=signup">
                Get Started With Validated Ideas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-4 text-left font-bold">Feature</th>
                  <th className="p-4 text-center font-bold bg-green-100 dark:bg-green-900">Startup Base</th>
                  <th className="p-4 text-center font-bold">YouTube "Gurus"</th>
                  <th className="p-4 text-center font-bold">Business Courses</th>
                  <th className="p-4 text-center font-bold">DIY Research</th>
                  <th className="p-4 text-center font-bold">Generic AI Tools</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Daily validated ideas delivered to you</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Complete market analysis with data</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌ <span className="text-xs text-gray-500">(opinions only)</span></td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">⚠️ <span className="text-xs text-gray-500">(if you know how)</span></td>
                  <td className="p-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">AI tools that actually build for you</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">⚠️ <span className="text-xs text-gray-500">(requires expertise)</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">365+ idea database to choose from</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Feasibility scores & timing indicators</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Custom idea validation service</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Zero cost to explore ideas</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">⚠️ <span className="text-xs text-gray-500">(free but low quality)</span></td>
                  <td className="p-4 text-center">❌ <span className="text-xs text-gray-500">(pay upfront)</span></td>
                  <td className="p-4 text-center">✅ <span className="text-xs text-gray-500">(but time-consuming)</span></td>
                  <td className="p-4 text-center">⚠️ <span className="text-xs text-gray-500">(subscription fees)</span></td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">Launch-ready in hours, not months</td>
                  <td className="p-4 text-center bg-green-50 dark:bg-green-900/20">✅</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Go From "What Should I Build?" to "I'm Launching Today" in 3 Simple Steps
          </h2>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Get Your Daily Validated Idea</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Wake up to a fully researched startup opportunity in your inbox. Complete with market analysis, feasibility scores, trends, and timing indicators. Read it over coffee. Takes 5 minutes.
                </p>
              </div>
              <Mail className="h-12 w-12 text-indigo-600 hidden md:block" />
            </div>

            {/* Connector */}
            <div className="ml-8 border-l-4 border-dashed border-indigo-300 h-8"></div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Pick an Idea That Excites You</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Browse your favorite daily ideas or explore our 365+ idea database. Filter by industry, feasibility, or revenue potential. Find the perfect opportunity that matches your skills and passion.
                </p>
              </div>
              <Search className="h-12 w-12 text-purple-600 hidden md:block" />
            </div>

            {/* Connector */}
            <div className="ml-8 border-l-4 border-dashed border-purple-300 h-8"></div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Build It With AI in Hours</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Click "Build This Idea" and instantly access pre-written AI prompts, tool links, and step-by-step guides. Follow the prompts, use the tools, and watch your business come to life. Launch the same day.
                </p>
              </div>
              <Rocket className="h-12 w-12 text-pink-600 hidden md:block" />
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 h-16 px-12 text-lg">
              <Link to="/auth?mode=signup">
                Start With Step #1 Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                How is this different from just googling business ideas?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Googling gives you surface-level blog posts with generic suggestions. Startup Base delivers fully researched, data-backed opportunities with market analysis, feasibility scores, competitor insights, and AI build tools. We do months of research for you every single day so you can launch, not just read.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                Do I need technical skills or coding experience?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Absolutely not. Our AI build tools and pre-written prompts are designed for complete beginners. You just click the links, paste the prompts into AI tools like ChatGPT, and follow simple steps. No coding required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                What if I already have my own idea?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Perfect! Use our Custom Research Service to get your idea professionally validated with the same 6-point framework. You'll know if it's worth building BEFORE you invest time and money.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                How much does it cost?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The Idea of the Day is completely free forever. You get a fully researched startup opportunity in your inbox every morning at no cost. If you want to build an idea using our AI tools or access the full database, pricing starts at ₹999/month (or ₹9,999/year for full access).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                Can I really launch a business in 45 days?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Yes. Our members average 3.5 hours to build using the AI tools, and 82% of paid members launch within 60 days. The ideas are pre-validated, the tools are ready, and the execution is simplified. You're not starting from zero.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                What industries do your ideas cover?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Everything. SaaS, e-commerce, content, services, local businesses, B2B solutions, creator economy, D2C brands, and more. We deliver diverse opportunities so you can find what fits your strengths.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* URGENCY SECTION */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Every Day You Wait, Someone Else Launches the Opportunity You're Thinking About
          </h2>

          <div className="space-y-6 text-lg leading-relaxed mb-12">
            <p>
              You're reading this because you want to be an entrepreneur.
            </p>
            <p>
              But here's the harsh truth: <strong className="text-yellow-400">ideas have expiration dates.</strong>
            </p>
            <p>
              The market trends we analyze today might shift next month. The opportunity that's perfect NOW might be saturated in 6 months. The competitor gap we identified could close next week.
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              Timing is everything.
            </p>
            <p>
              Right now, there's a validated startup idea sitting in our database that matches your skills perfectly. An idea with strong feasibility, clear demand, and minimal competition.
            </p>
            <p>
              But you'll never know unless you start.
            </p>
            <p>
              The free daily idea email costs you nothing. No credit card. No commitment. Just valuable market insights delivered every morning.
            </p>
            <p className="text-xl font-bold">
              The only thing you risk is staying exactly where you are.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 h-16 px-12 text-lg">
              <Link to="/auth?mode=signup">
                Get My First Validated Idea Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-indigo-200">
              Join 1,200+ aspiring entrepreneurs who chose action over analysis paralysis.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
