import { X, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function HolidayBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('holidayBannerDismissed');
    return !dismissed;
  });

  const handleDismiss = () => {
    localStorage.setItem('holidayBannerDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white">
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center justify-center sm:justify-start">
            <span className="flex p-2 rounded-lg bg-white/10">
              <Gift className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-sm sm:text-base truncate">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Happy Holidays! Special offer inside</span>
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Link
              to="/pricing"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors"
            >
              View Offer
            </Link>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 flex p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
