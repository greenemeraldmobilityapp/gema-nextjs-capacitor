ROADMAP.md — GEMA Development Execution Plan

Version 2.0

---

PHASE 0 — Market Validation

Tujuan:
Validasi demand sebelum overbuild.

Tasks

- Research kompetitor:
  - 
  - 
- Rekrut 20–50 vendor awal
- Interview calon customer
- Tentukan kota pilot launch

Output

Validated market demand

---

PHASE 1 — Infrastructure Setup

Tasks

- Create Next.js app
- Configure static export
- Setup Tailwind
- Setup Shadcn UI
- Setup Capacitor
- Setup Supabase
- Setup Drizzle
- Setup environment variables

Output

Base infrastructure working

---

PHASE 2 — Database & Security Layer

Tasks

- Build schema
- Run migrations
- Setup Supabase RLS
- Setup storage buckets
- Configure auth policies

Output

Secure backend foundation

---

PHASE 3 — Authentication & User Roles

Tasks

- Register
- Login
- Google auth
- Role selection
- Session persistence
- Role routing

Output

User onboarding complete

---

PHASE 4 — Customer Marketplace MVP

Tasks

- Home discovery
- Maps
- Vendor search
- Booking flow
- Order history
- Review system

Output

Customer booking flow complete

---

PHASE 5 — Vendor Operations MVP

Tasks

- KYC onboarding
- Portfolio upload
- Vendor dashboard
- Order management
- Earnings dashboard

Output

Vendor flow complete

---

PHASE 6 — Realtime Layer

Tasks

- Realtime chat
- Live location tracking
- Push notification
- Order status sync

Output

Realtime experience complete

---

PHASE 7 — Payment Escrow

Tasks

- Xendit integration
- Escrow flow
- Refund logic
- Wallet ledger

Output

Secure transaction system

---

PHASE 8 — Admin Dashboard

Tasks

- Vendor verification approval
- Dispute handling
- Refund approval
- Fraud monitoring

Output

Marketplace control center

---

PHASE 9 — QA / UAT

Tasks

- Functional testing
- Payment testing
- Device testing
- Load testing
- Security testing
- Bug fixing

Output

Production-ready app

---

PHASE 10 — CI/CD Automation

Tasks

- GitHub Actions Android build
- GitHub Actions iOS build
- Artifact generation
- Automated deployment

Output

Automated build pipeline

---

PHASE 11 — Beta Launch

Tasks

- Launch in 1 city
- Onboard early users
- Collect feedback
- Monitor failures

Output

Real-world validation

---

PHASE 12 — Scale Phase

Tasks

- Expand categories
- Add courier vertical
- Add subscriptions
- Add loyalty program
- Multi-city rollout

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