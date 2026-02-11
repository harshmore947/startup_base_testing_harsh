import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, redirectPath?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  completeOnboarding: (choice: 'free' | 'premium' | 'researcher') => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
  isFree: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Track last fetched user ID (for refreshUserProfile deduplication)
  const lastFetchedUserRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Helper function to fetch user profile (with timeout to prevent hanging)
    const fetchUserProfile = async (userId: string, userEmail: string | undefined) => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );

        const fetchPromise = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const { data: existingProfile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!isMounted) return;

        if (error) {
          logger.error('Error checking user profile:', error);
          return;
        }

        if (existingProfile) {
          logger.log('Existing user profile found, subscription status:', existingProfile.subscription_status);
          setUserProfile(existingProfile);
          lastFetchedUserRef.current = userId;

          // Update email in background if needed (non-blocking)
          if (existingProfile.email !== userEmail) {
            supabase
              .from('users')
              .update({ email: userEmail })
              .eq('id', userId)
              .then(() => {
                if (isMounted) {
                  setUserProfile(prev => prev ? { ...prev, email: userEmail! } : prev);
                }
              });
          }
        } else {
          logger.log('Creating new user profile with free subscription');
          const { data: newProfile } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: userEmail,
              subscription_status: 'free',
              subscription_plan: 'free',
              has_completed_onboarding: false
            })
            .select('*')
            .single();

          if (isMounted && newProfile) {
            setUserProfile(newProfile);
            lastFetchedUserRef.current = userId;
          }
        }
      } catch (error) {
        logger.error('Error handling user profile:', error);
      }
    };

    // ── 1. Set up auth listener ──
    // IMPORTANT: Callback is intentionally NON-async (synchronous).
    // Async work is deferred with setTimeout(0) to avoid holding Supabase's
    // internal auth lock, which can cause deadlocks on page refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        logger.log('Auth state change:', event, 'User ID:', currentSession?.user?.id);

        // Always update session and user state synchronously for ALL events
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // ─── No user session (SIGNED_OUT or null session) ───
        if (!currentSession?.user) {
          setUserProfile(null);
          lastFetchedUserRef.current = null;
          setLoading(false);
          return;
        }

        // ─── TOKEN_REFRESHED ───
        // Token was refreshed — session/user already updated above.
        // No need to re-fetch profile, just ensure loading is cleared.
        if (event === 'TOKEN_REFRESHED') {
          setLoading(false);
          return;
        }

        // ─── INITIAL_SESSION (page refresh) or SIGNED_IN (fresh login) ───
        // Defer async profile fetching outside the auth lock using setTimeout
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          // Invalidate related React Query caches
          queryClient.invalidateQueries({ queryKey: ['user-profile-premium'] });
          queryClient.invalidateQueries({ queryKey: ['user-profile-pricing'] });

          setTimeout(async () => {
            if (!isMounted) return;
            try {
              await fetchUserProfile(currentSession.user.id, currentSession.user.email);
            } catch (error) {
              logger.error('Error handling user profile:', error);
            } finally {
              if (isMounted) setLoading(false);
            }
          }, 0);
          return;
        }

        // Any other event — just ensure loading is false
        if (isMounted) setLoading(false);
      }
    );

    // ── 2. Safety timeout to prevent infinite loading ──
    // If INITIAL_SESSION doesn't fire within 5 seconds (edge case),
    // force loading to false to prevent the app from being stuck
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading((current) => {
          if (current) {
            logger.warn('Auth safety timeout: forcing loading to false');
          }
          return false;
        });
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [queryClient]);

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
    // Store intended redirect in sessionStorage for OAuth callback
    if (redirectPath) {
      sessionStorage.setItem('auth_redirect_path', redirectPath);
    }

    const redirectUrl = `${window.location.origin}/`;

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

  const refreshUserProfile = async () => {
    if (!user) {
      logger.warn('Cannot refresh profile: no user logged in');
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Error refreshing user profile:', error);
        return;
      }

      if (profile) {
        setUserProfile(profile);
        lastFetchedUserRef.current = user.id;
      }
    } catch (err) {
      logger.error('Exception refreshing user profile:', err);
    }

    // Also invalidate React Query caches
    queryClient.invalidateQueries({ queryKey: ['user-profile-premium'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile-pricing'] });
  };

  const completeOnboarding = async (choice: 'free' | 'premium' | 'researcher') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    logger.log('Completing onboarding with choice:', choice);

    const { error } = await supabase
      .from('users')
      .update({
        has_completed_onboarding: true,
        onboarding_plan_choice: choice,
        onboarding_completed_at: new Date().toISOString(),
        subscription_status: choice === 'free' ? 'free' : 'pending_payment'
        // Note: subscription_plan will be set during payment (e.g., 'premium_annual', 'research_single')
      })
      .eq('id', user.id);

    if (error) {
      logger.error('Error completing onboarding:', error);
      throw error;
    }

    // Refresh user profile to get updated data
    await refreshUserProfile();

    logger.log('Onboarding completed successfully');
  };

  // Helper booleans - use subscription_status, not subscription_plan
  const hasCompletedOnboarding = userProfile?.has_completed_onboarding ?? false;
  const isPremium = userProfile?.subscription_status === 'premium' || userProfile?.subscription_status === 'active' || userProfile?.subscription_status === 'researcher';
  const isFree = userProfile?.subscription_status === 'free';

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      completeOnboarding,
      refreshUserProfile,
      hasCompletedOnboarding,
      isPremium,
      isFree,
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
  return context;
}