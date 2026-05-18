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
  verification_status: string | null;
  rejection_reason: string | null;
  avatar_url: string | null;
  users?: {
    full_name: string;
    email: string;
    phone: string | null;
    lat: number | null;
    lng: number | null;
    address_full?: string | null;
  };
  services?: { category: string }[];
};

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, users(full_name, email, phone, lat, lng), services(category)')
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
        .maybeSingle();

      if (error) throw error;
      return data as VendorProfile | null;
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
  image_url: string | null;
  status: string;
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

export function useVendorActiveServices(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-services-active', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('status', 'active');

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!vendorId,
  });
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type VendorWithDistance = VendorProfile & { distance?: number };

export function useNearbyVendors(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['vendors-nearby', lat, lng],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*, users(full_name, email, phone, lat, lng)')
        .eq('is_verified', true);

      if (error) throw error;

      let vendors = data as VendorWithDistance[];

      if (lat !== undefined && lng !== undefined) {
        vendors = vendors
          .map((v) => {
            if (v.users?.lat !== null && v.users?.lat !== undefined && v.users?.lng !== null && v.users?.lng !== undefined) {
              return {
                ...v,
                distance: haversineDistance(lat, lng, v.users.lat, v.users.lng),
              };
            }
            return v;
          })
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      return vendors;
    },
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
      image_url?: string | null;
    }) => {
      const { error } = await supabase
        .from('services')
        .insert({ ...service, status: 'pending' });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendor_id] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: {
      id: string;
      vendor_id: string;
      title?: string;
      category?: string;
      price?: number;
      description?: string | null;
      image_url?: string | null;
    }) => {
      const { id, vendor_id, ...updates } = service;
      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendor_id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; vendor_id: string }) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendor_id] });
    },
  });
}
