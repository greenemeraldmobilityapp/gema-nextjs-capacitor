import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type SearchFilters = {
  query: string;
  category?: string;
  city?: string;
  district?: string;
  minRating?: number;
  sort?: 'relevance' | 'rating' | 'jobs' | 'newest' | 'nearest';
  page: number;
  lat?: number;
  lng?: number;
};

export type SearchResult = {
  user_id: string;
  specialization: string | null;
  bio: string | null;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
  avatar_url: string | null;
  coverage_radius: number | null;
  min_price: number;
  distance_km: number | null;
  relevance: number;
  full_name: string;
  email: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  address_city: string | null;
  address_district: string | null;
};

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useSearchVendors(filters: SearchFilters) {
  return useQuery({
    queryKey: ['vendors-search', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_vendors', {
        p_search: filters.query || '',
        p_category: filters.category || null,
        p_city: filters.city || null,
        p_district: filters.district || null,
        p_min_rating: filters.minRating ?? null,
        p_sort: filters.sort || 'relevance',
        p_page: filters.page,
        p_page_size: 20,
        p_lat: filters.lat ?? null,
        p_lng: filters.lng ?? null,
      });

      if (error) throw error;
      return (data || []) as SearchResult[];
    },
  });
}

export function useSearchFilterOptions() {
  return useQuery({
    queryKey: ['search-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_search_filter_options');

      if (error) throw error;
      return data as { cities: string[]; districts: string[] };
    },
    staleTime: 5 * 60 * 1000,
  });
}
