import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Check,
  X,
  Search,
  BarChart3,
  Target,
  Calendar,
  Clock,
  DollarSign,
  Lightbulb,
  FileText,
  Rocket,
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';
import { HeroIdeaPreview } from '@/components/HeroIdeaPreview';

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
    genericAI: "partial" as const
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
    diy: "partial" as const,
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
    youtube: "partial" as const,
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

export default function Leads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiatePayment, initiateGuestPayment, isProcessing } = usePayment();
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const isPremium = false; // Leads page is for conversion

  const handleCTA = () => {
    if (user) {
      initiatePayment();
    } else {
      setShowGuestForm(true);
    }
  };

  const handleGuestPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestEmail && guestName) {
      initiateGuestPayment({
        email: guestEmail,
        billing_name: guestName,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Electric Blue with Grid */}
      <section className="relative h-screen overflow-hidden">
        {/* Blue Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0066FF] to-[#0052CC]" />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '90px 90px'
          }}
        />

        {/* Animated Wave Shape (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none overflow-hidden">
          <svg
            className="absolute bottom-0 right-0 animate-wave-slow"
            width="800"
            height="800"
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M800 400C800 621.539 621.539 800 400 800C178.461 800 0 621.539 0 400C0 178.461 178.461 0 400 0C621.539 0 800 178.461 800 400Z"
              fill="#003D99"
              fillOpacity="0.4"
              transform="translate(200, 200)"
            />
          </svg>
        </div>

        {/* Logo (Top Left) - Hidden on mobile */}
        <div className="hidden sm:block absolute top-8 left-8 sm:top-10 sm:left-10 z-20">
          <div className="border-3 border-white px-3 py-2 sm:px-4 sm:py-2">
            <div className="text-white font-bold text-lg sm:text-2xl leading-tight tracking-tight">
              STARTUP
              <br />
              BASE
            </div>
          </div>
        </div>

        {/* Main Content (Centered) */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-8">
          {/* Headline */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="font-extrabold text-white leading-none tracking-tight mb-0">
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[120px]">YOUR NEXT</span>
              <span className="inline-block bg-black text-white px-4 py-2 sm:px-6 sm:py-3 mt-2 text-5xl sm:text-7xl md:text-8xl lg:text-[120px]">
                BIG STARTUP IDEA
              </span>
            </h1>
          </div>

          {/* Pricing */}
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-white font-bold text-3xl sm:text-4xl md:text-5xl mb-2">Costs Only</p>
            <div className="flex items-baseline justify-center mb-3">
              <span className="text-[#BFFF00] font-extrabold text-6xl sm:text-8xl md:text-[140px] leading-none">₹</span>
              <span className="text-white font-extrabold text-6xl sm:text-8xl md:text-[140px] leading-none">999</span>
              <span className="text-white font-bold text-3xl sm:text-4xl md:text-5xl ml-2">/yr</span>
            </div>
            <p className="text-white italic text-2xl sm:text-3xl md:text-4xl opacity-90">Fair deal?</p>
          </div>

          {/* Features Line */}
          <p className="text-center text-lg sm:text-2xl md:text-3xl mb-8 sm:mb-12 px-4">
            <span className="text-[#BFFF00] font-bold">365 Ideas</span>
            <span className="text-white"> + Tools + Prompts + Market Research</span>
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleCTA}
            disabled={isProcessing}
            className="bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold text-lg sm:text-xl md:text-2xl px-8 sm:px-12 py-6 sm:py-7 rounded-lg shadow-2xl hover:scale-105 transition-all uppercase mb-6 sm:mb-8"
          >
            GET FULL ACCESS NOW
          </Button>

          {/* Bottom Text - Mobile Only */}
          <p className="md:hidden text-center text-base sm:text-lg text-white px-6 sm:px-8 max-w-5xl mx-auto whitespace-normal">
            That's just <span className="text-[#BFFF00] font-bold">₹2.7</span>/day — less than a samosa 🥟✨
          </p>
        </div>
      </section>

      {/* Rating & Social Proof Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Get Exact Step By Step Blueprint Used by Million Dollar Startup Founders
          </h2>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>

          {/* Social Proof Text */}
          <p className="text-xl sm:text-2xl text-gray-700 font-semibold">
            <span className="text-indigo-600">2298 Startup Founders</span> have already taken their startup live with Pro Founder
          </p>
        </div>
      </section>

      {/* Idea Marquee */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <HeroIdeaPreview />
      </section>

      {/* CTA Section Below Marquee */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Stop Researching. Start Building.
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8">
              365 validated ideas waiting for you
            </p>
            <Button
              onClick={handleCTA}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold text-sm sm:text-base md:text-lg lg:text-xl px-6 sm:px-10 md:px-14 py-4 sm:py-5 md:py-6 lg:py-7 rounded-lg shadow-2xl hover:scale-105 transition-all uppercase"
            >
              START BUILDING WITH CONFIDENCE
            </Button>
          </div>
        </div>
      </section>

      {/* Reinvent The Wheel Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#EBEBEB]">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6">
          <div className="bg-[#0A0A0A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 10L70 65H10L40 10Z" fill="#FDB714" stroke="#000000" strokeWidth="3" strokeLinejoin="round"/>
                <rect x="37" y="28" width="6" height="20" rx="2" fill="#000000"/>
                <circle cx="40" cy="55" r="3" fill="#000000"/>
              </svg>
            </div>

            {/* Headline */}
            <h2 className="text-center mb-8 sm:mb-10">
              <span className="block text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-tight tracking-tight mb-1 sm:mb-2">
                Stop Trying To
              </span>
              <span className="block text-[#FDB714] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-tight tracking-tight underline decoration-2 sm:decoration-4 underline-offset-4">
                Reinvent The Wheel!
              </span>
            </h2>

            {/* Body Text */}
            <div className="max-w-[520px] mx-auto space-y-4 sm:space-y-6">
              <p className="text-[#9CA3AF] text-base sm:text-lg md:text-xl leading-relaxed text-center">
                Too many aspiring founders waste months brainstorming "original" ideas without knowing if there's actual market demand.
              </p>
              <p className="text-[#9CA3AF] text-base sm:text-lg md:text-xl leading-relaxed text-center">
                This trial-and-error approach leads to wasted time, failed launches, and opportunities lost to competitors who moved faster.
              </p>
              <p className="text-[#9CA3AF] text-base sm:text-lg md:text-xl leading-relaxed text-center">
                The most successful founders don't start from scratch—they{' '}
                <span className="underline decoration-white decoration-2 underline-offset-2">
                  build on validated ideas with proven demand and clear execution paths.
                </span>
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-8 sm:mt-12 px-4">
              <Button
                onClick={handleCTA}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold text-sm sm:text-base md:text-lg lg:text-xl px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-lg shadow-2xl hover:scale-105 transition-all uppercase"
              >
                GET VALIDATED IDEAS NOW
              </Button>
            </div>
          </div>
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

      {/* Guest Checkout Modal - Same as Destination */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Quick Checkout</h3>
            <form onSubmit={handleGuestPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing} className="flex-1 bg-[#FFD700] hover:bg-[#FFC700] text-black">
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
