import { create } from 'zustand';

interface UserProfile {
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
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, isLoading: false }),
}));
