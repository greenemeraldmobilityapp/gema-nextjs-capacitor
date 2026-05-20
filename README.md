# GEMA — Green Emerald Marketplace App

Platform jasa terintegrasi yang menghubungkan pelanggan dengan vendor terverifikasi. Dibangun dengan Next.js 15 (static export) + Supabase + Capacitor (Android/iOS).

## Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Frontend** | Next.js 15 (static export), Tailwind CSS, Shadcn UI + Base UI |
| **Backend** | Supabase (Auth, Postgres, Storage, Realtime) |
| **State** | TanStack React Query (server), Zustand (UI) |
| **Mobile** | Capacitor (Android + iOS), webDir: `out/` |
| **Payment** | Xendit (via Supabase Edge Functions) |
| **Maps** | Leaflet |

## Prasyarat

- Node.js ≥ 18
- Akun Supabase (gratis)
- `DATABASE_URL` di `.env.local` untuk Drizzle Kit
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup Lokal

```bash
npm install
cp .env.example .env.local   # isi credentials Supabase
npm run dev                   # http://localhost:3000
```

## Scripts Penting

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Static export → `out/` |
| `npm run lint` | ESLint (terpisah, tidak jalan di build) |
| `npx drizzle-kit generate` | Generate migration dari schema |
| `npx cap sync` | Sync web build ke Capacitor |
| `npx cap open android` | Buka Android Studio |

> **Catatan:** Build gagal jika ada TS error. ESLint tidak dijalankan saat build.

## Struktur Proyek

```
app/
├── (auth)/           → login, register, forgot-password
├── customer/         → home, orders, chat, profile, search, vendor
├── vendor/           → dashboard, orders, portfolio, chat, earnings, settings, verification
├── admin/            → dashboard, orders, disputes, transactions
├── wallet/           → topup, withdraw, promo, vouchers
├── onboarding/       → onboarding slides + video
└── page.tsx          → splash screen (root)

components/
├── ui/               → shadcn components (button, card, input, dll)
├── auth/             → AuthGuard, AuthProvider
├── customer/         → CustomerBottomNav
├── vendor/           → VendorBottomNav
└── shared/           → LocationPicker, file-upload

lib/
├── db/schema.ts      → Drizzle schema (source of truth)
├── services/         → React Query hooks per domain
├── supabase/         → Supabase client
└── store/            → Zustand stores

supabase/
├── functions/        → Edge Functions (create-invoice, xendit-webhook, release-payment)
└── migrations/       → SQL migrations
```

## Auth Flow

1. **Splash** (`/`) → cek session Supabase → redirect role-based
2. **Login** → email/password atau Google OAuth
3. **Register** → pilih role (customer/vendor) → redirect ke halaman sesuai role
4. **AuthGuard** → proteksi halaman berdasarkan role

## Deployment

- **Web:** Static export via `npm run build` → deploy `out/` ke hosting statis
- **Mobile:** `npm run build && npx cap sync` → build Android/iOS via studio masing-masing
- Lihat [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) untuk panduan distribusi APK

## Dokumentasi Terkait

- [Testing Checklist](docs/TESTING_CHECKLIST.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Capacitor Android Setup](docs/CAPACITOR_ANDROID_LOCATION_SETUP.md)
- [Supabase Google Setup](docs/SUPABASE_GOOGLE_SETUP.md)
- [Admin Testing](docs/ADMIN_TESTING.md)
