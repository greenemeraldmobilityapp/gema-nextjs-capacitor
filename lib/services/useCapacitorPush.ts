'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

const supabase = createClient();

export function useCapacitorPush() {
  const profile = useAuthStore((s) => s.profile);
  const initialized = useRef(false);

  useEffect(() => {
    if (!profile) return;
    if (!Capacitor.isNativePlatform()) return;
    if (initialized.current) return;
    initialized.current = true;

    let cancelled = false;
    const cleanupFns: (() => void)[] = [];

    async function init() {
      try {
        const permResult = await PushNotifications.requestPermissions();
        if (cancelled) return;
        if (permResult.receive !== 'granted') return;

        await PushNotifications.register();

        const regHandler = await PushNotifications.addListener('registration', async (token) => {
          if (cancelled) return;
          const currentProfile = useAuthStore.getState().profile;
          if (!currentProfile) return;

          await supabase.from('push_tokens').upsert(
            {
              user_id: currentProfile.id,
              token: token.value,
              platform: Capacitor.getPlatform(),
              device_info: {
                userAgent: navigator.userAgent,
                language: navigator.language,
              },
            },
            { onConflict: 'token' }
          );
        });
        cleanupFns.push(() => regHandler.remove());

        const errHandler = await PushNotifications.addListener('registrationError', (err) => {
          console.error('Capacitor push registration error:', err);
        });
        cleanupFns.push(() => errHandler.remove());

        const fgHandler = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          if (cancelled) return;
          const title = notification.title || 'Notifikasi';
          const body = notification.body || '';
          toast(title, {
            description: body,
            duration: 5000,
          });
        });
        cleanupFns.push(() => fgHandler.remove());

        const tapHandler = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          if (cancelled) return;
          const url = (action.notification.data as Record<string, string>)?.url;
          if (url && typeof url === 'string') {
            window.location.href = url;
          }
        });
        cleanupFns.push(() => tapHandler.remove());
      } catch (err) {
        console.error('Capacitor push init error:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [profile]);
}
