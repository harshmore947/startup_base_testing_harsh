import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Centralized hook for fetching an idea by its ID.
 * This prevents duplicate API calls across components that need the same idea data.
 * 
 * All dynamic idea pages should use this hook instead of making their own useQuery calls.
 * The hook fetches all columns so each component can use only what it needs.
 */
export function useIdeaById(id: string | undefined) {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      if (!id) return null;
      
      logger.log('Fetching idea by ID:', id);
      try {
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', parseInt(id))
          .single();
        
        if (error) {
          logger.error('Error fetching idea:', error);
          throw error;
        }
        
        logger.log('Idea fetched:', data?.title);
        return data;
      } catch (error) {
        logger.error('Exception fetching idea:', error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes - idea data doesn't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
