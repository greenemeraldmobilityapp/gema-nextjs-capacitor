import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type VendorProfile = {
  user_id: string;
  specialization: string | null;
  bio: string | null;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
  avatar_url: string | null;
  users?: {
    full_name: string;
    email: string;
    phone: string | null;
    lat: number | null;
    lng: number | null;
  };
};

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, users(full_name, email, phone, lat, lng)')
        .eq('is_verified', true);

      if (error) throw error;
      return data as VendorProfile[];
    },
  });
}

export function useVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, users(full_name, email, phone, lat, lng)')
        .eq('user_id', vendorId)
        .single();

      if (error) throw error;
      return data as VendorProfile;
    },
    enabled: !!vendorId,
  });
}

export type Service = {
  id: string;
  vendor_id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
};

export function useVendorServices(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!vendorId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: {
      vendor_id: string;
      title: string;
      category: string;
      price: number;
      description?: string;
    }) => {
      const { error } = await supabase
        .from('services')
        .insert(service);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendor_id] });
    },
  });
}
