import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type Service = {
  id: string;
  vendor_id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  duration_minutes: number | null;
  status: string;
};

export function useServicesByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['services', 'category', category],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*, vendor_profiles!inner(*)')
        .eq('category', category);

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!category,
  });
}

export function useAllServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, vendor_profiles!inner(*)');

      if (error) throw error;
      return data as Service[];
    },
  });
}
