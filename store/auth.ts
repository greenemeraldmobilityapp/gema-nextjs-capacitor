import { create } from 'zustand';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'vendor' | 'admin' | null;
}

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true, // starts loading until supabase auth state is resolved
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
