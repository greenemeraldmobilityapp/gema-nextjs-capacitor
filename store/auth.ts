import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'vendor' | 'admin' | null;
  phone?: string | null;
  avatar_url?: string | null;
  address_street?: string | null;
  address_rt?: string | null;
  address_rw?: string | null;
  address_village?: string | null;
  address_district?: string | null;
  address_city?: string | null;
  address_province?: string | null;
  address_postal_code?: string | null;
  address_full?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  isVendor: boolean;
  mode: 'customer' | 'vendor';
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setMode: (mode: 'customer' | 'vendor') => void;
  setVendorStatus: (isVendor: boolean) => void;
  checkVendorStatus: (userId: string) => Promise<boolean>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isLoading: true,
  isVendor: false,
  mode: 'customer',

  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  setMode: (mode) => set({ mode }),

  setVendorStatus: (isVendor) => set({ isVendor }),

  checkVendorStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        set({ isVendor: false });
        return false;
      }
      const isVendor = !!data;
      set({ isVendor });
      return isVendor;
    } catch {
      set({ isVendor: false });
      return false;
    }
  },

  reset: () => set({ profile: null, isLoading: false, isVendor: false, mode: 'customer' }),
}));
