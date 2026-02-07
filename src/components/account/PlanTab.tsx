import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PlanTab() {
  const { user, userProfile, isPremium } = useAuth();

  const features = [
    { name: 'Idea of the Day Email', free: true, premium: true },
    { name: 'Idea of the Day Access', free: true, premium: true },
    { name: 'Idea Database Access', free: false, premium: true },
    { name: 'Build This Idea', free: false, premium: true },
    { name: 'Research Your Idea', free: false, premium: true },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </h2>
            <p className="text-white/80">Your current subscription</p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          {isPremium ? (
            <Button 
              variant="outline" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              disabled
            >
              Manage Billing
            </Button>
          ) : (
            <Button 
              asChild
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Link to="/pricing">Upgrade Plan</Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Features Table */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <h3 className="text-lg font-semibold">Plan Features</h3>
        </div>
        
        <div className="divide-y">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 p-4 hover:bg-accent/50 transition-colors">
              <div className="font-medium text-sm">{feature.name}</div>
              <div className="flex items-center justify-center">
                {feature.free ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-center">
                {feature.premium ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Link to="/pricing" className="text-sm text-blue-600 hover:underline">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-semibold text-sm">
          <div>Feature</div>
          <div className="text-center">Free</div>
          <div className="text-center">Premium</div>
        </div>
      </Card>
    </div>
  );
}
