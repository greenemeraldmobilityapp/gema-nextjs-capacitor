import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export type CustomerChatWithOrder = {
  id: string;
  order_id: string;
  created_at: string;
  order: {
    id: string;
    service_name: string;
    customer_id: string;
    vendor_id: string;
    vendor: { users: { full_name: string } } | null;
  };
  last_message: {
    message: string;
    created_at: string;
    sender_id: string;
  } | null;
};

export type ChatMessage = {
  id: string;
  chat_id: string;
  sender_id: string | null;
  message: string | null;
  attachment_url: string | null;
  created_at: string;
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
    refetchInterval: 5000,
  });
}

export function useCustomerChats(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-chats', customerId],
    queryFn: async () => {
      if (!customerId) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerId);

      if (ordersError) throw ordersError;
      if (!orders.length) return [];

      const orderIds = orders.map(o => o.id);

      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*, order:order_id(service_name, customer_id, vendor_id, vendor:vendor_id(users!inner(full_name)))')
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
          } as CustomerChatWithOrder;
        })
      );

      return chatsWithMessages;
    },
    enabled: !!customerId,
    refetchInterval: 5000,
  });
}

export function useChatByOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['chat-by-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; order_id: string; created_at: string } | null;
    },
    enabled: !!orderId,
  });
}

export function useChatMessages(chatId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!chatId,
    refetchInterval: 5000,
  });
}

export function useRealtimeMessages(chatId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          queryClient.setQueryData(['chat-messages', chatId], (old: ChatMessage[] | undefined) => {
            if (!old) return [payload.new as ChatMessage];
            if (old.some((m) => m.id === payload.new.id)) return old;
            return [...old, payload.new as ChatMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      senderId,
      message,
    }: {
      chatId: string;
      senderId: string;
      message: string;
    }) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          message,
        });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
    },
  });
}

export function useSendImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, senderId, file }: {
      chatId: string
      senderId: string
      file: File
    }) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${chatId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName)

      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: senderId,
        attachment_url: publicUrl,
        message: null,
      })
      if (error) throw error
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}

export async function postSystemMessage(chatId: string, message: string) {
  const { error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: null,
      message,
    })
  if (error) throw error
}
