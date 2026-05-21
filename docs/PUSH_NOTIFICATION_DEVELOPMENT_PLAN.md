# Rencana Pengembangan Push Notification — GEMA

## Status Saat Ini

| Komponen | Status | Lokasi |
|----------|--------|--------|
| Service worker (SW) dasar | ✅ Ada | `public/sw.js` — handle `push` & `notificationclick` |
| Registrasi SW | ✅ Ada | `components/shared/NotificationInit.tsx` — register `/sw.js` di layout |
| UI toggle notif (customer) | ⚠️ UI-only (lokal state) | `app/customer/settings/notifications/page.tsx` |
| UI toggle notif (vendor) | ⚠️ UI-only (lokal state) | `app/vendor/settings/page.tsx` |
| Firebase project & FCM SDK | ❌ Perlu setup manual | Lihat catatan di bawah |
| `Notification.requestPermission()` | ✅ Ada | `lib/services/usePushNotifications.ts` |
| FCM token registration (`getToken`) | ✅ Ada | `lib/services/usePushNotifications.ts` |
| FCM token cleanup on logout | ✅ Ada | `components/shared/NotificationInit.tsx` — listen SIGNED_OUT |
| Tabel `push_tokens` di DB | ✅ Migrasi 0018 & 0019 sudah di-apply | — |
| Tabel `notifications` di DB | ✅ Migrasi 0018 & 0019 sudah di-apply | — |
| Tabel `notification_preferences` di DB | ✅ Migrasi 0018 & 0019 sudah di-apply | — |
| Hook `usePushToken` | ✅ Ada | `lib/services/usePushNotifications.ts` |
| Hook `useNotificationPreferences` | ✅ Ada | `lib/services/useNotifications.ts` |
| Hook `useUpdateNotificationPreference` | ✅ Ada | `lib/services/useNotifications.ts` |
| Hook `useNotificationsList` | ✅ Ada | `lib/services/useNotifications.ts` |
| Hook `useUnreadCount` | ✅ Ada | `lib/services/useNotifications.ts` |
| Hook `useMarkAsRead` | ✅ Ada | `lib/services/useNotifications.ts` |
| Hook `useMarkAllAsRead` | ✅ Ada | `lib/services/useNotifications.ts` |
| Edge Function kirim push | ✅ Ada | `supabase/functions/send-push/index.ts` + integrasi di `xendit-webhook` & `release-payment` |
| Bell icon + unread badge | ✅ Ada | `components/shared/NotifBell.tsx` — auto-reads `useUnreadCount` |
| Capacitor push native | ✅ Ada | `lib/services/useCapacitorPush.ts` — register, foreground toast, tap navigate |
| Broadcast push admin | ✅ Ada | `supabase/functions/broadcast-push/index.ts` + `app/admin/broadcast/page.tsx` |
| Rate limit retry (3x) | ✅ Ada | `supabase/functions/_shared/fcm.ts` — exponential backoff |
| Vendor nearby proximity | ⏸️ Ditunda | Butuh geo query + coverage radius logic |

## Catatan — Manual Setup Firebase

Sebelum push notification bisa berfungsi, kamu perlu:

1. **Buat Firebase project** di https://console.firebase.google.com
   - Nama bebas (misal: `gema-push`)
   - Enable **Cloud Messaging** (otomatis aktif)

2. **Generate Web Push certificate (VAPID key)**
   - Firebase Console → Project Settings → Cloud Messaging
   - Web Push certificates → Generate key pair
   - Copy VAPID public key

3. **Catat credential** dari Project Settings → General → Web App:
   ```
   apiKey          → NEXT_PUBLIC_FCM_API_KEY
   authDomain      → NEXT_PUBLIC_FCM_AUTH_DOMAIN
   projectId       → NEXT_PUBLIC_FCM_PROJECT_ID
   messagingSenderId → NEXT_PUBLIC_FCM_SENDER_ID
   appId           → NEXT_PUBLIC_FCM_APP_ID
   ```
   VAPID public key → `NEXT_PUBLIC_FCM_VAPID_KEY`

4. **Server key** (untuk Edge Function kirim push):
   - Firebase Console → Cloud Messaging → Cloud Messaging API
   - Copy **Server key** → simpan sebagai `FCM_SERVER_KEY` di Supabase secrets:
     ```bash
     supabase secrets set FCM_SERVER_KEY=AAAA...
     ```

