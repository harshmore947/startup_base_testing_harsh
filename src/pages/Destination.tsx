import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Check,
  X,
  Crown,
  ChevronDown,
  Star,
  Search,
  BarChart3,
  Target,
  Calendar,
  Clock,
  DollarSign,
  Lightbulb,
  FileText,
  Rocket,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Award,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeroIdeaPreview } from '@/components/HeroIdeaPreview';

const testimonials = [
  {
    name: "Rahul Wadhwani",
    badge: "Early Access User",
    quote: "Honestly, the 'Build This Idea' section saved me months of work. Without learning how to design or code, I still managed to go from just an idea to actually building something real in like a week. Pretty insane tbh.",
    initials: "RW",
    color: "bg-blue-500",
    rating: 5
  },
  {
    name: "Gursimran Singh",
    badge: "Beta User",
    quote: "I've been through so many 'startup idea' sites, but this one actually curated quality ideas. The database helped me explore different niches until I found something that clicked with my background. Worth it.",
    initials: "GS",
    color: "bg-purple-500",
    rating: 4
  },
  {
    name: "Dakshq Baweja",
    badge: "Pro User",
    quote: "I spent 3 months stuck in analysis paralysis trying to pick the 'perfect' idea. This platform gave me the validation I needed to just start. Launched my first MVP in 48 hours. Really glad I found this.",
    initials: "DB",
    color: "bg-green-500",
    rating: 5
  }
];

const faqs = [
  {
    question: "What happens when my free daily access expires?",
    answer: "Your access to the current Idea of the Day expires at 12:00 AM IST. A fresh new idea becomes available each day, so you'll always have something new to explore."
  },
  {
    question: "What's included in the Legal Consultation bonus?",
    answer: "Premium members get a free 30-minute consultation with our legal partners to help you choose the right business structure and understand compliance requirements for your startup."
  },
  {
    question: "How often are new ideas added?",
    answer: "We add a new validated startup idea every single day. Premium members get immediate access to all past and future ideas in our growing database."
  }
];

const painPoints = [
  {
    icon: Search,
    title: "You don't know which idea is actually worth building",
    description: "Endless scrolling through generic listicles with no validation"
  },
  {
    icon: DollarSign,
    title: "You don't know if Indians will pay for it",
    description: "Global ideas that don't translate to Indian market realities"
  },
  {
    icon: Target,
    title: "You don't know how to go from idea → execution",
    description: "No clear roadmap, just vague 'start here' advice"
  },
  {
    icon: Clock,
    title: "You don't know what to do first, second, third",
    description: "Paralyzed by options, stuck in planning mode forever"
  }
];

const stuckBehaviors = [
  "Overthinking",
  "Starting and stopping",
  "Waiting for the 'perfect idea'"
];

const features = [
  {
    icon: Lightbulb,
    title: "Validated Startup Ideas (Weekly)",
    description: "Researched, validated ideas delivered fresh every week"
  },
  {
    icon: BarChart3,
    title: "Market Research & Demand Analysis",
    description: "Real data on TAM, demand metrics, and market opportunity"
  },
  {
    icon: DollarSign,
    title: "Revenue Models & Pricing Strategy",
    description: "Clear monetization paths with India-specific pricing insights"
  },
  {
    icon: Rocket,
    title: "Execution Roadmaps (Step-by-Step)",
    description: "Actionable plans from day 0 to launch in 45 days"
  },
  {
    icon: Zap,
    title: "AI Tools for Research & Planning",
    description: "Leverage AI to accelerate your market research and strategy"
  },
  {
    icon: FileText,
    title: "Idea Archives",
    description: "Access 30+ validated ideas to explore at your own pace"
  },
  {
    icon: Shield,
    title: "Launch Checklists",
    description: "Never miss a critical step with our proven launch frameworks"
  }
];

