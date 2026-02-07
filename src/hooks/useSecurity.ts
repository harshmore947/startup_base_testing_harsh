import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

export function useSecurity() {
  const { user } = useAuth();

  const checkRateLimit = async (
    actionType: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): Promise<RateLimitResult> => {
    if (!user) {
      return { allowed: false, error: 'Authentication required' };
    }

    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        _user_id: user.id,
        _action_type: actionType,
        _ip_address: null, // Could be enhanced to get actual IP
        _max_attempts: maxAttempts,
        _window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: false, error: 'Rate limit check failed' };
      }

      if (!data) {
        return { 
          allowed: false, 
          error: `Too many attempts. Please try again later.` 
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: false, error: 'Rate limit check failed' };
    }
  };

  const logAuditEvent = async (
    action: string,
    tableName: string,
    recordId?: string,
    oldData?: any,
    newData?: any
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_audit_event', {
        _user_id: user.id,
        _action: action,
        _table_name: tableName,
        _record_id: recordId,
        _old_data: oldData ? JSON.stringify(oldData) : null,
        _new_data: newData ? JSON.stringify(newData) : null
      });
    } catch (error) {
      // Don't throw errors for audit logging failures to avoid disrupting user experience
      logger.error('Audit logging error:', error);
    }
  };

  return {
    checkRateLimit,
    logAuditEvent
  };
}