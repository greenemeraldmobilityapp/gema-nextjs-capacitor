ROADMAP.md — GEMA Development Execution Plan

Version 2.0

---

PHASE 0 — Market Validation

Tujuan:
Validasi demand sebelum overbuild.

Tasks

- [ ] Research kompetitor:
  - 
  -
- [ ] Rekrut 20–50 vendor awal
- [ ] Interview calon customer
- [ ] Tentukan kota pilot launch

Output

Validated market demand

---

PHASE 1 — Infrastructure Setup

Tasks

- [x] Create Next.js app
- [x] Configure static export
- [x] Setup Tailwind
- [x] Setup Shadcn UI
- [x] Setup Capacitor
- [x] Setup Supabase
- [x] Setup Drizzle
- [x] Setup environment variables
- [x] Setup MCP servers: .vscode/mcp.json (VS Code) + opencode.json (OpenCode CLI)
  - Context7, Supabase, GitHub, Playwright, Exa, MDN

Output

Base infrastructure working

---

PHASE 2 — Database & Security Layer

Tasks

- [x] Build schema
- [x] Run migrations
- [x] Schema alignment: scheduled_time column (PRD compliance)
- [x] Setup Supabase RLS
- [x] Setup storage buckets
- [x] Configure auth policies

Output

Secure backend foundation

---

PHASE 3 — Authentication & User Roles

Tasks

- [x] Register
- [x] Login
- [x] Google auth
- [x] Role selection
- [x] Session persistence
- [x] Role routing

Output

User onboarding complete

---

PHASE 4 — Customer Marketplace MVP

Tasks

- [x] Home discovery (dynamic promo + vendor terbaik + map view + nearby distance)
- [x] Maps (Leaflet map with vendor markers + geolocation)
- [x] Vendor search (real Supabase data + category filter)
- [x] Booking flow (end-to-end: booking → createOrder → payment → escrow)
- [x] Order history (real data from Supabase)
- [x] Review system (create + display reviews, auto-update vendor rating)

Output

Customer booking flow complete

---

PHASE 5 — Vendor Operations MVP

Tasks

- [x] KYC onboarding (KTP + selfie + certificate upload, `verification_submissions` table, storage bucket, admin review/approve/reject)
- [x] Portfolio upload
- [x] Vendor dashboard
- [x] Order management
- [x] Earnings dashboard
- [x] Location picker (Leaflet draggable pin on profile edit → users.lat/lng)

Output

Vendor flow complete — KYC includes KTP + selfie pegang KTP (dual upload, camera capture via `capture="user"`/`capture="environment"`)

---

PHASE 6 — Realtime Layer

Tasks

- [x] Realtime chat (polling-based, vendor + customer)
- [x] Live location tracking (basic: vendor share → customer view via localStorage polling)
- [x] Push notification (service worker scaffolding + permission)
- [x] Order status sync (polling via React Query)

Output

Realtime experience complete

---

PHASE 7 — Payment Escrow

Tasks

- [x] Xendit integration (Edge Functions deployed, webhook registered, payment flow live)
- [x] Escrow flow (payment_status: unpaid → escrow → released via vendor actions)
- [x] Refund logic
- [x] Wallet ledger (UI + read + auto-create wallet)
- [x] Wallet transaction (insert on payment escrow)

Output

Secure transaction system

---

PHASE 8 — Admin Dashboard

Tasks

- [x] Vendor verification approval
- [x] Dispute handling
- [x] Refund/topup/withdrawal approval
- [x] Fraud monitoring (detection triggers: self-dealing, rapid completion, burst registration, review bomb, off-platform contact)

Output

Marketplace control center

---

PHASE 9 — QA / UAT

Tasks

