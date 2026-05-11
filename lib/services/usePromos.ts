import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type Promo = {
  id: string;
  title: string;
  description: string;
  discount: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export function useActivePromos() {
  return useQuery({
    queryKey: ['promos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promo[];
    },
  });
}

export function useAllPromos() {
  return useQuery({
    queryKey: ['all-promos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promo[];
    },
  });
}
