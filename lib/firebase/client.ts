'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID!,
};

let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

export async function initFirebase() {
  if (typeof window === 'undefined') return;

  const supported = await isSupported();
  if (!supported) return;

  app = getApps().length ? getApp() : initializeApp(firebaseConfig, 'GEMA');
  messaging = getMessaging(app);
}

export function getFirebaseApp() {
  return app;
}

export function getFirebaseMessaging() {
  return messaging;
}

export async function getFcmToken(vapidKey: string): Promise<string | null> {
  if (!messaging) await initFirebase();
  if (!messaging) return null;

  try {
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch {
    return null;
  }
}
