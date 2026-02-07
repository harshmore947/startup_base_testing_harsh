import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function AdminStatCard({ title, value, subtitle, icon: Icon, trend }: AdminStatCardProps) {
  return (
    <Card className="professional-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="caption-text">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="caption-text">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}