'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';

const supabase = createClient();

export type NotificationPreference = {
  id: string;
  user_id: string;
  channel: string;
  push_enabled: boolean;
  email_enabled: boolean;
};

export type AppNotification = {
  id: string;
  user_id: string;
  category: 'order' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  icon: string | null;
  url: string | null;
  metadata: unknown;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

export function useNotificationPreferences() {
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ['notification-preferences', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', profile!.id);

      if (error) throw error;
      return data as NotificationPreference[];
    },
    enabled: !!profile,
  });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async ({
      channel,
      push_enabled,
    }: {
      channel: string;
      push_enabled: boolean;
    }) => {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ push_enabled })
        .eq('user_id', profile!.id)
        .eq('channel', channel);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', profile?.id] });
    },
  });
}

export function useNotificationsList() {
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AppNotification[];
    },
    enabled: !!profile,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ['notifications-unread', profile?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile!.id)
        .eq('is_read', false);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!profile,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', profile!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', profile?.id] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', profile!.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', profile?.id] });
    },
  });
}
