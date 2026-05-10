import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type ChatWithOrder = {
  id: string;
  order_id: string;
  created_at: string;
  order: {
    id: string;
    service_name: string;
    customer_id: string;
    vendor_id: string;
    customer: { full_name: string } | null;
  };
  last_message: {
    message: string;
    created_at: string;
    sender_id: string;
  } | null;
};

export function useVendorChats(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-chats', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('vendor_id', vendorId);

      if (ordersError) throw ordersError;
      if (!orders.length) return [];

      const orderIds = orders.map(o => o.id);

      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*, order:order_id(service_name, customer_id, vendor_id, customer:customer_id(full_name))')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chatsWithMessages = await Promise.all(
        (chats || []).map(async (chat) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...chat,
            last_message: messages?.[0] || null,
          } as ChatWithOrder;
        })
      );

      return chatsWithMessages;
    },
    enabled: !!vendorId,
  });
}
