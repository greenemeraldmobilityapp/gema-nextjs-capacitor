# GEMA — OpenCode Agent Guide

## Stack

- Next.js 15 **static export** (`output: 'export'`) — no SSR, no API routes
- Supabase (Auth + Postgres + Storage) — all data via direct browser client
- TanStack React Query — server state; Zustand — UI state only
- Tailwind + Shadcn UI (base-nova style, `@base-ui/react`) + lucide-react icons
- sonner for toasts (`<Toaster />` in `app/layout.tsx`)
- Capacitor (Android/iOS) — webDir is `out/`

## Paths

`@/*` → project root. Use `@/store/auth`, `@/lib/services/useOrders`, etc.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | dev server |
| `npm run build` | static export → `out/` |
| `npm run lint` | ESLint (not run during build) |

- Build fails on TypeScript errors (`typescript.ignoreBuildErrors: false`)
- ESLint is ignored during build (`eslint.ignoreDuringBuilds: true`) — lint separately
- No test framework exists
- Dual config files exist for PostCSS (`postcss.config.js` + `.mjs`)

## Key Architecture

- **All pages are `'use client'`** — no server components
- **Auth**: `AuthProvider` → `AuthGuard` → role-based redirect. Auth state in `useAuthStore` (zustand). `profile.id` maps to `users.id` (Supabase auth UID)
- **Data**: hooks in `lib/services/*.ts`, each creates its own Supabase client via `createClient()` from `@/lib/supabase/client`. All server state through React Query
- **Two Supabase clients**: singleton `lib/supabase.ts` (legacy) and factory `lib/supabase/client.ts` (used by services)
- **Layouts**: `app/vendor/layout.tsx` and `app/customer/layout.tsx` each mount a bottom nav. Auth/wallet/splash pages have no bottom nav
- **Order status enum**: `pending → accepted → in_progress → completed` (plus `cancelled`)
- **Payment status enum**: `unpaid → escrow → released | refunded`
- **Xendit secret key** must only be used in Supabase Edge Functions, never on frontend
- **Register route** is under `(auth)` route group (`/register`, `/register/role`). `app/register/role/` is empty (dead directory)

## Schema (source of truth: `lib/db/schema.ts`)

Key tables: `users`, `vendor_profiles`, `services`, `orders`, `chats`, `messages`, `wallets`, `wallet_transactions`, `reviews`, `disputes`, `promos`

Migration: `supabase/migrations/`, Drizzle config reads `DATABASE_URL` from `.env.local`.
Run `npx drizzle-kit generate` after schema changes, then apply the generated SQL in Supabase.

## MCP Servers (6 providers via OpenCode)

6 MCP servers configured in `opencode.json` (project root) and `.vscode/mcp.json`.

| Server | Package / URL | Credentials (`.env.local`) | Purpose |
|--------|---------------|---------------------------|---------|
| **upstash** | `@upstash/mcp-server` | `UPSTASH_EMAIL`, `UPSTASH_API_KEY` | Redis, QStash, Workflow, Box management |
| **supabase** | `mcp.supabase.com/mcp` (remote) | `SUPABASE_ACCESS_TOKEN` (bearer header) | Database query, project mgmt, edge functions |
| **playwright** | `@playwright/mcp@latest` | — | Browser automation, web testing, screenshots |
| **github** | `@modelcontextprotocol/server-github` | `GH_TOKEN` | GitHub API, repos, issues, PRs, search |
| **exa** | `exa-mcp-server` | `EXA_API_KEY` | Web search & content extraction |
| **mdn** | `mdn-mcp` | — | MDN Web Docs reference lookup |

To use MCP tools, mention the server name in your prompt (e.g. "use playwright to test the login page", "use supabase to query the orders table", "use upstash to list redis databases").

To add/edit MCP servers: edit `opencode.json` (OpenCode CLI) or `.vscode/mcp.json` (VS Code).

## Schema Change Workflow — Saat ada perubahan tabel

Kerjakan dalam urutan ini **SEBELUM** menulis kode fitur yang menggunakan tabel baru/berubah:

1. **Edit `lib/db/schema.ts`** — definisikan/tambah/hapus/modifikasi tabel di Drizzle schema
2. **Generate migration** — user jalankan `npx drizzle-kit generate` (menghasilkan file SQL di `supabase/migrations/`)
3. **Review & add supporting SQL** — baca file migration yang baru digenerate. Tambahkan SQL untuk:
   - **Row Level Security (RLS) policies** — enable RLS, buat policy `SELECT`/`INSERT`/`UPDATE`/`DELETE` sesuai role (vendor/customer)
   - **Indexes** — untuk kolom yang sering di-query
   - **Triggers** atau **default data** jika diperlukan
   - **Seed data** untuk development jika ada master data baru
   - Simpan SQL ini sebagai file migration baru atau catatan untuk dijalankan di Supabase
4. **Apply migration** — gunakan `supabase_apply_migration` via Supabase MCP untuk apply semua file migration baru. Jika ada RLS/supporting SQL, apply sebagai migration terpisah
5. **Generate TypeScript types** — jalankan `supabase_generate_typescript_types` via Supabase MCP agar tipe database sinkron dengan kode
6. **Update `lib/db/schema.ts` exports** — pastikan tabel baru di-export jika perlu
7. **Lanjut ke Mandatory Workflow** — setelah schema siap, tulis kode fitur dan jalankan mandatory workflow di bawah

## Mandatory Workflow — After EVERY code change

1. **Cek jika ada perubahan schema** — jika iya, kerjakan **Schema Change Workflow** di atas terlebih dahulu
2. **Verify against `prd.md`** — ensure implementation matches PRD architecture and schema
3. **Update `roadmap.md`** — check/uncheck tasks in the relevant phase
4. **Update `REFINE_STITCH_UI_UXX_ROADMAP.md`** — check/uncheck screens and features affected
5. **Update `docs/TESTING_CHECKLIST.md`** — add test scenarios for the change (section K format)
6. **Run `npm run lint`** — catch lint errors (build won't catch them)
7. **Run `npm run build`** — confirm 0 errors (catches TS errors)

## Known Gaps (don't assume they exist)

- **Realtime subscriptions** — `useRealtimeMessages` uses Supabase Realtime for new chat messages, but all other queries (orders, chats list) use 5s polling via `refetchInterval`
- **Xendit integration** — Edge Functions (Deno-based, `serve` from `deno.land/std`) deployed via Supabase CLI; env vars set in Supabase dashboard. Payment page calls Edge Function with fallback to direct mutation
- **No review system frontend** — `reviews` table exists, no UI

## Supabase Edge Functions

Located in `supabase/functions/`:
- `create-invoice` — creates Xendit invoice for an order
- `xendit-webhook` — handles Xendit payment callbacks, updates wallet

Both are Deno HTTP handlers. Deploy via `supabase functions deploy`. Env vars (`XENDIT_SECRET_KEY`, etc.) set in Supabase dashboard, not in `.env.local`.

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
