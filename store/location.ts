import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  lastFetched: number | null;
  setLocation: (lat: number, lng: number) => void;
  clearLocation: () => void;
}

const CACHE_TTL = 5 * 60 * 1000;

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  lastFetched: null,
  setLocation: (lat, lng) => set({ lat, lng, lastFetched: Date.now() }),
  clearLocation: () => set({ lat: null, lng: null, lastFetched: null }),
}));
