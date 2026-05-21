'use client';

import { useEffect } from 'react';
import { usePushToken, removePushTokens } from '@/lib/services/usePushNotifications';
import { useCapacitorPush } from '@/lib/services/useCapacitorPush';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function NotificationInit() {
  usePushToken();
  useCapacitorPush();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        removePushTokens();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
