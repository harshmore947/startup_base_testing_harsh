import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Clock, ChevronDown, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';

const faqs = [
  {
    question: "What happens when my free daily access expires?",
    answer: "Your access to the current Idea of the Day expires at 12:00 AM IST. A fresh new idea becomes available each day, so you'll always have something new to explore."
  },
  {
    question: "Can I cancel my Premium subscription?",
    answer: "Premium is an annual subscription. Once purchased, you get full access for the entire year. We don't offer refunds, but you retain access until your subscription period ends."
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

export default function PricingPage() {
  const { user, isPremium } = useAuth();
  const { initiatePayment, isProcessing } = usePayment();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Dot pattern overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="relative z-10 px-4 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight px-2">
              🎄 Gift Yourself a Startup This Holiday Season
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Get a new validated startup idea every day. Upgrade to unlock the vault and build faster.
            </p>
            
            {/* WhatsApp Channel CTA */}
            <div className="mt-4 sm:mt-6">
              <a
                href="https://whatsapp.com/channel/0029Vb7QNpWGU3BKBThZe21X"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium
                           text-white bg-[#25D366] hover:bg-[#20bd5a]
                           border border-[#25D366] hover:border-[#20bd5a]
                           rounded-full transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Join our WhatsApp channel for daily updates</span>
                <span className="sm:hidden">Join WhatsApp for updates</span>
              </a>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16 lg:mb-20">
            {/* Explorer (Free) Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 transition-all duration-300 hover:shadow-lg">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">The Explorer</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Perfect for getting started</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">₹0</span>
                  <span className="text-gray-500 text-base sm:text-lg">/ forever</span>
                </div>
              </div>

              {/* Key Feature */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-amber-700 font-semibold mb-1 text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  Daily Idea Report
                </div>
                <p className="text-amber-600 text-xs sm:text-sm">Access expires daily at 12:00 AM IST</p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Today's Full Idea Report</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Market Report (restricted to Idea of the Day)</span>
                </li>
              </ul>
              
              {user ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  <Link to="/">Start with Free Plan</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  <Link to="/auth?mode=signup">Join for Free</Link>
                </Button>
              )}
            </div>

            {/* Pro Founder (Premium) Card */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border-2 border-indigo-600 shadow-xl p-6 sm:p-8 transition-all duration-300 lg:hover:scale-105 hover:shadow-2xl relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <div className="bg-indigo-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                  Most Popular
                </div>
              </div>
              
              <div className="mb-4 sm:mb-6 mt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">The Pro Founder</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Everything you need to build</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    Launch Pricing
                  </Badge>
                  <Badge className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white text-xs">
                    🎄 Holiday Special
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl text-gray-400 line-through">₹4,999</span>
                  <span className="text-xl sm:text-2xl text-gray-500 line-through">₹2,999</span>
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                    ₹999
                  </span>
                  <span className="text-gray-500 text-base sm:text-lg">/ year</span>
                </div>
                <p className="text-sm text-indigo-600 font-medium mt-2">
                  🎁 Save ₹4,000 - Offer ends Jan 31, 2026
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Less than ₹3/day for unlimited access
                </p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium text-sm sm:text-base">Unlimited Database Access</span>
                    <p className="text-gray-500 text-xs sm:text-sm">30+ Validated Reports (and growing daily)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium text-sm sm:text-base">"Build" Tool Prompts</span>
                    <p className="text-gray-500 text-xs sm:text-sm">Branding, Personas, Landing Pages & Funnels</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium text-sm sm:text-base">Future-Proof</span>
                    <p className="text-gray-500 text-xs sm:text-sm">Access to ALL new features & products we ship</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium text-sm sm:text-base">Bonus: Free Legal Consultation</span>
                    <p className="text-gray-500 text-xs sm:text-sm">Get help starting your business the right way</p>
                  </div>
                </li>
              </ul>
              
              {user ? (
                isPremium ? (
                  <Button
                    disabled
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-green-600 hover:bg-green-600 text-white rounded-xl"
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    You're a Premium Member
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={initiatePayment}
                      disabled={isProcessing}
                      className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm sm:text-base">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="text-sm sm:text-base">Get Premium - ₹999/year</span>
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
                      🔒 Secure Payment • Join 1,200+ entrepreneurs
                    </p>
                  </>
                )
              ) : (
                <>
                  <Button
                    asChild
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link to="/auth?mode=signup">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">Get Premium - ₹999/year</span>
                    </Link>
                  </Button>
                  <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-2">
                    🔒 Secure Payment • Join 1,200+ entrepreneurs
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
              What Our Users Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Name, Badge, and Rating */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {testimonial.badge}
                      </p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0 ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 leading-relaxed text-sm">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base pr-2">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                      <p className="text-gray-600 text-sm sm:text-base">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
