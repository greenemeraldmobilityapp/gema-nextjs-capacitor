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

- [x] Home discovery
- [ ] Maps (real map integration)
- [x] Vendor search
- [x] Booking flow
- [x] Order history
- [ ] Review system

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

Output

Vendor flow complete

---

PHASE 6 — Realtime Layer

Tasks

- [ ] Realtime chat
- [ ] Live location tracking
- [ ] Push notification
- [ ] Order status sync

Output

Realtime experience complete

---

PHASE 7 — Payment Escrow

Tasks

- [ ] Xendit integration
- [ ] Escrow flow
- [ ] Refund logic
- [x] Wallet ledger (UI + read)

Output

Secure transaction system

---

PHASE 8 — Admin Dashboard

Tasks

- [ ] Vendor verification approval
- [ ] Dispute handling
- [ ] Refund approval
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
