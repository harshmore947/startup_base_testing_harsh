import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface LockedPromptCardProps {
  title: string;
  icon?: React.ReactNode;
  preview?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function LockedPromptCard({
  title,
  icon,
  preview,
  ctaText = "Upgrade to Premium - ₹999/year",
  ctaLink = "/pricing"
}: LockedPromptCardProps) {
  const isSignup = ctaLink.includes('/auth');

  return (
    <Card className="hover-lift relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Blurred preview text */}
          <div className="p-6 bg-gradient-to-r from-accent/15 to-accent/5 rounded-xl border border-border/50 relative">
            <div className="blur-sm select-none pointer-events-none text-muted-foreground">
              {preview || "This is a comprehensive prompt that will help you build this section of your startup. It includes detailed instructions, best practices, and actionable steps to implement this feature effectively..."}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95 flex flex-col items-center justify-center text-center p-6">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-xl font-bold mb-2 text-foreground">
                {isSignup ? "Sign Up to Build" : "Premium Feature"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {isSignup
                  ? "Create a free account to see the full page structure and get started"
                  : "Unlock this prompt and 5+ other build tools to start creating your startup today"}
              </p>

              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link to={ctaLink}>
                  <Crown className="w-5 h-5 mr-2" />
                  {ctaText}
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                {isSignup ? "Free to start • Upgrade later for full access" : "Join 100+ founders building their ideas"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
