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
| `npm run dev` | dev server |
| `npm run build` | static export → `out/` |
| `npm run lint` | ESLint (separate — ignored during build) |

- Build fails on TS errors (`ignoreBuildErrors: false`); ESLint ignored during build
- No test framework exists — all testing is manual (see `docs/TESTING_CHECKLIST.md`)
- Dual PostCSS configs — **active**: `.mjs`, legacy: `.js`; Drizzle config reads `DATABASE_URL` from `.env.local`
- Playwright MCP available for ad-hoc browser testing/screenshots

## Code Style Guidelines

**Imports order** (separated by blank line):
1. third-party: `react`/`next`, `lucide-react`, `sonner`, `@tanstack/react-query`, `zustand`
2. Components: `@/components/*`
3. Project: `@/lib/*`, `@/store/*`
4. Utils: `@/lib/utils`

Use `@/*` path alias for all project imports.

**Sonner toast:** `import { toast } from 'sonner'` then `toast.error("Pesan")` / `toast.success("Pesan")`.

**Naming conventions:**
- Files: `kebab-case` for pages (`customer/home/page.tsx`), `camelCase` for hooks/services (`useOrders.ts`), `PascalCase` for components (`CustomerBottomNav.tsx`)
- Types/interfaces: PascalCase, always exported (`export type VendorProfile = {...}`)
- Hooks: `use` + PascalCase prefix (`useVendors`, `useAuthStore`, `useWallet`)
- Variables/functions: camelCase
- DB schema: camelCase in TS (`vendorId`, `isVerified`), snake_case in actual DB columns (`vendor_id`, `is_verified`)

**TypeScript:** strict mode. All service functions use `if (error) throw error` pattern. Query hooks use `enabled: !!variable` guard to skip undefined params. Export types that are used across modules.

**React Query patterns:**
- Query key: `['resource', param1, param2]`
- Module-level Supabase client via `createClient()` from `@/lib/supabase/client` (called once at module top level, not inside hooks)
- Mutations invalidate queries via `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`

**Component patterns:**
- Every page starts with `'use client'`
- Zustand selector: `useAuthStore((s) => s.profile)` — select in hook call, not in render
- Loading state: `Loader2` icon with `animate-spin`
- Error state: `AlertCircle` + red text/tint
- Empty state: relevant icon + muted text message
- All clickable cards need `cursor-pointer` and hover transitions (`hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md`)
- Pages using `useSearchParams` must be wrapped in `<Suspense>`

**Available shadcn UI components:** `button` (base-nova, `@base-ui/react`), `card`, `input`, `textarea`, `label`, `select`, `tabs`, `skeleton`, `otp-input`, `file-upload`, `status-badge` (custom order/payment status). All in `@/components/ui/*`.

**Styling conventions:**
- Tailwind utility classes only; use `cn()` from `@/lib/utils` for conditional merging
- Cards: `rounded-3xl` (24px radius), `shadow-sm`, no border (or `border-gray-100`)
- Default button: `h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700`
- Pill variant: `rounded-full bg-primary h-12 px-8`
- H-14 (56px) for bottom nav; z-50 for fixed elements
- Rupiah: `.toLocaleString('id-ID')`
- Indonesian labels for all UI text

**Error handling:** Services throw on DB error (`if (error) throw error`). Components handle 3 states: loading (spinner), error (toast + inline message), empty (icon + text). Sonner toast: `toast.error("Pesan gagal")`.

## Key Architecture

- **All pages are `'use client'`** — no server components
- **Auth**: `AuthProvider` → `AuthGuard` → role-based redirect. State in `useAuthStore` (Zustand). `profile.id` = Supabase auth UID
- **Data hooks** in `lib/services/*.ts`: each creates its own Supabase client via `createClient()`. All server state through React Query
- **Two Supabase clients**: singleton `lib/supabase.ts` (legacy) and factory `lib/supabase/client.ts` (used by services)
- **Order status**: `pending → accepted → in_progress → completed` (plus `cancelled`)
- **Payment status**: `unpaid → escrow → released | refunded`
- **Xendit secret key** — Edge Functions only, never on frontend

## Schema (source of truth: `lib/db/schema.ts`)

Key tables: `users`, `vendor_profiles`, `services`, `orders`, `chats`, `messages`, `wallets`, `wallet_transactions`, `reviews`, `disputes`, `promos`, `fraud_alerts`

Migrations in `supabase/migrations/`. Drizzle config reads `DATABASE_URL` from `.env.local`.

## MCP Servers (6 via OpenCode)

| Server | Type | Auth (`env`) | Use |
|--------|------|-------------|-----|
| **upstash** | local | `UPSTASH_EMAIL`, `UPSTASH_API_KEY` | Redis, QStash, Workflow, Box |
| **supabase** | remote | `SUPABASE_ACCESS_TOKEN` | DB queries, Edge Functions, project mgmt |
| **playwright** | local | — | Browser testing, screenshots |
| **github** | local | `GH_TOKEN` | Issues, PRs, repos, search |
| **exa** | local | `EXA_API_KEY` | Web search & content |
| **mdn** | local | — | MDN docs reference |

## Schema Change Workflow

Before writing feature code that uses new/changed tables:
1. Edit `lib/db/schema.ts` in Drizzle
2. Run `npx drizzle-kit generate` → creates SQL in `supabase/migrations/`
3. Review generated SQL; add RLS policies, indexes, triggers, seed data as separate migration
4. Apply via `supabase_apply_migration` (Supabase MCP)
5. Generate types via `supabase_generate_typescript_types` (Supabase MCP)
6. Ensure new tables are exported from schema if needed

## Mandatory Workflow — After EVERY code change

1. Check for schema changes → run Schema Change Workflow above
2. Verify against `prd.md` — match PRD architecture
3. Update `roadmap.md`, `UI_UX_ROADMAP.md`, `REFINE_STITCH_UI_UX_ROADMAP.md`
4. Update `docs/TESTING_CHECKLIST.md` (section K format)
5. Run `npm run lint` then `npm run build` — 0 errors required

## Supabase Edge Functions

`supabase/functions/create-invoice` (Xendit invoice), `xendit-webhook` (payment callbacks, idempotent), `release-payment` (escrow release). Deploy via `supabase functions deploy`. Env vars set in Supabase dashboard.

## Required Env (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=          # drizzle-kit only
```

## Known Gaps

- Realtime only for chat messages; orders/chats list use 5s `refetchInterval`
- Xendit integration via Edge Functions (Deno); payment page has fallback to direct mutation
- `reviews` table exists with no UI
- `app/register/role/` is a dead directory

## UI/UX Design Workflow

Wajib untuk setiap request UI/UX. Prerequisite: Python3.

```bash
# Generate design system (REQUIRED first step)
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "GEMA"
```

```bash
# Stack-specific guidelines
python3 skills/ui-ux-pro-max/scripts/search.py "<keywords>" --stack shadcn
```

Supplement searches via `--domain style|ux|typography|color|landing`. Use `--persist` to save as `design-system/MASTER.md` + page overrides.

### Key UI Rules

- No emoji icons — use Lucide SVGs
- `cursor-pointer` on all clickable cards
- Hover: color/shadow transitions, `transition-colors duration-200`
- Text contrast: `#0F172A` (slate-900) for body
- Glass cards: `bg-white/80` minimum opacity
- Border: `border-gray-200` in light mode
- Floating navbar: `top-4 left-4 right-4` spacing
- Responsive at 375px, 768px, 1024px
- Touch targets: 48px minimum
