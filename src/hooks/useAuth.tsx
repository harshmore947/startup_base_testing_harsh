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
    // Single auth listener — handles BOTH initial session (page refresh) and sign-in.
    // Removed the separate getSession() call that caused a race condition where
    // `loading` was set to false before `userProfile` was fetched.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.log('Auth state change:', event, 'User ID:', currentSession?.user?.id);

        // Synchronously update session & user (React batches these)
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          // User signed out or no session — clear everything
          setUserProfile(null);
          lastFetchedUserRef.current = null;
          setLoading(false);
          return;
        }

        const userId = currentSession.user.id;

        // ─── INITIAL_SESSION (page refresh) ───
        // Fetch the profile FIRST, then set loading false — this prevents the race
        // condition where PremiumGate/AuthGate saw loading=false but userProfile=null.
        if (event === 'INITIAL_SESSION') {
          try {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            if (error) {
              logger.error('Error fetching user profile on refresh:', error);
            } else if (profile) {
              setUserProfile(profile);
              lastFetchedUserRef.current = userId;
              logger.log('Profile loaded on refresh, subscription:', profile.subscription_status);
            }
          } catch (err) {
            logger.error('Exception fetching profile on refresh:', err);
          } finally {
            // loading is ONLY set to false AFTER the profile fetch completes or fails
            setLoading(false);
          }
          return;
        }

        // ─── TOKEN_REFRESHED ───
        // Token was refreshed in the background — no need to refetch the profile
        if (event === 'TOKEN_REFRESHED') {
          setLoading(false);
          return;
        }

        // ─── SIGNED_IN (fresh login / OAuth callback) ───
        if (event === 'SIGNED_IN') {
          // Invalidate related React Query caches
          queryClient.invalidateQueries({ queryKey: ['user-profile-premium'] });
          queryClient.invalidateQueries({ queryKey: ['user-profile-pricing'] });

          try {
            // Single query to check if user profile exists (also gets the full profile)
            const { data: existingProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .maybeSingle();

            if (error) {
              logger.error('Error checking user profile:', error);
              setLoading(false);
              return;
            }

            if (existingProfile) {
              logger.log('Existing user profile found, subscription status:', existingProfile.subscription_status);
              // Set profile immediately from the data we already have
              setUserProfile(existingProfile);
              lastFetchedUserRef.current = userId;

              // Update email in background if needed (non-blocking)
              if (existingProfile.email !== currentSession.user.email) {
                supabase
                  .from('users')
                  .update({ email: currentSession.user.email })
                  .eq('id', userId)
                  .then(() => {
                    setUserProfile(prev => prev ? { ...prev, email: currentSession.user.email! } : prev);
                  });
              }
            } else {
              logger.log('Creating new user profile with free subscription');
              // New user — insert and use returned data
              const { data: newProfile } = await supabase
                .from('users')
                .insert({
                  id: userId,
                  email: currentSession.user.email,
                  subscription_status: 'free',
                  subscription_plan: 'free',
                  has_completed_onboarding: false
                })
                .select('*')
                .single();

              if (newProfile) {
                setUserProfile(newProfile);
                lastFetchedUserRef.current = userId;
              }
            }
          } catch (error) {
            logger.error('Error handling user profile:', error);
          } finally {
            setLoading(false);
          }
          return;
        }

        // ─── SIGNED_OUT or any other event ───
        setLoading(false);
      }
    );

    // Safety timeout: if onAuthStateChange never fires (e.g. Supabase fails silently),
    // don't keep the app stuck on the loading screen forever.
    const safetyTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          logger.warn('Auth safety timeout — forcing loading to false after 5s');
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
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