import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

/**
 * Centralized hook for fetching a user report by its ID.
 * This prevents duplicate API calls across components that need the same user report data.
 * 
 * All user report pages should use this hook instead of making their own useQuery calls.
 * The hook fetches all columns so each component can use only what it needs.
 */
export function useUserReport(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-report', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      logger.log('Fetching user report by ID:', id);
      try {
        const { data, error } = await (supabase as any)
          .from('user_reports')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          logger.error('Error fetching user report:', error);
          throw error;
        }
        
        logger.log('User report fetched:', data?.idea_title);
        return data;
      } catch (error) {
        logger.error('Exception fetching user report:', error);
        throw error;
      }
    },
    enabled: !!id && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
