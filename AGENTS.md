# GEMA — OpenCode Agent Guide

## Stack

- Next.js 15 **static export** (`output: 'export'`) — no SSR, no API routes
- Supabase (Auth + Postgres + Storage) — all data via direct browser client
- TanStack React Query — server state; Zustand — UI state only
- Tailwind + Shadcn UI (base-nova style, `@base-ui/react`) + lucide-react icons
- sonner for toasts; Leaflet for maps; Capacitor (Android/iOS, webDir `out/`)

## Commands

| Command | What |
|---------|------|
| `npm run dev` | dev server (port 3000) |
| `npm run dev:host` | dev, `-H 0.0.0.0 -p 3000` |
| `npm run dev:host:3001` (3002-3005) | dev on alternate ports |
| `npm run build` | static export → `out/` |
| `npm run lint` | ESLint (separate — ignored during build) |
| `npx drizzle-kit generate` | migration from `lib/db/schema.ts` |
| `npx cap sync` | sync web build to Capacitor |

- Build fails on TS errors (`ignoreBuildErrors: false`); ESLint ignored during build
- No test framework — all testing is manual (see `docs/TESTING_CHECKLIST.md`)
- `.nvmrc` → Node 20
- Dual PostCSS configs — **active**: `.mjs` (Tailwind v4 `@tailwindcss/postcss`), legacy: `.js` (Tailwind v3 `tailwindcss`)
- Drizzle config reads `DATABASE_URL` from `.env.local`
- Playwright MCP browser testing available

## Code Style

**Imports order** (separated by blank line):
1. third-party: `react`/`next`, `lucide-react`, `sonner`, `@tanstack/react-query`, `zustand`
2. Components: `@/components/*`
3. Project: `@/lib/*`, `@/store/*`
4. Utils: `@/lib/utils`
Use `@/*` path alias for all project imports.

**Sonner toast:** `toast.error("Pesan")` / `toast.success("Pesan")`.

**Naming:** Files kebab-case (`customer/home/page.tsx`), hooks/services camelCase (`useOrders.ts`), components PascalCase (`CustomerBottomNav.tsx`). Types PascalCase, always exported. DB schema camelCase in TS (`vendorId`), snake_case in DB columns (`vendor_id`).

**TypeScript strict mode.** Services use `if (error) throw error`. Query hooks use `enabled: !!variable` guard. React Query keys: `['resource', param1, param2]`. Mutations invalidate via `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`.

**Component patterns:** Every page starts with `'use client'`. Zustand selectors in hook call, not render: `useAuthStore((s) => s.profile)`. Pages using `useSearchParams` need `<Suspense>` wrapper. Loading: `<Loader2 className="animate-spin" />`. Error: `AlertCircle` + red tint. Empty: icon + muted text.

**Styling:** Tailwind utility classes only; use `cn()` from `@/lib/utils` for conditional merging. Cards: `rounded-3xl`, `shadow-sm`, no border. Default button: `h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700`. Bottom nav: `h-14`, `z-50`. Rupiah: `.toLocaleString('id-ID')`. Indonesian labels. `cursor-pointer` on clickable cards. Touch targets: 48px minimum.

**Available shadcn UI:** `button` (base-nova, `@base-ui/react`), `card`, `input`, `textarea`, `label`, `select`, `tabs`, `skeleton`, `otp-input`, `file-upload`, `custom status-badge`. All in `@/components/ui/*`.

## Architecture

- **All pages `'use client'`** — no server components
- **Auth**: `AuthProvider` → `AuthGuard` → role-based redirect. State in `useAuthStore` (Zustand, `@/store/auth.ts`). `profile.id` = Supabase auth UID
- **Data hooks** in `lib/services/*.ts`: module-level `createClient()` from `@/lib/supabase/client` (factory pattern, not singleton). All server state through React Query
- **Two Supabase clients**: singleton `lib/supabase.ts` (legacy `createClient` from `@supabase/supabase-js`) and factory `lib/supabase/client.ts` (`createBrowserClient` from `@supabase/ssr`, used by services)
- **React Query defaults** (set in `QueryProvider`): `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`
- **Order status**: `pending → accepted → in_progress → completed` (+ `cancelled`)
- **Payment status**: `unpaid → escrow → released | refunded`
- **Xendit secret key** — Edge Functions only, never on frontend
- **Disable HMR** in AI Studio via `DISABLE_HMR=true` env var (webpack `watchOptions.ignored: /.*/`)
- `supabase/` directory excluded from TS compilation
- **4 fonts** in layout: Inter (sans), Plus_Jakarta_Sans (heading), Bodoni_Moda (display), Jost (body)
- Layout sets `viewport`: width=device-width, initial-scale=1, maximumScale=1, userScalable=false

## Schema (`lib/db/schema.ts`)

Key tables: `users`, `vendor_profiles`, `verification_submissions`, `saved_bank_accounts`, `services`, `orders`, `chats`, `messages`, `wallets`, `wallet_transactions`, `reviews`, `disputes`, `promos`, `fraud_alerts`. Migrations in `supabase/migrations/`.

## Schema Change Workflow

1. Edit `lib/db/schema.ts` in Drizzle
2. `npx drizzle-kit generate` → creates SQL in `supabase/migrations/`
3. Review generated SQL; add RLS policies, indexes, triggers, seed data as separate migration
4. Apply via Supabase MCP `supabase_apply_migration`
5. Generate types via Supabase MCP `supabase_generate_typescript_types`
6. Ensure new tables exported from schema if needed

## Supabase Edge Functions (Deno)

`create-invoice` (Xendit invoice), `create-topup-invoice`, `create-disbursement`, `xendit-webhook` (payment callbacks, idempotent), `release-payment` (escrow release). Deploy via `supabase functions deploy`. Env vars set in Supabase dashboard.

## Required Env (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=          # drizzle-kit only
```

Also in `.env.local`: `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `GH_TOKEN`, `SUPABASE_ACCESS_TOKEN`.

## Mandatory Workflow

After EVERY code change:
1. Schema changes? → run Schema Change Workflow above
2. Verify against `prd.md`
3. Update `roadmap.md`, `UI_UX_ROADMAP.md`, `REFINE_STITCH_UI_UX_ROADMAP.md`
4. Update `docs/TESTING_CHECKLIST.md` (section K format)
5. Run `npm run lint` then `npm run build` — 0 errors required

## Known Gaps

- Realtime only for chat messages; orders/chats list use 5s `refetchInterval`
- Xendit integration via Edge Functions (Deno); payment page has fallback to direct mutation
- `reviews` table exists with no UI
- `app/(auth)/register/role/` is a dead directory

## UI/UX Design Workflow

Prerequisite: Python3.

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "GEMA"
python3 skills/ui-ux-pro-max/scripts/search.py "<keywords>" --stack shadcn
```

Supplement via `--domain style|ux|typography|color|landing`. Use `--persist` to save as `design-system/MASTER.md`.

**UI rules:** No emoji icons — use Lucide SVGs. `cursor-pointer` on clickable cards. Hover transitions: `transition-colors duration-200`. Text contrast `#0F172A`. Glass cards `bg-white/80` min. Border `border-gray-200`. Floating navbar `top-4 left-4 right-4`. Responsive 375px / 768px / 1024px.
