import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
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

  // Track which user ID we've already fetched / are fetching to prevent duplicates
  const fetchingForUserRef = useRef<string | null>(null);
  const lastFetchedUserRef = useRef<string | null>(null);
  const initialSessionHandled = useRef(false);

  // Fetch user profile from database with timeout — single, deduplicated call
  const fetchUserProfile = useCallback(async (userId: string, force = false): Promise<UserProfile | null> => {
    // Skip if we're already fetching for this user (prevents concurrent duplicate calls)
    if (!force && fetchingForUserRef.current === userId) {
      logger.log('Skipping duplicate fetchUserProfile for:', userId);
      return userProfile;
    }

    // Skip if we already have the profile for this user and it's not a forced refresh
    if (!force && lastFetchedUserRef.current === userId && userProfile) {
      logger.log('Profile already cached for:', userId);
      return userProfile;
    }

    fetchingForUserRef.current = userId;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }

      lastFetchedUserRef.current = userId;
      return data;
    } catch (error) {
      logger.error('Exception fetching user profile:', error);
      return null;
    } finally {
      // Clear the "fetching" lock only if it's still for this user
      if (fetchingForUserRef.current === userId) {
        fetchingForUserRef.current = null;
      }
    }
  }, [userProfile]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.log('Auth state change:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          // User signed out — clear everything
          setUserProfile(null);
          lastFetchedUserRef.current = null;
          fetchingForUserRef.current = null;
          setLoading(false);
          return;
        }

        // For INITIAL_SESSION event, skip if getSession already handled it
        if (event === 'INITIAL_SESSION' && initialSessionHandled.current) {
          logger.log('INITIAL_SESSION skipped — already handled by getSession');
          setLoading(false);
          return;
        }

        // For non-SIGNED_IN events (e.g. TOKEN_REFRESHED), just fetch profile once
        if (event !== 'SIGNED_IN') {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) setUserProfile(profile);
          setLoading(false);
          return;
        }

        // SIGNED_IN event — handle new/existing user in a single flow with minimal calls
        setLoading(false);

        // Invalidate related React Query caches
        queryClient.invalidateQueries({ queryKey: ['user-profile-premium'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile-pricing'] });

        try {
          // Single query to check if user profile exists (also gets the full profile)
          const { data: existingProfile, error } = await supabase
                .from('users')
            .select('*')
                .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            logger.error('Error checking user profile:', error);
            return;
          }

              if (existingProfile) {
                logger.log('Existing user profile found, subscription status:', existingProfile.subscription_status);
            // Set profile immediately from the data we already have (no extra fetch!)
            setUserProfile(existingProfile);
            lastFetchedUserRef.current = session.user.id;

            // Update email in background if needed (non-blocking, no refetch)
            if (existingProfile.email !== session.user.email) {
              supabase
                  .from('users')
                  .update({ email: session.user.email })
                .eq('id', session.user.id)
                .then(() => {
                  // Update local state without another API call
                  setUserProfile(prev => prev ? { ...prev, email: session.user.email! } : prev);
                });
            }
              } else {
                logger.log('Creating new user profile with free subscription');
            // New user — insert and use returned data
            const { data: newProfile } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    subscription_status: 'free',
                    subscription_plan: 'free',
                    has_completed_onboarding: false
              })
              .select('*')
              .single();

            if (newProfile) {
                setUserProfile(newProfile);
              lastFetchedUserRef.current = session.user.id;
            }
              }
            } catch (error) {
              logger.error('Error handling user profile:', error);
        }
      }
    );

    // THEN check for existing session (handles page refresh)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialSessionHandled.current = true;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) setUserProfile(profile);
      }

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

    // Force a fresh fetch
    const profile = await fetchUserProfile(user.id, true);
    if (profile) setUserProfile(profile);

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