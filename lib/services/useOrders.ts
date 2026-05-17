import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type Order = {
  id: string;
  customer_id: string;
  vendor_id: string;
  service_id: string;
  service_category: string;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string | null;
  service_address: string;
  notes: string | null;
  base_amount: number;
  platform_fee: number;
  vendor_payout: number;
  total_amount: number;
  payment_status: 'unpaid' | 'escrow' | 'released' | 'refunded';
  order_status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  customer?: {
    full_name: string;
    phone: string | null;
    address_street?: string | null;
    address_rt?: string | null;
    address_rw?: string | null;
    address_village?: string | null;
    address_district?: string | null;
    address_city?: string | null;
    address_province?: string | null;
    address_postal_code?: string | null;
    address_full?: string | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
};

export function useCustomerOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!customerId,
  });
}

export function useVendorOrders(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-orders', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customer_id(full_name, phone, address_street, address_rt, address_rw, address_village, address_district, address_city, address_province, address_postal_code, address_full, lat, lng)')
        .eq('vendor_id', vendorId)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!vendorId,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customer_id(full_name, phone, address_street, address_rt, address_rw, address_village, address_district, address_city, address_province, address_postal_code, address_full, lat, lng)')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      customer_id: string;
      vendor_id: string;
      service_id: string;
      service_category: string;
      service_name: string;
      scheduled_date: string;
      scheduled_time: string | null;
      service_address: string;
      notes: string | null;
      base_amount: number;
      platform_fee: number;
      vendor_payout: number;
      total_amount: number;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          payment_status: 'unpaid',
          order_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('chats').insert({ order_id: data.id });

      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      order_status,
      completed_at,
      cancelled_at,
      payment_status,
    }: {
      orderId: string;
      order_status?: Order['order_status'];
      completed_at?: string | null;
      cancelled_at?: string | null;
      payment_status?: Order['payment_status'];
    }) => {
      const updates: Record<string, unknown> = {};
      if (order_status !== undefined) updates.order_status = order_status;
      if (completed_at !== undefined) updates.completed_at = completed_at;
      if (cancelled_at !== undefined) updates.cancelled_at = cancelled_at;
      if (payment_status !== undefined) updates.payment_status = payment_status;

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
}
