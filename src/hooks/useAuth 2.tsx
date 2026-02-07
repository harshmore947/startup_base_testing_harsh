import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, redirectPath?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log('Auth state change:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Invalidate all user profile queries when auth state changes
        queryClient.invalidateQueries({ 
          queryKey: ['user-profile-premium']
        });
        queryClient.invalidateQueries({ 
          queryKey: ['user-profile-pricing']
        });

        // Create user profile for new users only (preserve existing subscription status)
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // First check if user profile already exists
              const { data: existingProfile } = await supabase
                .from('users')
                .select('id, subscription_status')
                .eq('id', session.user.id)
                .single();

              if (existingProfile) {
                logger.log('Existing user profile found, subscription status:', existingProfile.subscription_status);
                // User exists, only update email if needed (preserve subscription_status)
                await supabase
                  .from('users')
                  .update({ email: session.user.email })
                  .eq('id', session.user.id);
              } else {
                logger.log('Creating new user profile with free subscription');
                // New user, create profile with default free status
                await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    subscription_status: 'free'
                  });
              }
            } catch (error) {
              logger.error('Error handling user profile:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, redirectPath?: string) => {
    // Use provided redirect path or default to homepage (backwards compatible)
    const redirectUrl = redirectPath
      ? `${window.location.origin}${redirectPath}`
      : `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async (redirectPath?: string) => {
    // Store in BOTH sessionStorage AND URL parameter for maximum reliability
    if (redirectPath) {
      sessionStorage.setItem('auth_redirect_path', redirectPath);
      localStorage.setItem('auth_redirect_path', redirectPath); // Also use localStorage as backup
      logger.log('[useAuth] Storing redirect path:', redirectPath);
    }

    const redirectUrl = redirectPath
      ? `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectPath)}`
      : `${window.location.origin}/auth`;

    logger.log('[useAuth] Google OAuth redirectTo URL:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  logger.log('useAuth hook called - user:', context.user?.id, context.user?.email, 'loading:', context.loading);
  return context;
}