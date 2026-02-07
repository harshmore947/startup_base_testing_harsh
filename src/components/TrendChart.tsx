import React, { useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Info } from 'lucide-react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TrendChartProps {
  data: any;
  height?: number;
  trendQuery?: string;
}

export function TrendChart({ data, height = 320, trendQuery }: TrendChartProps) {
  // Parse JSON string and extract interest_over_time.timeline_data
  let timelineData: Array<{ date: string; values: Array<{ extracted_value: number }> }> = [];
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const rawTimeline = parsed?.interest_over_time?.timeline_data;
    if (Array.isArray(rawTimeline)) {
      timelineData = rawTimeline;
    }
  } catch (_) {
    timelineData = [];
  }

  const baseData = timelineData.map((d) => ({
    date: d?.date,
    value: Array.isArray(d?.values) ? (d.values[0]?.extracted_value ?? 0) : 0,
  }));

  const ranges: Record<string, number> = {
    '1M': 4,
    '3M': 12,
    '6M': 24,
    'Max': Infinity,
  };

  const [selectedRange, setSelectedRange] = useState<keyof typeof ranges>('Max');

  const chartData = useMemo(() => {
    if (!baseData.length) return [];
    const take = ranges[selectedRange];
    if (!isFinite(take)) return baseData;
    return baseData.slice(-take);
  }, [baseData, selectedRange]);

  // Calculate volume and growth
  const calculateVolumeAndGrowth = useMemo(() => {
    if (!chartData.length) return { volume: 0, growth: 0 };
    
    const currentValue = chartData[chartData.length - 1]?.value || 0;
    const firstValue = chartData[0]?.value || 0;
    
    // Format volume (convert to K, M format)
    const formatVolume = (value: number): string => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    };
    
    // Calculate growth percentage
    const growthPercent = firstValue > 0 ? ((currentValue - firstValue) / firstValue) * 100 : 0;
    
    return {
      volume: formatVolume(currentValue),
      growth: growthPercent
    };
  }, [chartData]);

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with trend query and metrics */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Keyword:</span>
          <span className="text-base font-medium">{trendQuery || 'Search trend'}</span>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Interest over time represents search popularity on a scale of 0-100, where 100 is the peak popularity for the term during this period. A value of 50 means the term is half as popular.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              calculateVolumeAndGrowth.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {calculateVolumeAndGrowth.growth >= 0 ? '+' : ''}{calculateVolumeAndGrowth.growth.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Growth</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <p className="text-sm text-muted-foreground">Range</p>
        <div className="flex items-center gap-2">
          {Object.keys(ranges).map((label) => (
            <button
              key={label}
              onClick={() => setSelectedRange(label as keyof typeof ranges)}
              className={`h-8 px-3 rounded-full text-xs border transition-colors ${
                selectedRange === label
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="electricBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={false} />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip
              formatter={(value: any) => [value as number, 'Interest']}
              labelFormatter={(label) => label as string}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#electricBlue)"
              dot={false}
              isAnimationActive={true}
              activeDot={{ r: 3, stroke: '#3b82f6', strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}