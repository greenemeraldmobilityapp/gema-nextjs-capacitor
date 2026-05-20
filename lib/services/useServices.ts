import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type ServiceDetail = {
  id: string;
  vendor_id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  duration_minutes: number | null;
  status: string;
  service_images: { image_url: string; sort_order: number | null }[];
  vendor_profiles: {
    user_id: string;
    specialization: string | null;
    rating: number;
    total_jobs: number;
    is_verified: boolean;
    avatar_url: string | null;
    users: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  } | null;
};

export function useServiceDetail(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service-detail', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_images(image_url, sort_order),
          vendor_profiles!inner(
            user_id,
            specialization,
            rating,
            total_jobs,
            is_verified,
            avatar_url,
            users:user_id(full_name, avatar_url)
          )
        `)
        .eq('id', serviceId)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceDetail | null;
    },
    enabled: !!serviceId,
  });
}
