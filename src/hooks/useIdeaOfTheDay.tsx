import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Centralized hook for fetching the idea of the day.
 * This prevents duplicate API calls across components by using a single query key.
 * 
 * All components should use this hook instead of making their own useQuery calls.
 */
export function useIdeaOfTheDay() {
  return useQuery({
    queryKey: ['idea-of-the-day'],
    queryFn: async () => {
      logger.log('Fetching idea of the day');
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .eq('is_idea_of_the_day', true)
          .maybeSingle();
        
        if (error) {
          logger.error('Error fetching idea of the day:', error);
          throw error;
        }
        
        logger.log('Idea of the day fetched:', data?.title);
        return data;
      } catch (error) {
        logger.error('Exception fetching idea of the day:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - idea of the day doesn't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