5. **Isi `.env.local`** dengan 6 variabel di atas (mulai dengan `NEXT_PUBLIC_`)
   - Kosongkan dulu — build & dev tetap jalan, push baru error saat kirim FCM

6. **Android — `google-services.json`** (untuk FCM native via Capacitor):
   - Firebase Console → Project Settings → General → Your apps → **Add app** → Android
   - Package name: `com.greenemerald.gema` (lihat `capacitor.config.ts`)
   - Download `google-services.json` → letakkan di `android/app/`
   - App signing certificate SHA-256 opsional untuk development

7. **iOS — APNs** (untuk FCM native via Capacitor):
   - Enable Push Notifications capability di Xcode
   - Upload APNs key ke Firebase Console → Cloud Messaging → iOS app configuration

## Arsitektur

```
                    ╔═══════════════════════╗
                    ║   Firebase Console    ║
                    ║   (FCM - gratis)      ║
                    ╚═══════════════╤═══════╝
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   ┌──────────────┐       ┌─────────────────┐       ┌──────────────────┐
   │   Browser    │       │  Supabase        │       │  Android/iOS     │
   │ (Web PWA)    │       │  Edge Functions  │       │  (Capacitor)     │
   │              │       │                  │       │                  │
   │ firebase-mess│       │  send-notif.ts   │       │  native FCM SDK  │
   │ aging-sw.js  │◄──────│  xendit-webhook  │──────►│  @capacitor/     │
   │              │       │  (tambah push)   │       │  push-notif      │
   └──────────────┘       └─────────────────┘       └──────────────────┘
          │                         │
          │                         │
          ▼                         ▼
   ┌──────────────┐       ┌─────────────────┐
   │   IndexedDB  │       │  Supabase DB    │
   │   (SW cache) │       │  ┌───────────┐  │
   │              │       │  │push_tokens│  │
   │              │       │  ├───────────┤  │
   │              │       │  │notificat- │  │
   │              │       │  │ions       │  │
   │              │       │  └───────────┘  │
   └──────────────┘       └─────────────────┘

Alur pengiriman:
1. Backend (Edge Function) → POST ke FCM REST API
2. FMC → kirim notif ke device berdasarkan token
3. Service worker terima event 'push' → tampilkan notifikasi
4. User klik → buka URL tujuan
5. Notifikasi juga disimpan ke tabel `notifications` untuk riwayat
```

## Fase Implementasi

---

### Fase 1: Setup Firebase Project + SDK

**Estimasi: 1 hari**

1. Buat Firebase project (konsol.firebase.google.com):
   - Nama: `gemma-push` (atau sesuai project existing)
   - Web push: enable Cloud Messaging API
   - Generate VAPID key (Web Push certificate) di Project Settings > Cloud Messaging
2. Catat credential:
   - `apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`
   - VAPID public/private key
   - Server key (untuk FCM REST API)
3. Install `firebase` SDK:
   ```bash
   npm install firebase
   ```
4. Buat `public/firebase-messaging-sw.js`:
   - Import FCM SDK via `importScripts`
   - Inisialisasi Firebase app
   - Handle `onBackgroundMessage`
5. Buat `lib/firebase/client.ts`:
   - Inisialisasi Firebase app untuk frontend
   - Export `messaging`, `onMessage`, `getToken`
6. Update `supabase/migrations/0018_push_notifications.sql`:
   - Buat tabel `push_tokens`
   - Buat tabel `notification_preferences`
   - Buat tabel `notifications`
   - RLS policies

**Dependency**: Firebase project (gratis)
**Output**: Firebase siap di frontend, tabel database siap

---

### Fase 2: Token Registration + Permission

**Estimasi: 2 hari**

1. Buat `lib/services/usePushNotifications.ts`:
   - `requestNotificationPermission()` — minta izin
   - `getFcmToken()` — daftarkan FCM token, simpan ke `push_tokens`
   - `usePushToken()` — hook untuk auto-register saat login
   - `onTokenRefresh()` — update token saat FCM refresh
2. Buat `lib/services/useNotifications.ts`:
   - `useNotificationPreferences` — baca/tulis preferensi ke DB
   - `useNotificationsList` — baca riwayat notifikasi
   - `useMarkAsRead` — tandai sudah dibaca
   - `useUnreadCount` — hitung notifikasi belum dibaca
