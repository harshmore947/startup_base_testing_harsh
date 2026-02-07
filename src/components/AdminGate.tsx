import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';

interface AdminGateProps {
  children: ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { user, loading: authLoading } = useAuth();

  logger.log('AdminGate - user:', user?.id, user?.email, 'loading:', authLoading);

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      logger.log('AdminGate - Fetching user role for:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      logger.log('AdminGate - Query result:', { data, error });
      if (error) {
        logger.error('AdminGate - Query error:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  // Show loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not admin
  logger.log('AdminGate - userRole:', userRole);
  if (!userRole || userRole.role !== 'admin') {
    logger.log('AdminGate - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  logger.log('AdminGate - Admin access granted');

  return <>{children}</>;
}