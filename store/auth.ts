import { create } from 'zustand';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'vendor' | 'admin' | null;
  phone?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