3. Update `components/shared/NotificationInit.tsx`:
   - Setelah register SW, panggil `requestNotificationPermission()`
   - Jika diizinkan, panggil `getFcmToken()`
   - Simpan token ke `push_tokens` table via Supabase
4. Integrasi ke `AuthGuard` (atau halaman login):
   - Register FCM token setiap user login
   - Hapus token saat logout (`DELETE FROM push_tokens WHERE token = ?`)

**Dependency**: Fase 1
**Output**: Token tersimpan di DB, user bisa pilih izin/batal

---

### Fase 3: Backend — Edge Function + FCM REST API

**Estimasi: 2 hari**

1. Buat helper library `supabase/functions/_shared/fcm.ts`:
   ```ts
   // Kirim notif ke single device
   async function sendFcm(token: string, payload: FcmPayload): Promise<void>
   
   // Kirim notif ke topic
   async function sendToTopic(topic: string, payload: FcmPayload): Promise<void>
   
   // Kirim notif ke multiple devices
   async function sendMulticast(tokens: string[], payload: FcmPayload): Promise<void>
   
   // Simpan notifikasi ke tabel notifications
   async function saveNotification(userId: string, notification: NotificationData): Promise<void>
   ```

2. Buat `supabase/functions/send-push/index.ts`:
   - Edge Function yang dipanggil oleh fungsi backend lain
   - Terima `{ userId, title, body, url, metadata }`
   - Cari token user di `push_tokens`
   - Kirim via FCM + simpan ke tabel `notifications`
   - Return sukses/gagal

3. Update Edge Functions yang sudah ada untuk kirim push:

   | Edge Function | Trigger Kirim Notif | Penerima |
   |---------------|--------------------|----------|
   | `xendit-webhook` | Pembayaran sukses | Customer: "Pembayaranmu sudah diterima" |
   | `create-invoice` | Invoice dibuat | Vendor: "Pesanan baru masuk!" |
   | `release-payment` | Dana dirilis | Vendor: "Pembayaran untuk pesanan [order] sudah dirilis" |

   Tambahkan `sendToUser()` di akhir flow masing-masing.

4. Integrasi trigger dari perubahan tabel **orders/chats/messages** via Supabase Database Webhook:
   - `orders INSERT` → notif vendor: "Pesanan baru!"
   - `orders UPDATE status = completed` → notif customer: "Pesanan selesai!"
   - `messages INSERT` → notif penerima chat: "Pesan baru dari [nama]"

**Dependency**: Fase 1, Fase 2
**Output**: Notification engine berfungsi

---

### Fase 4: Frontend — Notification UI

**Estimasi: 2 hari**

1. Halaman daftar notifikasi:
   - Buat `app/(shared)/notifications/page.tsx` (atau `/customer/notifications`)
   - Daftar notifikasi terbaru (most recent first)
   - Setiap item: icon, title, body, timestamp, status baca
   - Tap → navigasi ke URL notifikasi
   - Swipe/tap mark as read
   - Tombol "Tandai semua sudah dibaca"
   - Pull-to-refresh

2. Bell icon di navigasi:
   - Tambahkan badge `unread_count` di icon 🔔 pada navigasi bottom
   - Customer bottom nav: `app/components/shared/CustomerBottomNav.tsx`
   - Vendor bottom nav: `app/components/shared/VendorBottomNav.tsx`
   - Polling query `useUnreadCount()` dengan `refetchInterval: 30_000`

3. Update halaman settings notifikasi:
   - `app/customer/settings/notifications/page.tsx`:
     - Ganti `useState` → `useNotificationPreferences`
     - Simpan ke DB via `supabase.from('notification_preferences').upsert()`
   - `app/vendor/settings/page.tsx`:
     - Sama, ganti dengan data dari DB

4. Handle incoming FCM message (foreground):
   - Di `NotificationInit.tsx`, set `onMessage()` handler
   - Tampilkan sebagai sonner toast (bukan system notification)
   - Update unread count secara realtime

5. Service worker improvement:
   - Update `public/sw.js` → upgrade ke `firebase-messaging-sw.js`
   - Handle background messages
   - Deep link ke halaman spesifik berdasarkan data URL

