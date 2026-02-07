interface StatCardProps {
  title: string;
  score: number | null;
  change?: string;
  positive?: boolean;
}

export function StatCard({ title, score, change, positive }: StatCardProps) {
  const formatScore = (value: number) => {
    if (title === "Market Size") return `$${value}B`;
    if (title === "Growth Rate" || title === "Profit Margin") return `${value}%`;
    if (title === "Startup Cost") return `$${value}K`;
    return value?.toString() || '--';
  };

  return (
    <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-card-border">
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {score !== null ? formatScore(score) : '--'}
      </p>
      {change && (
        <p className={`text-base font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </p>
      )}
    </div>
  );
}