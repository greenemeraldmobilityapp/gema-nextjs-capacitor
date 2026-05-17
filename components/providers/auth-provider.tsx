'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
import { useAuthStore } from '@/store/auth';

const ADDRESS_COLS = 'address_street, address_rt, address_rw, address_village, address_district, address_city, address_province, address_postal_code, address_full, lat, lng';

async function ensureProfileExists(userId: string, email: string, userMetadata?: { full_name?: string; name?: string; role?: string }) {
  const fullName = userMetadata?.full_name || userMetadata?.name || email.split('@')[0] || 'User';
  const role = userMetadata?.role || 'customer';

  const { error } = await supabase.from('users').insert({
    id: userId,
    full_name: fullName,
    email: email,
    role: role as 'customer' | 'vendor',
  });

  if (error && !error.message?.includes('duplicate')) {
    console.error('[AuthProvider] Failed to create profile:', error);
    return false;
  }
  return true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId: string, email: string, userMetadata?: Record<string, unknown>) {
      if (profile?.id === userId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select(`id, email, full_name, role, phone, avatar_url, ${ADDRESS_COLS}`)
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            const inserted = await ensureProfileExists(
              userId,
              email,
              userMetadata as { full_name?: string; name?: string; role?: string } | undefined,
            );

            if (inserted) {
              const { data: retryData, error: retryError } = await supabase
                .from('users')
                .select(`id, email, full_name, role, phone, avatar_url, ${ADDRESS_COLS}`)
                .eq('id', userId)
                .single();

              if (!retryError && retryData && mounted) {
                setProfile({
                  id: retryData.id,
                  email: retryData.email,
                  full_name: retryData.full_name,
                  role: retryData.role as 'customer' | 'vendor' | 'admin',
                  phone: retryData.phone,
                  avatar_url: retryData.avatar_url,
                  address_street: retryData.address_street,
                  address_rt: retryData.address_rt,
                  address_rw: retryData.address_rw,
                  address_village: retryData.address_village,
                  address_district: retryData.address_district,
                  address_city: retryData.address_city,
                  address_province: retryData.address_province,
                  address_postal_code: retryData.address_postal_code,
                  address_full: retryData.address_full,
                  lat: retryData.lat,
                  lng: retryData.lng,
                });
                if (mounted) setLoading(false);
                return;
              }
            }
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
            phone: data.phone,
            avatar_url: data.avatar_url,
            address_street: data.address_street,
            address_rt: data.address_rt,
            address_rw: data.address_rw,
            address_village: data.address_village,
            address_district: data.address_district,
            address_city: data.address_city,
            address_province: data.address_province,
            address_postal_code: data.address_postal_code,
            address_full: data.address_full,
            lat: data.lat,
            lng: data.lng,
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
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setLoading(true);
      }
      if (session) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
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
  }, []);

  return <>{children}</>;
}