6. Option: Notification preferences per channel:
   - Customer settings: order, chat, promo, system
   - Vendor settings: order, chat, promo, system

**Dependency**: Fase 2, Fase 3
**Output**: UI notifikasi lengkap + push notification berfungsi

---

### Fase 5: Capacitor Native (Android/iOS)

**Estimasi: 2 hari**

1. Install plugin:
   ```bash
   npm install @capacitor/push-notifications
   npx cap sync
   ```

2. Konfigurasi Android:
   - `android/app/google-services.json` dari Firebase Console
   - Update `android/build.gradle` dengan google-services plugin
   - Handle notification channel untuk Android 8+

3. Konfigurasi iOS:
   - Upload APNs key ke Firebase Console
   - Enable Push Notification capability di Xcode
   - Handle notification delegate

4. Buat `lib/capacitor/push.ts`:
   - Register push di native (dapatkan token)
   - Kirim token ke Supabase (sama dengan FCM token dari web)
   - Handle `pushNotificationReceived` (foreground)
   - Handle `pushNotificationActionPerformed` (tap)

5. Update `NotificationInit.tsx` untuk platform detection:
   - Web: pakai FCM web SDK
   - Android/iOS: pakai `@capacitor/push-notifications`

**Dependency**: Fase 1–4, Firebase project siap
**Output**: Push notification berfungsi di Android & iOS

---

### Fase 6 (Opsional): Advanced Features

**Estimasi: 2 hari**

1. **Promo broadcast**: Panel admin untuk kirim push ke semua user
   - Fitur di halaman `/admin/promos`
   - Pilih target: all users, vendor-only, customer-only
   - Jadwalkan notifikasi (kirim nanti)
   - CTA URL (buka promo page)

2. **Vendor online nearby**: Notifikasi proximity
   - Saat vendor set `isOnline: true` dan customer dalam coverage radius
   - "Vendor [nama] sedang online di dekat Anda!"

3. **Analytics**:
   - Track delivery rate (FCM callback)
   - Track open rate (via `notificationclick` + API call)
   - Dashboard view di admin

4. **Falling logic**:
   - Jika FCM token expired/invalid → update/hapus dari DB
   - Retry 3x jika FCM rate limited

**Dependency**: Fase 1–5

---

## Database Schema

### Migration `0018_push_notifications.sql`

```sql
-- 1. PUSH TOKENS
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'android', 'ios')),
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(token)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- User bisa baca token sendiri; admin bisa baca semua
CREATE POLICY "push_tokens_select_own" ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- User bisa insert/update token sendiri
CREATE POLICY "push_tokens_insert_own" ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_own" ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Edge Function (service_role) perlu baca semua token untuk kirim notif
-- Ini dihandle via service_role, bukan RLS


-- 2. NOTIFICATION PREFERENCES
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('order', 'chat', 'promo', 'system')),
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  email_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, channel)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_prefs_select_own" ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_prefs_upsert_own" ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_prefs_update_own" ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Seed default preferences saat user register (via trigger)
CREATE OR REPLACE FUNCTION seed_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, channel) VALUES
    (NEW.id, 'order'),
    (NEW.id, 'chat'),
    (NEW.id, 'promo'),
    (NEW.id, 'system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION seed_notification_preferences();


-- 3. NOTIFICATIONS (riwayat)
CREATE TYPE notification_category AS ENUM ('order', 'chat', 'promo', 'system');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category notification_category NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  url TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-hapus notifikasi lebih dari 90 hari (via pg_cron atau aplikasi)
```

## Edge Function: `send-push`

