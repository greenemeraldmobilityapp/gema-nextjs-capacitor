'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId: string, email: string) {
      if (profile?.id === userId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', userId)
          .single();

        if (error) {
          // PGRST116 means no rows returned (profile not found)
          if (error.code === 'PGRST116') {
            console.warn('Profile not found for user. Needs role selection fallback.');
          } else {
            console.error('Error fetching profile:', error);
          }
          if (mounted) setProfile(null);
          return;
        }

        if (mounted && data) {
          setProfile({
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role as 'customer' | 'vendor' | 'admin',
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      } else {
        fetchProfile(session.user.id, session.user.email || '');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setLoading(true);
      }
      if (session) {
        // Only re-fetch on SIGNED_IN or USER_UPDATED to avoid unnecessary requests
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          fetchProfile(session.user.id, session.user.email || '');
        } else {
           if (mounted) setLoading(false);
        }
      } else {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount. UseAuthStore methods are stable.

  return <>{children}</>;
}

