import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

interface IdeaPreview {
  id: number;
  title: string;
  description: string;
  industry: string | null;
  tam_value: string | null;
  feasibilty_score: number | null;
  overall_opportunity_score: number | null;
}

export function HeroIdeaPreview() {
  // Fetch ideas from archive (only past dates, same as /archive page)
  const { data: archiveIdeas, isLoading } = useQuery({
    queryKey: ['hero-archive-ideas'],
    queryFn: async () => {
      // Get today's date in IST (same logic as Archive page)
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      const { data } = await supabase
        .from('ideas')
        .select('id, title, description, industry, tam_value, feasibilty_score, overall_opportunity_score')
        .lt('Date', today) // Only past ideas (already live)
        .order('Date', { ascending: false })
        .limit(20); // Get 20 ideas for smoother infinite scroll
      return data as IdeaPreview[];
    },
  });

  if (isLoading || !archiveIdeas || archiveIdeas.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to strip markdown from text
  const stripMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.+?)\*/g, '$1') // Remove *italic*
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove [links](url)
      .replace(/#+\s/g, '') // Remove headers
      .replace(/`(.+?)`/g, '$1') // Remove `code`
      .trim();
  };

  // Helper to format TAM value
  const formatTAM = (tam: string | null) => {
    if (!tam) return 'N/A';
    const match = tam.match(/₹([\d,]+)/);
    return match ? `₹${match[1]} Cr` : tam.substring(0, 20);
  };

  // Helper to get score color
  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Double ideas array for seamless infinite loop (20 ideas × 2 = 40 cards)
  const duplicatedIdeas = [...archiveIdeas, ...archiveIdeas];

  return (
    <div className="relative w-full overflow-hidden py-2 sm:py-4">
      {/* Infinite Scroll Container */}
      <div className="flex gap-2 sm:gap-4 animate-infinite-scroll-mobile md:animate-infinite-scroll hover:pause-animation">
        {duplicatedIdeas.map((idea, index) => (
          <Card
            key={`${idea.id}-${index}`}
            className="flex-shrink-0 w-[140px] sm:w-[320px] border border-indigo-200 sm:border-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-2 sm:p-4">
              {/* Industry Tag */}
              {idea.industry && (
                <Badge variant="outline" className="mb-1 sm:mb-2 bg-white/80 text-indigo-700 border-indigo-300 text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-1">
                  {idea.industry}
                </Badge>
              )}

              {/* Title */}
              <h3 className="text-[10px] sm:text-base font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 min-h-[24px] sm:min-h-[48px] leading-tight">
                {idea.title}
              </h3>

              {/* Description - stripped of markdown */}
              <p className="text-[8px] sm:text-xs text-gray-600 mb-1 sm:mb-3 line-clamp-2 sm:line-clamp-3 min-h-[20px] sm:min-h-[48px] leading-tight">
                {stripMarkdown(idea.description)}
              </p>

              {/* Metrics */}
              <div className="space-y-1 sm:space-y-2">
                {/* Scores Row */}
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  {/* Feasibility */}
                  {idea.feasibilty_score && (
                    <div className="bg-white rounded-sm sm:rounded-lg p-1 sm:p-2 border border-gray-200">
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                        <Target className="w-2 h-2 sm:w-3 sm:h-3 text-indigo-600" />
                        <span className="text-[7px] sm:text-[10px] text-gray-600 font-medium leading-none">Feasibility</span>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getScoreColor(idea.feasibilty_score)}`}></div>
                        <span className="text-[8px] sm:text-sm font-bold text-gray-900">
                          {idea.feasibilty_score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Opportunity */}
                  {idea.overall_opportunity_score && (
                    <div className="bg-white rounded-sm sm:rounded-lg p-1 sm:p-2 border border-gray-200">
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                        <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 text-green-600" />
                        <span className="text-[7px] sm:text-[10px] text-gray-600 font-medium leading-none">Opportunity</span>
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getScoreColor(idea.overall_opportunity_score)}`}></div>
                        <span className="text-[8px] sm:text-sm font-bold text-gray-900">
                          {idea.overall_opportunity_score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Market Size */}
                {idea.tam_value && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-sm sm:rounded-lg p-1 sm:p-2 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <DollarSign className="w-2 h-2 sm:w-3 sm:h-3 text-green-600" />
                        <span className="text-[7px] sm:text-[10px] text-gray-700 font-medium leading-none">Market</span>
                      </div>
                      <span className="text-[8px] sm:text-sm font-bold text-green-700">
                        {formatTAM(idea.tam_value)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fade edges for infinite effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-purple-50 to-transparent pointer-events-none"></div>
    </div>
  );
}