**`supabase/functions/send-push/index.ts`** (pola)

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PushPayload {
  userId: string;
  category: 'order' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  const payload: PushPayload = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Cek preferensi user
  const { data: pref } = await supabase
    .from("notification_preferences")
    .select("push_enabled")
    .eq("user_id", payload.userId)
    .eq("channel", payload.category)
    .single();

  if (pref?.push_enabled === false) {
    return new Response(JSON.stringify({ sent: false, reason: "disabled" }));
  }

  // 2. Ambil semua token user
  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token, platform")
    .eq("user_id", payload.userId);

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: false, reason: "no_tokens" }));
  }

  // 3. Kirim ke FCM
  const fcmKey = Deno.env.get("FCM_SERVER_KEY")!;
  const results = await Promise.allSettled(
    tokens.map((t) =>
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmKey}`,
        },
        body: JSON.stringify({
          to: t.token,
          notification: {
            title: payload.title,
            body: payload.body,
            icon: "/icon.png",
          },
          data: {
            url: payload.url || "/",
            category: payload.category,
            ...payload.metadata,
          },
          webpush: {
            fcm_options: { link: payload.url || "/" },
          },
        }),
      })
    )
  );

  // 4. Simpan ke riwayat
  await supabase.from("notifications").insert({
    user_id: payload.userId,
    category: payload.category,
    title: payload.title,
    body: payload.body,
    url: payload.url,
    metadata: payload.metadata,
  });

  // 5. Hapus token invalid
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      const res = r.value;
      if (res.status === 400 || res.status === 404) {
        // Token invalid/expired
        await supabase
          .from("push_tokens")
          .delete()
          .eq("token", tokens[i].token);
      }
    }
  }

  return new Response(JSON.stringify({ sent: true }));
});
```

## Environment Variables (`.env.local`)

```
FCM_API_KEY=AIzaSy...
FCM_SENDER_ID=123456789
FCM_APP_ID=1:123456789:web:abc123
FCM_VAPID_KEY=BC...
FCM_SERVER_KEY=AAAA...
```

Juga perlu diset di Supabase Edge Function secrets:
```bash
supabase secrets set FCM_SERVER_KEY=AAAA...
```

## Integrasi ke Edge Functions Existing

### `xendit-webhook/index.ts` — tambahkan setelah update payment:
```ts
// Setelah payment status jadi 'paid'
await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
  method: "POST",
  headers: { Authorization: `Bearer ${ANON_KEY}` },
  body: JSON.stringify({
    userId: order.customer_id,
    category: "order",
    title: "Pembayaran Diterima",
    body: `Pembayaran Rp ${order.total_amount.toLocaleString("id-ID")} untuk ${order.service_name} sudah dikonfirmasi.`,
    url: `/customer/orders/detail?id=${order.id}`,
  }),
});
```

## Testing Checklist

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | SW terdaftar | DevTools → Application → Service Workers: registered |
| 2 | Minta izin notif muncul | Prompt browser: "GEMA ingin mengirim notifikasi" |
| 3 | Izin diberikan | Token FCM tersimpan di `push_tokens` |
| 4 | Token tersimpan di DB | `supabase.from('push_tokens').select('*')` ada data |
| 5 | Kirim test push via Edge Function | Notif muncul di browser/device |
| 6 | User klik notif | Buka halaman sesuai `url` |
| 7 | Notif di foreground | Sonner toast (bukan system notif) |
| 8 | Notif di background | System notification |
| 9 | Unread count badge | Bell icon tampilkan angka |
| 10 | Tandai sudah dibaca | Badge berkurang |
| 11 | Toggle off "order" di settings | Tidak terima push untuk order |
| 12 | Logout → token terhapus | `push_tokens` tidak punya token user tsb |
| 13 | Capacitor Android | Notif muncul di Android notification tray |
| 14 | Capacitor iOS | Notif muncul di iOS notification center |

## Timeline Estimasi

| Fase | Hari | Dependensi |
|------|------|-----------|
| Fase 1: Setup Firebase + DB | 1 | — |
| Fase 2: Token + Permission | 2 | Fase 1 |
| Fase 3: Backend push engine | 2 | Fase 1, 2 |
| Fase 4: Frontend UI | 2 | Fase 2, 3 |
| Fase 5: Capacitor native | 2 | Fase 1–4 |
| Fase 6: Advanced (opsional) | 2 | Fase 1–5 |

**Total**: ~7–11 hari tergantung scope

## Biaya

| Komponen | Biaya |
|----------|-------|
| Firebase Cloud Messaging (FCM) | **Gratis** |
| Firebase project (Spark plan) | **Gratis** |
| Supabase Edge Function calls | Termasuk paket Supabase (gratis di Pro — 500k invocations/bln) |
| Supabase DB storage (notifications) | Termasuk paket Supabase |
| APNs (Apple) | Gratis dengan Apple Developer ($99/thn) |

**Total biaya tambahan: Rp 0 per bulan** selama dalam batas wajar.
