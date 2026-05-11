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
  created_at: string;
  customer?: { full_name: string } | null;
};

export function useVendorReviews(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:customer_id(full_name)')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

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
    }) => {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          order_id: review.order_id,
          customer_id: review.customer_id,
          vendor_id: review.vendor_id,
          rating: review.rating,
          review_text: review.review_text || null,
        });

      if (insertError) throw insertError;

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('vendor_id', review.vendor_id);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const { error: updateError } = await supabase
          .from('vendor_profiles')
          .update({ rating: Math.round(avgRating * 10) / 10 })
          .eq('user_id', review.vendor_id);

        if (updateError) throw updateError;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', variables.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['order-review', variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendor_id] });
    },
  });
}
