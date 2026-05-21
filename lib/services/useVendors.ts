import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type VendorProfile = {
  user_id: string;
  specialization: string | null;
  category_id: string | null;
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
    created_at?: string;
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
        .eq('is_verified', true)
        .limit(50);

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
        .select('*, users(full_name, email, phone, lat, lng, created_at, address_full)')
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
  duration_minutes: number | null;
  status: string;
  service_images?: { image_url: string; sort_order: number | null }[];
};

export function useVendorServices(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-services', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*, service_images(image_url, sort_order)')
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
        .select('*, service_images(image_url, sort_order)')
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
        .eq('is_verified', true)
        .limit(50);

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
      duration_minutes?: number | null;
      category_id?: string;
    }) => {
      const { category_id, ...insertData } = service;
      const { data, error } = await supabase
        .from('services')
        .insert({ ...insertData, category_id, status: 'pending' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', data.vendor_id] });
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
      category_id?: string;
      price?: number;
      description?: string | null;
      duration_minutes?: number | null;
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

      await supabase.storage
        .from('portfolio-images')
        .remove([`${params.vendor_id}/${params.id}/`]);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', variables.vendor_id] });
    },
  });
}

export type CompletedProject = {
  id: string;
  service_name: string;
  service_category: string;
  base_amount: number;
  completed_at: string | null;
  customer: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  reviews: {
    rating: number;
    review_text: string | null;
  }[];
};

export function useVendorCompletedProjects(vendorId: string | undefined, limit: number = 20) {
  return useQuery({
    queryKey: ['vendor-completed-projects', vendorId, limit],
    queryFn: async () => {
      if (!vendorId) return [];
      let query = supabase
        .from('orders')
        .select(`
          id,
          service_name,
          service_category,
          base_amount,
          completed_at,
          customer:customer_id(full_name, avatar_url),
          reviews(rating, review_text)
        `)
        .eq('vendor_id', vendorId)
        .eq('order_status', 'completed')
        .order('completed_at', { ascending: false });

      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as CompletedProject[];
    },
    enabled: !!vendorId,
  });
}
