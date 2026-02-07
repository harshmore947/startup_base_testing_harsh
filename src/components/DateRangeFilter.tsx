import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DateRange = '7d' | '30d' | 'all';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 Days</SelectItem>
        <SelectItem value="30d">Last 30 Days</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  );
}