const comparisonFeatures = [
  {
    label: "Validated ideas delivered to you",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: false
  },
  {
    label: "Custom-built AI tools",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: "partial"
  },
  {
    label: "AI tools that actually build for you",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: false
  },
  {
    label: "365+ idea database to choose from",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: false
  },
  {
    label: "Feasibility scores and calculators",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: "partial",
    genericAI: false
  },
  {
    label: "Custom idea validation service",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: false
  },
  {
    label: "India-specific market insights",
    startupBase: true,
    youtube: "partial",
    courses: false,
    diy: false,
    genericAI: false
  },
  {
    label: "Launch-ready in hours, not months",
    startupBase: true,
    youtube: false,
    courses: false,
    diy: false,
    genericAI: false
  }
];

export default function Destination() {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const { initiatePayment, initiateGuestPayment, isProcessing } = usePayment();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isAutoPaymentMode, setIsAutoPaymentMode] = useState(false);

  // Guest checkout form state
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const paymentTriggered = useRef(false);

  // Combined effect for welcome message and auto-payment
  useEffect(() => {
    const welcome = searchParams.get('welcome');
    const autopay = searchParams.get('autopay');

    // If autopay mode is active and user is logged in, enter auto-payment mode immediately
    if (autopay === 'true' && user) {
      setIsAutoPaymentMode(true);
      console.log('Entering auto-payment mode...');
    }

    // Show welcome message if user just signed up (but not in autopay mode)
    if (user && welcome === 'true' && autopay !== 'true') {
      setShowWelcome(true);
    }

    // Auto-trigger payment if user just signed up with autopay intent
    if (
      autopay === 'true' &&
      user &&
      !profileLoading &&
      userProfile !== undefined &&
      !isPremium &&
      !isProcessing &&
      !paymentTriggered.current
    ) {
      // Mark as triggered to prevent duplicates
      paymentTriggered.current = true;

      // Clean up URL params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('welcome');
      newParams.delete('autopay');
      const newUrl = newParams.toString() ? `/destination?${newParams.toString()}` : '/destination';
      navigate(newUrl, { replace: true });

      // Trigger payment immediately
      console.log('Auto-triggering payment for new user...');
      initiatePayment();
    }

    // If profile loads and user is already premium, exit autopay mode
    if (autopay === 'true' && user && !profileLoading && isPremium) {
      setIsAutoPaymentMode(false);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('autopay');
      newParams.delete('welcome');
      const newUrl = newParams.toString() ? `/destination?${newParams.toString()}` : '/destination';
      navigate(newUrl, { replace: true });
    }
  }, [user, userProfile, profileLoading, isPremium, isProcessing, searchParams, navigate, initiatePayment]);

  // Reset payment trigger when component unmounts
  useEffect(() => {
    return () => {
      paymentTriggered.current = false;
    };
  }, []);

  const handleCTA = () => {
    if (!user) {
      // Guest checkout - show form to collect email/name
      setShowGuestForm(true);
      // Scroll to form smoothly
      setTimeout(() => {
        document.getElementById('guest-checkout-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } else if (!isPremium) {
      initiatePayment();
    }
  };

  const handleGuestCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail || !guestName) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and name to continue.",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    initiateGuestPayment({
      email: guestEmail,
      billing_name: guestName,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - New Hybrid Design (Option A + F) */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Auto-Payment Loading State */}
          {isAutoPaymentMode && (
            <div className="mb-8 animate-fade-in text-center">
              <div className="inline-flex flex-col items-center gap-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-8 py-6">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-xl font-bold text-indigo-900 mb-2">
                    Redirecting to Payment Gateway...
                  </p>
                  <p className="text-sm text-indigo-700">
                    Please wait while we prepare your payment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {showWelcome && user && !isPremium && !isAutoPaymentMode && (
            <div className="mb-8 animate-fade-in text-center">
              <Badge className="bg-green-500 text-white text-sm px-4 py-2 mb-4">
                🎉 Welcome! You're almost there...
              </Badge>
              <p className="text-lg text-gray-700 mb-4">
                Complete your journey and unlock full access to The Pro Founder
              </p>
            </div>
          )}

          {/* Main Hero Content - Centered Layout */}
          <div className="text-center mt-8 lg:mt-12 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Launch Your First Business
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                in 45 Days
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
              Validated startup ideas, real market research, and execution playbooks for founders who want{' '}
              <span className="font-semibold text-indigo-600">results, not motivation</span>.
            </p>

            {/* CTA Button */}
            {!isAutoPaymentMode && (
              <div className="mb-6 sm:mb-8">
                <Button
                  onClick={handleCTA}
                  disabled={isProcessing || isPremium}
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all rounded-full"
                >
                  {isPremium ? (
                    "You're Already Premium! 🎉"
                  ) : isProcessing ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <span className="flex flex-col gap-1">
                      <span>Join the ProFounder</span>
                      <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 mb-10 sm:mb-12">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {testimonials.slice(0, 3).map((t, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white`}>
                      {t.initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">1,757+ founders</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm font-medium ml-1">4.8/5</span>
              </div>
            </div>
          </div>

          {/* Full Width: Infinite Scrolling Idea Preview */}
          <div className="mt-8">
            <HeroIdeaPreview />
          </div>

          {/* Guest Checkout Form */}
          {showGuestForm && !user && (
            <div className="mt-8 max-w-md mx-auto">
              <Card id="guest-checkout-form" className="border-2 border-indigo-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Complete Your Purchase</CardTitle>
                  <CardDescription className="text-center">
                    Enter your details to proceed to secure payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGuestCheckout} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Full Name</Label>
                      <Input
                        id="guestName"
                        type="text"
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email Address</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send your premium access details and account setup link to this email
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowGuestForm(false)}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing || !guestEmail || !guestName}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Proceed to Payment</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Why Most Founders Stay Stuck - Comparison */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Most Aspiring Entrepreneurs Waste 6+ Months
              </span>
              <br />
              <span className="text-gray-800">
                Researching Ideas That Never Launch
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Here's why you won't be one of them
            </p>
          </div>

          {/* Comparison Grid - Always 2 columns even on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-12 items-stretch mb-8 sm:mb-12">
            {/* Left Side - Problems (WITHOUT) */}
            <div className="flex flex-col">
              <div className="mb-4 sm:mb-6 flex items-center justify-center md:justify-start">
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
                  WITHOUT STARTUP BASE
                </Badge>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Search className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Endless Googling</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Months spent on videos, blog posts, and scattered advice</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Analysis Paralysis</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Frozen by uncertainty and lack of direction</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Target className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Bad Data</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Making decisions on gut feelings instead of market reality</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">6+ Months Wasted</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Time that could have been spent building, testing, and earning</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 sm:pt-8 p-3 sm:p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm sm:text-lg font-bold text-red-800 mb-2 sm:mb-3">Meanwhile, others are launching and making money.</p>
                <p className="text-xs sm:text-base text-gray-700">So you keep: Overthinking • Starting and stopping • Waiting for the "perfect idea"</p>
              </div>
            </div>

            {/* Right Side - Solutions (WITH) */}
            <div className="flex flex-col">
              <div className="mb-4 sm:mb-6 flex items-center justify-center md:justify-start">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold border-0">
                  WITH STARTUP BASE
                </Badge>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Check className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Complete Market Analysis</h4>
                    <p className="text-xs sm:text-sm text-gray-600">TAM, demand insights, and market trends delivered daily</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Feasibility Scores</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Know exactly what to build before you invest a single rupee</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Check className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Revenue Projections</h4>
                    <p className="text-xs sm:text-sm text-gray-600">See revenue potential with data-backed calculations</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Check className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 sm:mb-1">Build in Hours, Not Months</h4>
                    <p className="text-xs sm:text-sm text-gray-600">AI tools that turn validated ideas into reality the same day</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 sm:pt-8 p-3 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-sm sm:text-lg font-bold text-green-900 mb-2">✅ Launch within 45 days with complete confidence</p>
                <p className="text-xs sm:text-base text-gray-700">No guesswork. No wasted time. Just validated ideas and clear execution.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button
              onClick={handleCTA}
              disabled={isProcessing || isPremium}
              size="lg"
              className="h-12 sm:h-14 px-8 sm:px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base sm:text-lg shadow-xl rounded-full"
            >
              <span className="flex flex-col gap-1">
                <span>Join the ProFounder</span>
                <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: Why Most Founders Fail */}
      <section className="py-6 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-1 sm:mb-3">
              Why Most Founders Fail
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Stop wasting time on methods that keep you stuck
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-10">
            <Card className="text-center p-2 sm:p-5 border border-red-200 sm:border-2 bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-3 rounded-full bg-red-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-[10px] sm:text-base mb-0.5 sm:mb-1.5 text-gray-900">Stop at ideas</h3>
                <p className="text-[8px] sm:text-sm text-gray-600 leading-tight">No validation</p>
              </CardContent>
            </Card>
            <Card className="text-center p-2 sm:p-5 border border-orange-200 sm:border-2 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-8 sm:h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-[10px] sm:text-base mb-0.5 sm:mb-1.5 text-gray-900">Stop at knowledge</h3>
                <p className="text-[8px] sm:text-sm text-gray-600 leading-tight">No application</p>
              </CardContent>
            </Card>
            <Card className="text-center p-2 sm:p-5 border border-purple-200 sm:border-2 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all">
              <CardContent className="p-0">
                <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-1 sm:mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="w-4 h-4 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-[10px] sm:text-base mb-0.5 sm:mb-1.5 text-gray-900">Lack of systems</h3>
                <p className="text-[8px] sm:text-sm text-gray-600 leading-tight">No structure</p>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-2 sm:gap-6 mb-4 sm:mb-8">
            {/* The Harsh Truth */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border border-red-300 sm:border-2 rounded-lg sm:rounded-xl p-2 sm:p-6 shadow-lg">
              <div className="flex items-center gap-1 sm:gap-2.5 mb-2 sm:mb-4">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-[10px] sm:text-xl font-bold text-gray-900">
                  HARSH TRUTH
                </h3>
              </div>
              <p className="text-[8px] sm:text-sm text-gray-600 mb-1 sm:mb-3 italic hidden sm:block">(Most people won't tell you)</p>
              <p className="text-[9px] sm:text-base text-gray-900 mb-1 sm:mb-3 font-semibold">What founders miss:</p>
              <ul className="space-y-0.5 sm:space-y-2">
                {[
                  "Demand validation",
                  "Execution roadmap",
                  "Monetisation clarity",
                  "India insights",
                  "Step-by-step guide"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-1 sm:gap-2.5">
                    <X className="w-2 h-2 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-[8px] sm:text-sm text-gray-700 leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Why Courses Don't Work */}
            <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 border border-gray-300 sm:border-2 rounded-lg sm:rounded-xl p-2 sm:p-6 shadow-lg">
              <div className="flex items-center gap-1 sm:gap-2.5 mb-2 sm:mb-4">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-[10px] sm:text-xl font-bold text-gray-900">
                  WHY COURSES FAIL
                </h3>
              </div>
              <ul className="space-y-1 sm:space-y-3.5">
                {[
                  { text: "Theory not execution", subtext: "You watch but don't know what to do" },
                  { text: "Info not direction", subtext: "Keeps you in learning mode" },
                  { text: "Stories not playbooks", subtext: "Inspiration without action" }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-1 sm:gap-2.5">
                    <X className="w-2 h-2 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 font-semibold text-[9px] sm:text-base mb-0 sm:mb-0.5 leading-tight">{item.text}</p>
                      <p className="text-gray-600 text-[7px] sm:text-xs leading-tight hidden sm:block">{item.subtext}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Callout + CTA Combined */}
          <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 border-0 rounded-xl p-8 shadow-2xl">
            <p className="text-xl text-white mb-2 font-medium">
              You don't need more knowledge.
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
              You need clarity + structure + action
            </p>
            <Button
              onClick={handleCTA}
              disabled={isProcessing || isPremium}
              size="lg"
              className="h-14 px-10 bg-white text-indigo-600 hover:bg-gray-50 font-bold text-base shadow-lg hover:shadow-xl transition-all"
            >
              {isPremium ? (
                "You're Already Premium! 🎉"
              ) : (
                <span className="flex flex-col gap-1">
                  <span>Join the ProFounder</span>
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
                </span>
              )}
            </Button>
            <p className="text-white/90 mt-3 text-sm">
              Start building with validated ideas and clear roadmaps
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Introducing The Pro Founder */}
      <section className="py-6 sm:py-16 lg:py-24 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-indigo-600 mb-2 sm:mb-6 text-xs sm:text-base px-3 sm:px-6 py-1 sm:py-2">
            Introducing
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold mb-2 sm:mb-6">
            THE PRO FOUNDER
          </h2>
          <p className="text-sm sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-8">
            A Complete Founder Operating System
          </p>
          <p className="text-xs sm:text-xl leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-12">
            The Pro Founder is an execution-first platform that helps Indian founders:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-6 max-w-3xl mx-auto text-left mb-4 sm:mb-12">
            {[
              "Discover validated startup ideas",
              "Understand market demand & trends",
              "Follow clear execution roadmaps",
              "Build & launch with confidence"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-1 sm:gap-3 bg-white/10 backdrop-blur rounded-lg p-2 sm:p-4">
                <Check className="w-3 h-3 sm:w-6 sm:h-6 flex-shrink-0 text-green-300" />
                <span className="text-[10px] sm:text-lg leading-tight">{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 sm:space-y-4 text-xs sm:text-xl mb-3 sm:mb-8">
            <p>This is not a course.</p>
            <p>This is not just an idea list.</p>
            <p className="text-sm sm:text-2xl font-bold">👉 This is a Founder System.</p>
          </div>
          <Button
            onClick={handleCTA}
            disabled={isProcessing || isPremium}
            size="lg"
            className="h-10 sm:h-14 px-6 sm:px-12 bg-white text-indigo-600 hover:bg-gray-100 font-bold text-sm sm:text-lg"
          >
            <span className="flex flex-col gap-1">
              <span>Join the ProFounder</span>
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
            </span>
          </Button>
        </div>
      </section>

      {/* Section 5A: What Exactly Is The Pro Founder */}
      <section className="py-6 sm:py-12 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-12">
            <h2 className="text-lg sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-4">
              WHAT EXACTLY IS "THE PRO FOUNDER"?
            </h2>
            <p className="text-sm sm:text-xl lg:text-2xl text-indigo-600 font-bold mb-1 sm:mb-2">
              ProFounder is your Silent Co-Founder
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-4 sm:mb-12">
            <div className="grid grid-cols-3 gap-2 sm:gap-6">
              {[
                { icon: Search, label: "Idea research team", color: "blue" },
                { icon: Target, label: "Strategy consultant", color: "purple" },
                { icon: FileText, label: "Execution checklist", color: "green" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`w-8 h-8 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-1 sm:mb-4 rounded-lg sm:rounded-2xl ${
                    item.color === 'blue' ? 'bg-blue-100' :
                    item.color === 'purple' ? 'bg-purple-100' :
                    item.color === 'green' ? 'bg-green-100' :
                    'bg-orange-100'
                  } flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${
                      item.color === 'blue' ? 'text-blue-600' :
                      item.color === 'purple' ? 'text-purple-600' :
                      item.color === 'green' ? 'text-green-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <p className="font-semibold text-[9px] sm:text-base text-gray-900 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-8 lg:p-12 border border-gray-200 sm:border-2">
            <div className="text-center mb-3 sm:mb-8">
              <p className="text-[10px] sm:text-lg lg:text-xl text-gray-600 mb-1 sm:mb-4">Instead of asking:</p>
              <p className="text-xs sm:text-2xl lg:text-3xl font-bold text-red-600 line-through mb-3 sm:mb-8">
                "What business should I start?"
              </p>
              <div className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Check className="w-4 h-4 sm:w-8 sm:h-8 text-white" />
              </div>
              <p className="text-[10px] sm:text-lg lg:text-xl text-gray-600 mb-1 sm:mb-4">You'll know:</p>
              <p className="text-xs sm:text-2xl lg:text-3xl font-bold text-green-600 leading-tight">
                "This idea has demand, this is the roadmap, this is my next step."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5B: What You Get Inside */}
      <section className="py-6 sm:py-12 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-12">
            <h2 className="text-lg sm:text-3xl lg:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-4">
              What You Get Inside The Pro Founder
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-6 border border-gray-200 sm:border-2 hover:border-indigo-400 hover:shadow-lg transition-all">
                <div className="w-6 h-6 sm:w-12 sm:h-12 mb-1 sm:mb-4 rounded-md sm:rounded-lg bg-indigo-100 flex items-center justify-center">
                  <feature.icon className="w-3 h-3 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-[10px] sm:text-lg text-gray-900 mb-0.5 sm:mb-2 leading-tight">{feature.title}</h3>
                <p className="text-[8px] sm:text-sm text-gray-600 leading-tight sm:leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center mb-4 sm:mb-10">
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-8 border border-gray-200 sm:border-2 shadow-sm">
              <p className="text-xs sm:text-xl font-bold text-gray-900 mb-2 sm:mb-6">
                You don't get vague ideas like "Start a SaaS"
              </p>
              <div className="inline-flex items-center gap-1 sm:gap-3 bg-green-50 px-2 sm:px-6 py-1 sm:py-4 rounded-md sm:rounded-lg">
                <Check className="w-3 h-3 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                <p className="text-[10px] sm:text-lg font-bold text-green-600">
                  You get specific, actionable ideas
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleCTA}
              disabled={isProcessing || isPremium}
              size="lg"
              className="h-14 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl"
            >
              <span className="flex flex-col gap-1">
                <span>Join the ProFounder</span>
                <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 px-4 py-2 text-sm font-semibold mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              From idea to launch in just 3 simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" style={{ width: '80%', marginLeft: '10%' }}></div>

              {[
                {
                  step: "01",
                  title: "Choose a Validated Idea",
                  description: "No guessing. Pick from researched ideas with proven market demand.",
                  icon: Lightbulb,
                  gradient: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50"
                },
                {
                  step: "02",
                  title: "Follow the Execution Roadmap",
                  description: "Do exactly what's outlined in our step-by-step execution plan.",
                  icon: FileText,
                  gradient: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50"
                },
                {
                  step: "03",
                  title: "Build, Launch & Improve",
                  description: "Launch faster, learn faster, earn faster with continuous guidance.",
                  icon: Rocket,
                  gradient: "from-green-500 to-green-600",
                  bgColor: "bg-green-50"
                }
              ].map((item, index) => (
                <div key={index} className="relative z-10">
                  <div className={`${item.bgColor} rounded-2xl p-6 sm:p-8 h-full border-2 border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300`}>
                    {/* Step Number Badge */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-lg sm:text-xl font-bold shadow-lg`}>
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 sm:mb-5">
                      <item.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${
                        index === 0 ? 'text-blue-600' :
                        index === 1 ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button
                onClick={handleCTA}
                disabled={isProcessing || isPremium}
                size="lg"
                className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                {isPremium ? (
                  "You're Already Premium! 🎉"
                ) : (
                  <span className="flex flex-col gap-1">
                    <span>Join the ProFounder</span>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
                  </span>
                )}
              </Button>
              <p className="text-xs sm:text-sm text-gray-600">
                Join 1,757+ founders building with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Who Is This For + Comparison Table */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              WHO IS THIS FOR?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Perfect For */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">This is PERFECT for:</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "First-time founders",
                    "Indian side-hustlers",
                    "Students & professionals",
                    "Builders tired of theory",
                    "People serious about execution"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg text-gray-700">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Not For */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">This is NOT for:</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    '"Get rich quick" seekers',
                    "People who won't take action",
                    "Idea collectors with no intent to build",
                    "Those looking for motivation only"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg text-gray-700">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
            <div className="text-center py-4 sm:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h3 className="text-base sm:text-xl md:text-2xl font-bold px-4 leading-tight">COMPARISON: OTHERS VS THE PRO FOUNDER</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-sm sm:text-base font-bold text-gray-900 min-w-[180px]">
                      Feature
                    </th>
                    <th className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-semibold text-gray-600 min-w-[100px]">
                      YouTube<br />"Gurus"
                    </th>
                    <th className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-semibold text-gray-600 min-w-[100px]">
                      Business<br />Courses
                    </th>
                    <th className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-semibold text-gray-600 min-w-[100px]">
                      DIY<br />Research
                    </th>
                    <th className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-semibold text-gray-600 min-w-[100px]">
                      Generic<br />AI Tools
                    </th>
                    <th className="px-3 sm:px-4 py-4 text-center text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 min-w-[120px]">
                      Startup<br />Base
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonFeatures.map((feature, index) => {
                    const renderIcon = (value: boolean | string) => {
                      if (typeof value === 'boolean') {
                        return value ? (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mx-auto" />
                        );
                      } else if (value === 'partial') {
                        return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto" />;
                      }
                      return null;
                    };

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-sm sm:text-base text-gray-900 font-medium">
                          {feature.label}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center bg-gray-50/50">
                          {renderIcon(feature.youtube)}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          {renderIcon(feature.courses)}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center bg-gray-50/50">
                          {renderIcon(feature.diy)}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center">
                          {renderIcon(feature.genericAI)}
                        </td>
                        <td className="px-3 sm:px-4 py-4 text-center bg-indigo-50 border-l-2 border-indigo-100">
                          {renderIcon(feature.startupBase)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t-2 border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <span className="text-gray-700">Partial/Limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <span className="text-gray-700">Not Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Below Comparison */}
          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button
                onClick={handleCTA}
                disabled={isProcessing || isPremium}
                size="lg"
                className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                {isPremium ? (
                  "You're Already Premium! 🎉"
                ) : (
                  <span className="flex flex-col gap-1">
                    <span>Join the ProFounder</span>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
                  </span>
                )}
              </Button>
              <p className="text-xs sm:text-sm text-gray-600">
                Stop wasting time on methods that don't work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Value Stack */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 px-4 py-2 text-sm font-semibold mb-4">
              Real Value
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              VALUE STACK
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">(What This Is Actually Worth)</p>
          </div>

          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl"></div>

            <div className="relative bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-10 shadow-2xl">
              <div className="space-y-5 mb-8">
                {[
                  {
                    icon: Search,
                    label: "Startup Idea Research",
                    value: "₹25,000",
                    description: "Professional market research & validation",
                    gradient: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: BarChart3,
                    label: "Market Validation & Analysis",
                    value: "₹30,000",
                    description: "TAM sizing, demand metrics, market opportunity analysis",
                    gradient: "from-purple-500 to-purple-600"
                  },
                  {
                    icon: Rocket,
                    label: "Execution Playbooks",
                    value: "₹40,000",
                    description: "Step-by-step roadmaps from 0 to launch",
                    gradient: "from-green-500 to-green-600"
                  },
                  {
                    icon: FileText,
                    label: "Founder Tools & Templates",
                    value: "₹20,000",
                    description: "AI Tool Prompts, Execution Frameworks and a free legal consultation",
                    gradient: "from-orange-500 to-orange-600"
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{item.label}</h3>
                        <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 whitespace-nowrap">{item.value}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Value */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 sm:p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl text-indigo-100 mb-1">Total Value</p>
                    <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">₹1,15,000+</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-base sm:text-lg text-indigo-100 mb-2">You Pay Only</p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-white/30">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">₹999</span>
                    </div>
                    <p className="text-sm sm:text-base text-green-300 font-bold mt-2">Save 99%</p>
                  </div>
                </div>
              </div>

              {/* Bottom callout */}
              <div className="mt-6 text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  <span className="font-semibold text-indigo-600">Limited-time offer:</span> Get enterprise-level insights at a fraction of the cost
                </p>
              </div>
            </div>
          </div>

          {/* CTA Below Value Stack */}
          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex flex-col items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button
                onClick={handleCTA}
                disabled={isProcessing || isPremium}
                size="lg"
                className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                {isPremium ? (
                  "You're Already Premium! 🎉"
                ) : (
                  <span className="flex flex-col gap-1">
                    <span>Join the ProFounder</span>
                    <span className="text-xs font-semibold bg-white/20 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
                  </span>
                )}
              </Button>
              <p className="text-xs sm:text-sm text-gray-600">
                Get ₹1,15,000+ worth of resources for just ₹999
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Pricing */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {user && !isPremium && showWelcome ? "COMPLETE YOUR PREMIUM ACCESS" : "OUR PRICE (FOUNDERS ONLY)"}
            </h2>
            <p className="text-xl text-gray-600">Get full access to The Pro Founder for:</p>
          </div>

          {user && !isPremium ? (
            // Authenticated users - show only annual plan highlighted
            <div className="max-w-md mx-auto">
              <Card className="border-4 border-indigo-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 font-bold">
                  COMPLETE YOUR ACCESS
                </div>
                <CardContent className="p-8 pt-16">
                  <div className="text-center mb-6">
                    <Crown className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Annual Access</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl text-gray-400 line-through">₹4,999</span>
                      <span className="text-2xl text-gray-500 line-through">₹2,999</span>
                    </div>
                    <div className="text-5xl font-extrabold text-gray-900 mb-2">₹999</div>
                    <p className="text-indigo-600 font-bold text-lg">Save ₹3,000</p>
                    <p className="text-gray-600">full year access</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "365 Daily Validated Ideas",
                      "30+ Idea Archive Access",
                      "AI Build Tools",
                      "Free Legal Consultation",
                      "Execution Roadmaps",
                      "Launch Checklists"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={initiatePayment}
                    disabled={isProcessing}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2" />
                        Get Premium Now - ₹999
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    ✅ Cancel anytime • No long-term lock-in • Risk-free
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : !user ? (
            // Unauthenticated users - show only annual plan
            <div className="max-w-md mx-auto">
              <Card className="border-4 border-indigo-500 shadow-xl relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1">
                  NEW YEAR SPECIAL - 80% OFF
                </Badge>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Crown className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Annual Access</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg text-gray-400 line-through">₹4,999</span>
                      <span className="text-xl text-gray-500 line-through">₹2,999</span>
                    </div>
                    <div className="text-5xl font-extrabold text-gray-900 mb-2">₹999</div>
                    <p className="text-indigo-600 font-bold">Save ₹3,000 (80% OFF)</p>
                    <p className="text-gray-600">full year access</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "365 Daily Validated Ideas",
                      "30+ Idea Archive",
                      "AI Build Tools",
                      "Free Legal Consultation",
                      "Priority Support"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={handleCTA}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Get Annual Access - ₹999
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {!isPremium && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                ✅ Cancel anytime • No long-term lock-in • Risk-free
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Founders Are Saying
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.badge}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
            Stop Thinking Like an Amateur Founder
          </h2>
          <p className="text-xl sm:text-2xl mb-8 leading-relaxed">
            If you're serious about building a real business in India, you don't need more motivation.
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-8">
            You need a system.
          </p>
          <Button
            onClick={handleCTA}
            disabled={isProcessing || isPremium}
            size="lg"
            className="h-16 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all mb-6"
          >
            {isPremium ? (
              "You're Already Premium! 🎉"
            ) : (
              <span className="flex flex-col gap-1">
                <span>👉 Join the ProFounder</span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full">₹999/year • 80% OFF</span>
              </span>
            )}
          </Button>
          <p className="text-lg text-white/90">
            Build smarter. Execute faster. Launch with confidence.
          </p>
        </div>
      </section>
    </div>
  );
}
