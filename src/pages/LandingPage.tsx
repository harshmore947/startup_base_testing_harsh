import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Calendar, Map, Zap, Users, BookOpen, BarChart3, MessageCircle,
  Target, CheckCircle, X, IndianRupee, Clock, Rocket, TrendingUp,
  Award, Shield, Star
} from 'lucide-react';

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sticky bar on scroll
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Sticky CTA Bar */}
      {showStickyBar && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl z-50 animate-in slide-in-from-top">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm sm:text-base">₹999/Year • Limited Time Offer</span>
            <Button asChild size="sm" className="bg-white text-orange-600 hover:bg-gray-100 font-bold">
              <Link to="/pricing">Get Access Now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
              <Rocket className="h-8 w-8" />
              <span className="text-2xl font-bold">StartupBase</span>
            </Link>
          </div>

          {/* Badge */}
          <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            🎯 NEW: Daily Ideas + Build Support (Execution-focused)
          </Badge>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            One Great Startup Idea.<br />Every Single Day.
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Stop Googling. Start Building. Get validated ideas with complete build roadmaps delivered daily to your inbox.
          </p>

          {/* Trust Line */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm mb-10 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>1,000+ builders already executing</span>
            </div>
          </div>

          {/* Primary CTA */}
          <Button asChild size="lg" className="h-16 px-12 text-lg bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all font-bold hover:scale-105">
            <Link to="/auth?mode=signup&redirect=/landing-page">
              Get Today's Idea Free →
            </Link>
          </Button>
        </div>
      </section>

      {/* 2. VALUE PROPS SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Everything You Need to Go From Idea → Revenue
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">Not just ideas. Your complete execution system.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Calendar, title: 'Fresh Ideas Daily', desc: 'New validated startup opportunity every morning' },
            { icon: Map, title: 'Build Roadmap Included', desc: 'Step-by-step execution plan with AI prompts' },
            { icon: Zap, title: 'Reach PMF Fast', desc: 'Pre-validated market demand, proven revenue models' },
            { icon: Users, title: 'Community + Support', desc: '1:1 guidance, progress tracking, accountability' }
          ].map((item, i) => (
            <Card key={i} className="border-2 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. SOCIAL PROOF SECTION */}
      <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Real Builders. Real Results.</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Join founders who went from idea to revenue</p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Rajesh K.', role: 'SaaS Founder, Mumbai', result: 'Built MVP in 6 weeks, now ₹20K MRR with 500 customers', started: 'Oct 2024', revenue: '₹20K MRR' },
              { name: 'Priya M.', role: 'E-commerce, Bangalore', result: 'Quit my job after hitting ₹1L/month. StartupBase gave me the roadmap I couldn\'t find anywhere else.', started: 'Aug 2024', revenue: '₹1L/month' },
              { name: 'Amit S.', role: 'Mobile App, Delhi', result: 'From idea to first paying customer in 3 weeks using the AI build prompts. Game changer.', started: 'Sep 2024', revenue: '50+ customers' }
            ].map((testimonial, i) => (
              <Card key={i} className="border-2 hover:border-green-500 transition-all hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm mb-4 leading-relaxed italic">"{testimonial.result}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-green-600 font-semibold">Started: {testimonial.started}</span>
                      <span className="text-indigo-600 font-semibold">{testimonial.revenue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { number: '1,000+', label: 'Active Builders' },
              { number: '₹5Cr+', label: 'Revenue Generated' },
              { number: '200+', label: 'MVPs Launched' }
            ].map((metric, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{metric.number}</div>
                <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Your Complete Startup Building System
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">Everything you need in one place</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Resource Vault', items: ['30+ idea reports with research', 'Revenue models & TAM analysis', 'Competitor breakdowns'] },
            { icon: Rocket, title: 'Build Guides', items: ['AI-powered MVP prompts', 'Landing page templates', 'Email sequence copy'] },
            { icon: BarChart3, title: 'Progress Tracking', items: ['Milestone checklists', 'Build sprints system', 'Revenue goal tracker'] },
            { icon: MessageCircle, title: '1:1 Guidance', items: ['Monthly office hours', 'Build review sessions', 'Expert Q&A access'] },
            { icon: Target, title: 'Execution Playbooks', items: ['Week-by-week roadmaps', 'Launch checklists', 'PMF frameworks'] },
            { icon: Users, title: 'Builder Community', items: ['Private Slack/Discord', 'Accountability partners', 'Demo days & feedback'] }
          ].map((feature, i) => (
            <Card key={i} className="hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            From Idea to First Customer in Weeks, Not Months
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Your 8-week build journey</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', time: 'Day 1', title: 'Get Daily Idea', items: ['Validated startup idea', 'Market research & TAM', 'Revenue model breakdown'] },
              { step: '2', time: 'Day 2-3', title: 'Review & Choose', items: ['Browse vault, pick your idea', 'Access complete build guide', 'Join execution cohort'] },
              { step: '3', time: 'Week 1-8', title: 'Build & Track', items: ['Follow week-by-week roadmap', 'Track milestones', 'Launch MVP & get customers'] }
            ].map((phase, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold mb-4">
                    {phase.step}
                  </div>
                  <Badge className="mb-2">{phase.time}</Badge>
                  <h3 className="text-xl font-bold mb-4">{phase.title}</h3>
                  <ul className="text-left space-y-2">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-600">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-indigo-600 to-purple-600" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="h-14 px-10 text-lg">
              <Link to="/pricing">Start Your 8-Week Build Journey →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. TARGET BUYER QUALIFICATION */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Perfect For Serious Builders Who Want to Execute
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: '✅ Side-Hustlers', desc: 'You have a full-time job but want to build income streams', need: 'Ideas that work with limited time, clear roadmaps' },
            { title: '✅ Career Switchers', desc: 'You\'re leaving corporate to build your own business', need: 'Validation, de-risked ideas, execution support' },
            { title: '✅ First-Time Founders', desc: 'You want to build a startup but don\'t know where to start', need: 'Proven frameworks, community, accountability' }
          ].map((persona, i) => (
            <Card key={i} className="border-2 border-green-200 dark:border-green-900">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">{persona.title}</h3>
                <p className="text-sm mb-3">{persona.desc}</p>
                <p className="text-xs text-muted-foreground"><strong>You need:</strong> {persona.need}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <X className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">Not for:</h3>
                <p className="text-sm text-red-800 dark:text-red-200">Passive learners, idea collectors, "someday" planners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button asChild size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-indigo-600 to-purple-600">
            <Link to="/pricing">I'm Ready to Build →</Link>
          </Button>
        </div>
      </section>

      {/* 7. LIMITED TIME OFFER */}
      <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            🎁 Holiday Special - Save ₹3,000
          </h2>

          {/* Countdown Timer */}
          <div className="mb-8">
            <p className="text-lg mb-4">Offer expires in:</p>
            <div className="flex justify-center gap-4">
              {[
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Minutes' },
                { value: timeLeft.seconds, label: 'Seconds' }
              ].map((time, i) => (
                <div key={i} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                  <div className="text-4xl font-bold">{String(time.value).padStart(2, '0')}</div>
                  <div className="text-sm text-white/80">{time.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="text-lg line-through opacity-75">Regular Price: ₹3,999/year</div>
            <div className="text-5xl font-bold my-4">Holiday Price: ₹999/year</div>
            <div className="text-2xl">You Save: ₹3,000 (75% OFF)</div>
          </div>

          <Button asChild size="lg" className="h-16 px-12 text-lg bg-white text-orange-600 hover:bg-gray-100 shadow-2xl font-bold animate-pulse">
            <Link to="/pricing">Claim My 75% Discount Now →</Link>
          </Button>

          <p className="mt-6 text-sm text-white/80">⏰ Only 47 spots left at this price</p>
        </div>
      </section>

      {/* 8. PRICING VALUE SECTION */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          ₹999/Year = Your Complete Execution System
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">See what you're really getting</p>

        <Card className="border-2 border-indigo-200 mb-8">
          <CardContent className="p-8">
            <div className="space-y-4 mb-6">
              {[
                { item: 'Daily Ideas Forever', value: '(₹500/month hiring consultant)' },
                { item: '30+ Idea Reports', value: '(₹50K+ research value)' },
                { item: 'AI Build Prompts', value: '(₹30K+ dev consultation value)' },
                { item: 'Monthly 1:1 Sessions', value: '(₹15K/month coaching value)' },
                { item: 'Private Community', value: '(Priceless connections)' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{item.item}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 pt-6 mb-6">
              <div className="flex justify-between items-center text-lg mb-2">
                <span>Total Value:</span>
                <span className="font-bold">₹3L+</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-indigo-600">
                <span>Your Investment:</span>
                <span>₹999/year</span>
              </div>
              <p className="text-center mt-2 text-muted-foreground">That's ₹83/month to build your business</p>
            </div>

            {/* Comparison */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold mb-4">Compare Your Options:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  <span>Hiring consultant: ₹50K+/month</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <X className="h-4 w-4" />
                  <span>MBA course: ₹10L+</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  <span>StartupBase: ₹83/month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild size="lg" className="h-16 px-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600">
            <Link to="/pricing">Get Full Access for ₹999/year →</Link>
          </Button>
        </div>
      </section>

      {/* 9. RISK REVERSAL */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            100% Execution-Focused Guarantee
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              'Find at least 3 ideas you want to build',
              'Get your first customer within 90 days',
              'Feel supported by the community'
            ].map((guarantee, i) => (
              <Card key={i} className="border-2 border-green-200">
                <CardContent className="p-6">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="text-sm font-medium">{guarantee}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-lg mb-8">
            If you don't achieve these results → <strong>Full refund, no questions asked.</strong>
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>90-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Find Your ₹10L/Month Business Idea?
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8 text-left">
            <div>
              <h3 className="font-bold text-xl mb-4">What You're Getting:</h3>
              <ul className="space-y-2">
                {[
                  'Daily validated startup ideas',
                  '30+ idea reports with research',
                  'AI-powered build prompts',
                  'Complete execution roadmaps',
                  '1:1 monthly guidance',
                  'Private builder community'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl font-bold mb-2">₹999/year</div>
              <div className="text-lg mb-4">₹83/month</div>
              <Button asChild size="lg" className="w-full h-14 bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg">
                <Link to="/pricing">Get Instant Access →</Link>
              </Button>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/80">
                <span>🔒 Secure Payment</span>
                <span>💳 All Cards</span>
                <span>📱 Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 StartupBase. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/refund-policy" className="hover:text-primary">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