- [x] Code audit (Auth, Customer, Vendor, Admin, Wallet, Edge Functions, RLS)
- [x] Build verification (70 pages, 0 errors)
- [x] Payment flow audit + fixes
- [x] Bug fixing (76 bugs fixed across 6 phases — see docs/bug_fix_plan.md)
- [x] RLS migration (0008) — INSERT/UPDATE/SELECT policies for all tables
- [x] Security migration — revoke EXECUTE from `anon` on 16 functions, `search_path` on 18 SECURITY DEFINER functions
- [x] Edge function fixes + re-deploy — atomic wallet credit, proper JWT auth, idempotent webhook, origin validation
  - `create-invoice` v10, `xendit-webhook` v13, `create-disbursement` v4, `release-payment` v7
- [x] Schema fixes — `accepted_at`/`started_at`, `handle_new_user` trigger, wallet auto-create, wallet credit ordering, disbursement timeout idempotency
- [ ] Payment testing (blocked — sandbox env unavailable)
- [ ] Device testing (blocked — no device/simulator; APK debug available at `releases/GEMA-v0.1.0-debug.apk`)
- [ ] Load testing (blocked — no staging DB)
- [ ] Security testing (blocked — no staging env)
- [x] Known gaps documented (see bug_fix_plan.md + AGENTS.md Known Gaps)

Output

Code quality verified — 70 pages, 0 build errors, 76 bugs fixed, 4 Edge Functions re-deployed, security migration applied

---

PHASE 10 — CI/CD Automation

> **Catatan:** Saat ini APK di-build manual di lokal via `npx cap sync && npx cap open android`, output disimpan ke `releases/GEMA-v0.1.0-debug.apk`. Belum ada GitHub Actions atau CI/CD otomatis.

Tasks

- [x] Manual APK build script — APK tersedia di `releases/GEMA-v0.1.0-debug.apk`
- [ ] GitHub Actions Android build
- [ ] GitHub Actions iOS build
- [ ] Artifact generation
- [ ] Automated deployment

Output

Automated build pipeline (manual untuk saat ini)

---

PHASE 11 — Beta Launch

> Lihat panduan detail: [`docs/PHASE_11_BETA_LAUNCH.md`](./docs/PHASE_11_BETA_LAUNCH.md)

Tasks

- [ ] Production environment setup (Supabase, Cloudflare, Xendit live keys)
- [ ] Android release APK signing & distribution (Firebase App Distribution)
- [ ] Vendor recruitment pipeline — target 50+ vendor terverifikasi
- [ ] Customer acquisition campaign (ads, influencer, referral)
- [ ] Monitoring & observability (Sentry, Supabase, uptime)
- [ ] Support & ops setup (channel, SLA, escalation matrix)
- [ ] Pilot city execution (Jaksel, Tangsel, Bekasi, Surabaya)
- [ ] Feedback collection & rapid iteration
- [ ] Go/No-Go evaluation untuk Phase 12

Output

Real-world validation — 50 vendor, 500 customer, 200 transaksi/bulan

---

PHASE 12 — Scale Phase

> Lihat panduan detail: [`docs/PHASE_12_SCALE_PHASE.md`](./docs/PHASE_12_SCALE_PHASE.md)

Tasks

- [ ] Multi-city expansion (Jabodetabek → 20+ kota)
- [ ] Category expansion (cleaning, garden, IT, tutoring)
- [ ] Courier vertical — real-time tracking, dynamic pricing
- [ ] Remote freelance IT — online delivery, video call
- [ ] Subscription model — 3 tier (Basic/Pro/Enterprise)
- [ ] AI recommendations & smart search
- [ ] Loyalty program — points, tiers, rewards
- [ ] Insurance & protection partnership
- [ ] CI/CD automation (GitHub Actions)
- [ ] Infrastructure scale (indexes, read replicas, CDN)
- [ ] Multiple payment methods (QRIS, e-wallet)
- [ ] Team scaling & SOP documentation
- [ ] Regulatory compliance (UU PDP, tax, HAKI)

Output

Growth expansion — 500 vendor, 5,000 customer, 1,000 transaksi/bulan, breakeven

---

Development Rules

NEVER:

- Build unnecessary backend server
- Use SSR
- Store payment secrets on frontend
- Skip testing phase

ALWAYS:

- Use static export
- Keep single codebase
- Optimize for low-cost scaling
- Validate before scaling

---
