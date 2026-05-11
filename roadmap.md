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

- [x] KYC onboarding
- [x] Portfolio upload
- [x] Vendor dashboard
- [x] Order management
- [x] Earnings dashboard
- [x] Location picker (Leaflet draggable pin on profile edit → users.lat/lng)

Output

Vendor flow complete

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
- [ ] Fraud monitoring

Output

Marketplace control center

---

PHASE 9 — QA / UAT

Tasks

- [ ] Functional testing
- [ ] Payment testing
- [ ] Device testing
- [ ] Load testing
- [ ] Security testing
- [ ] Bug fixing

Output

Production-ready app

---

PHASE 10 — CI/CD Automation

Tasks

- [ ] GitHub Actions Android build
- [ ] GitHub Actions iOS build
- [ ] Artifact generation
- [ ] Automated deployment

Output

Automated build pipeline

---

PHASE 11 — Beta Launch

Tasks

- [ ] Launch in 1 city
- [ ] Onboard early users
- [ ] Collect feedback
- [ ] Monitor failures

Output

Real-world validation

---

PHASE 12 — Scale Phase

Tasks

- [ ] Expand categories
- [ ] Add courier vertical
- [ ] Add subscriptions
- [ ] Add loyalty program
- [ ] Multi-city rollout

Output

Growth expansion

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
