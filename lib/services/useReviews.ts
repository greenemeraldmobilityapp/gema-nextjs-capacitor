import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type Review = {
  id: string;
  order_id: string;
  customer_id: string;
  vendor_id: string;
  rating: number;
  review_text: string | null;
  review_image: string | null;
  created_at: string;
  customer?: { full_name: string; avatar_url: string | null } | null;
};

export function useVendorReviews(vendorId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId, limit],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:customer_id(full_name, avatar_url)')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!vendorId,
  });
}

export function useOrderReview(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order-review', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!orderId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      order_id: string;
      customer_id: string;
      vendor_id: string;
      rating: number;
      review_text?: string;
      review_image?: string;
    }) => {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          order_id: review.order_id,
          customer_id: review.customer_id,
          vendor_id: review.vendor_id,
          rating: review.rating,
          review_text: review.review_text || null,
          review_image: review.review_image || null,
        });

      if (insertError) throw insertError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', variables.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['order-review', variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendor_id] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      id: string;
      order_id: string;
      vendor_id: string;
      rating: number;
      review_text?: string;
      review_image?: string;
    }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: review.rating,
          review_text: review.review_text || null,
          review_image: review.review_image || null,
        })
        .eq('id', review.id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', variables.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['order-review', variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendor_id] });
    },
  });
}
