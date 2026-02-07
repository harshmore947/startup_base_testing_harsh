import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StickyUpgradeBarProps {
  isSignup?: boolean;
}

export function StickyUpgradeBar({ isSignup = false }: StickyUpgradeBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-indigo-600 to-green-600 text-white shadow-2xl border-t-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Message */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Crown className="h-5 w-5" />
              <h3 className="text-lg font-bold">
                {isSignup ? "🎄 Sign Up to Build Your Startup" : "🎁 Holiday Special - Unlock Full Access"}
              </h3>
            </div>
            <p className="text-sm text-indigo-100">
              {isSignup
                ? "Create a free account to see the full page • Upgrade anytime for all prompts and tools"
                : "Perfect gift to yourself this holiday season - Build your 2025 success story"}
            </p>
          </div>

          {/* Right side - Price & CTA */}
          <div className="flex items-center gap-4">
            {!isSignup && (
              <div className="text-right hidden sm:block">
                <div className="text-2xl font-bold">₹999</div>
                <div className="text-xs text-indigo-200">per year</div>
              </div>
            )}
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Link to={isSignup ? "/auth?mode=signup&redirect=/build-this-idea" : "/pricing"}>
                {isSignup ? "Sign Up Free" : "Upgrade Now"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
