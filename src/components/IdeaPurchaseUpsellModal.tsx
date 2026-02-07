import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

interface IdeaPurchaseUpsellModalProps {
  open: boolean;
  onClose: () => void;
  ideaTitle: string;
}

export function IdeaPurchaseUpsellModal({ open, onClose, ideaTitle }: IdeaPurchaseUpsellModalProps) {
  const { initiatePayment, isProcessing } = usePayment();

  const handleUpgradeToPremium = () => {
    initiatePayment();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-2">
            Special Launch Offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* What they clicked */}
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground mb-2">You're about to purchase:</p>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground px-2 sm:px-4">"{ideaTitle}"</h3>
          </div>

          {/* Comparison */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Option 1: Single Idea */}
              <div className="border-2 border-gray-300 rounded-xl p-4 sm:p-6 bg-gray-50">
                <div className="text-center mb-3 sm:mb-4">
                  <X className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-gray-400 mb-2" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-700">Just This Idea</h4>
                </div>
                <ul className="space-y-2 mb-3 sm:mb-4">
                  <li className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>1 Idea Report</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>No Build Tools</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>No Future Ideas</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>No Archive Access</span>
                  </li>
                </ul>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹999</p>
                  <p className="text-xs sm:text-sm text-gray-500">one-time</p>
                </div>
              </div>

              {/* Option 2: Premium (Recommended) */}
              <div className="border-2 border-indigo-500 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs sm:text-sm">
                  Best Value
                </Badge>

                <div className="text-center mb-3 sm:mb-4">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-indigo-600 mb-2" />
                  <h4 className="text-sm sm:text-base font-semibold text-indigo-900">Premium Access</h4>
                </div>

                <ul className="space-y-2 mb-3 sm:mb-4">
                  <li className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>THIS Idea + 30+ More</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>AI Build Tools</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>365 Daily Ideas</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Free Legal Consultation</span>
                  </li>
                </ul>

                <div className="text-center mb-3 sm:mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm sm:text-lg text-gray-400 line-through">₹4,999</span>
                    <span className="text-base sm:text-xl text-gray-500 line-through">₹2,999</span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">₹999</p>
                  <p className="text-xs sm:text-sm text-indigo-600 font-medium">Save ₹3,000</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">full year access</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xs sm:text-sm font-medium text-indigo-800">
                    Same price, 30+ ideas included
                  </p>
                </div>
              </div>
            </div>

            {/* OR Divider - Desktop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
              <div className="bg-white border-2 border-gray-300 rounded-full w-12 h-12 flex items-center justify-center font-bold text-gray-600 shadow-sm">
                OR
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div>
            <Button
              onClick={handleUpgradeToPremium}
              disabled={isProcessing}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Get Premium for ₹999</span>
                </>
              )}
            </Button>
          </div>

          {/* Validity Date */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-indigo-600 font-medium">
              Only valid till 12 Jan 2026
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
