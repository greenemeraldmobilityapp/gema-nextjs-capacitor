# GEMA — OpenCode Agent Guide

## Stack

- Next.js 15 **static export** (`output: 'export'`) — no SSR, no API routes
- Supabase (Auth + Postgres + Storage) — all data via direct browser client
- TanStack React Query — server state; Zustand — UI state only
- Tailwind + Shadcn UI (base-nova style) + lucide-react icons
- sonner for toasts (`<Toaster />` in `app/layout.tsx`)
- Capacitor (Android/iOS) — webDir is `out/`

## Paths

`@/*` → project root. Use `@/store/auth`, `@/lib/services/useOrders`, etc.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | dev server |
| `npm run build` | static export → `out/` |
| `npm run lint` | ESLint (ignored during build) |

No test framework exists.

## Key Architecture

- **All pages are `'use client'`** — no server components
- **Auth**: `AuthProvider` → `AuthGuard` → role-based redirect. Auth state in `useAuthStore` (zustand). `profile.id` maps to `users.id` (Supabase auth UID)
- **Data**: hooks in `lib/services/*.ts`, each creates its own Supabase client via `createClient()`. All server state through React Query
- **Layouts**: `app/vendor/layout.tsx` and `app/customer/layout.tsx` each mount a bottom nav. Auth/wallet/splash pages have no bottom nav
- **Order status enum**: `pending → accepted → in_progress → completed` (plus `cancelled`)
- **Payment status enum**: `unpaid → escrow → released | refunded`
- **Xendit secret key** must only be used in Supabase Edge Functions, never on frontend

## Schema (source of truth: `lib/db/schema.ts`)

Key tables: `users`, `vendor_profiles`, `services`, `orders`, `chats`, `messages`, `wallets`, `wallet_transactions`, `reviews`, `disputes`

Migration: `supabase/migrations/`, Drizzle config reads `DATABASE_URL` from `.env.local`.
Run `npx drizzle-kit generate` after schema changes, then apply the generated SQL in Supabase.

## Mandatory Workflow — After EVERY code change

1. **Update `roadmap.md`** — check/uncheck tasks in the relevant phase
2. **Update `UI_UX_ROADMAP.md`** — check/uncheck screens and features affected
3. **Update `docs/TESTING_CHECKLIST.md`** — add test scenarios for the change (section K format)
4. **Verify against `prd.md`** — ensure implementation matches PRD architecture and schema
5. **Run `npm run build`** — confirm 0 errors

## Known Gaps (don't assume they exist)

- **No `INSERT` into `orders`** — `createOrder` mutation does not exist, booking page never creates an order. Without this, the booking→payment flow is broken
- **Customer `orders/detail` page uses 100% mock data** — not connected to Supabase
- **No Realtime subscriptions** — chat/orders use React Query polling only
- **Xendit integration** — Edge Functions deployed (create-invoice, xendit-webhook), payment page calls Edge Function with fallback to direct mutation
- **No review system** — `reviews` table exists, no frontend

## Database Setup

SQL files in `supabase/`: run `clean_and_setup.sql` once for fresh DB, then migration files in `supabase/migrations/` incrementally.

## Required Env (`.env.local` — already exists)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=          # for drizzle-kit only
```

## Style Conventions

- Indonesian UI labels (e.g. "Pesanan", "Pendapatan", "Simpan Perubahan")
- Rupiah formatting via `.toLocaleString('id-ID')`
- Shadcn button: `className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700"`
- Toast notifications via `sonner` (`import { toast } from 'sonner'`)
- All pages wrapped in `<Suspense>` when using `useSearchParams`
