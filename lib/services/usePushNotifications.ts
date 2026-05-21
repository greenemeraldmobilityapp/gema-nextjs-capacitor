'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { initFirebase, getFcmToken } from '@/lib/firebase/client';

const supabase = createClient();

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }
  if (Notification.permission === 'granted') return Promise.resolve('granted');
  if (Notification.permission === 'denied') return Promise.resolve('denied');
  return Notification.requestPermission();
}

export async function registerFcmToken(): Promise<string | null> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return null;

  await initFirebase();

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) return null;

  const token = await getFcmToken(vapidKey);
  if (!token) return null;

  const profile = useAuthStore.getState().profile;
  if (!profile) return null;

  await supabase.from('push_tokens').upsert(
    {
      user_id: profile.id,
      token,
      platform: 'web',
      device_info: {
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
    },
    { onConflict: 'token' }
  );

  return token;
}

export async function removePushTokens(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  await supabase.from('push_tokens').delete().eq('user_id', session.user.id);
}

export function usePushToken() {
  const profile = useAuthStore((s) => s.profile);
  const registered = useRef(false);

  useEffect(() => {
    if (!profile) {
      registered.current = false;
      return;
    }
    if (registered.current) return;
    registered.current = true;

    registerFcmToken();
  }, [profile]);
}
