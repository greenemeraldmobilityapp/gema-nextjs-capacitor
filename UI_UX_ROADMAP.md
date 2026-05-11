# UI_UX_ROADMAP.md
GEMA (Green Emerald Mobility Apps)
Frontend Development Roadmap
Version 1.0

---

# 1. Objective

Dokumen ini berfungsi sebagai roadmap implementasi frontend berdasarkan hasil design UI Stitch yang telah dibuat.

Frontend GEMA harus:

- mobile first
- reusable component driven
- scalable
- compatible dengan Next.js static export
- compatible dengan Capacitor mobile wrapper
- mudah diintegrasikan ke Supabase backend

Dokumen ini hanya fokus pada:

- UI implementation
- UX flow
- component system
- navigation structure
- frontend milestone

Dokumen ini TIDAK membahas backend infrastructure.

---

# 2. Frontend Architecture

## Framework
- [x] Next.js App Router
- [x] TypeScript
- [x] Tailwind CSS
- [x] Shadcn/UI
- [x] Lucide Icons
- [ ] Framer Motion

---

## Folder Structure

/src
    /app
        /(auth)
        /customer
        /vendor
        /shared
    /components
        /ui
        /shared
        /customer
        /vendor
    /hooks
    /lib
    /store
    /types

---

# 3. Design System Phase (UI Foundation)

Sebelum membangun halaman:

## Color System
- [x] Primary: Emerald 500, Emerald 600
- [x] Secondary: Gray scale, Success, Warning, Error

## Typography
- [x] Heading / Subheading / Body / Caption

## Global Components

### Navigation
- [x] Bottom navbar
- [x] Top navbar
- [x] Back header
- [ ] Drawer menu (low priority)

### Form Components
- [x] Input
- [x] Select
- [x] Textarea
- [x] File upload
- [x] OTP input

### Card Components
- [x] Vendor card
- [x] Service card
- [x] Portfolio card (via services table)
- [x] Order card
- [x] Wallet card

### Feedback Components
- [x] Toast (sonner)
- [x] Modal
- [ ] Alert dialog (low priority)
- [x] Loading skeleton
- [x] Empty states

### Map Components
- [x] Vendor marker
- [x] Live tracking marker (basic: localStorage-based)
- [ ] Radius search indicator

---

# MILESTONE 1
AUTHENTICATION FLOW

Prioritas pertama karena semua flow bergantung auth.

---

## Screen 1 — Splash Screen
- [x] UI: logo animation, loading state
- [x] Route: `/` → redirect based on auth

---

## Screen 2 — Onboarding Discovery
- [x] UI: swipe onboarding, CTA login/register
- [x] Route: `/onboarding`

---

## Screen 3 — Role Selection
- [x] UI: choose customer / choose vendor
- [x] Route: `/register/role`

---

## Screen 4 — Register
- [x] UI: email signup, google signup, validation
- [x] Route: `/register`
- [x] Connected to Supabase

---

## Screen 5 — Login
- [x] UI: email login, google login, forgot password
- [x] Route: `/login`
- [x] Connected to Supabase

---

## Deliverables M1
- [x] auth UI complete
- [x] session persistence
- [x] responsive tested

---

# MILESTONE 2
CUSTOMER CORE FLOW

Ini adalah core bisnis utama.

---

## Screen 6 — Customer Home
- [x] nearby vendor map (Leaflet map with vendor markers + geolocation)
- [x] service categories
- [x] search bar
- [x] promo banner (dynamic from Supabase promos table)
- [x] recommendations (Vendor Terbaik section sorted by rating)
- [x] Vendor Terdekat section (sorted by distance from user location)
- [x] Toggle list/map view
- [x] Route: `/customer/home`
- [x] Connected to Supabase

---

## Screen 6b — Search
- [x] Route: `/customer/search`
- [x] Connected to Supabase (real vendor data, no more mock)
- [x] Category filter from URL params
- [x] Loading/empty/no-results states

---

## Screen 11 — Order Tracking
- [x] realtime status (data real dari Supabase, milestones by order_status)
- [x] map tracking (basic: vendor location sharing → customer view)
- [x] chat vendor (link ke `/customer/chat?order_id=...`)
- [x] show scheduled_date + scheduled_time
- [x] show service info, location, pricing from Supabase
- [x] cancel button (pending only)
- [x] Route: `/customer/orders/detail`
- [x] Connected to Supabase (real data, no mock)

---

## Screen 12 — Order History
- [x] daftar pesanan (tab Active / History)
- [x] show scheduled_date + scheduled_time
- [x] Route: `/customer/orders`
- [x] Connected to Supabase

---

## Deliverables M2
- [x] booking flow complete (end-to-end: createOrder → payment → escrow)
- [x] payment flow complete (UI + real data)
- [x] review system (customer review form + vendor detail display)
- [x] promo banner + recommendations on home
- [x] nearby vendors with distance + Leaflet map
- [ ] realtime tracking complete

---

# MILESTONE 3
CUSTOMER ACCOUNT FLOW

---

## Profile
- [x] Route: `/customer/profile`
- [x] Connected to Supabase
- [x] Link ke Dompet Saya

## Edit Profile
- [x] Route: `/customer/profile/edit`
- [x] Connected to Supabase

## Notification Settings
- [x] Route: `/customer/settings/notifications``

## Security Settings
- [x] Route: `/customer/settings/security`

## Help Center
- [x] Route: `/customer/help`

## FAQ
- [x] Route: `/customer/help/faq`

---

## Deliverables M3
- [x] account flow complete

---

# MILESTONE 4
VENDOR ONBOARDING FLOW

---

## Verification Intro
- [x] Route: `/vendor/verification`

## KTP Verification
- [x] Route: `/vendor/verification/ktp`

## Professional Certification
- [x] Route: `/vendor/verification/certification`

## Verification Review
- [x] Route: `/vendor/verification/review`

---

## Deliverables M4
- [x] vendor onboarding complete

---

# MILESTONE 5
VENDOR BUSINESS FLOW

---

## Vendor Dashboard
- [x] order stats (real)
- [x] earnings summary (real)
- [ ] notifications
- [x] Route: `/vendor/dashboard`
- [x] Connected to Supabase

## Vendor Profile
- [x] Route: `/vendor/profile`
- [x] Connected to Supabase

## Edit Vendor Profile
- [x] Route: `/vendor/profile/edit`
- [x] Connected to Supabase
- [x] Location picker (Leaflet draggable pin + geolocation button → users.lat/lng)

## Portfolio Management
- [x] Route: `/vendor/portfolio`
- [x] Connected to Supabase (services table)
- [x] Empty state / loading / error

## Add Portfolio
- [x] Route: `/vendor/portfolio/add`
- [x] Form: title, category, price, description
- [x] Submit ke Supabase + toast success

## Vendor Chat
- [x] Route: `/vendor/chat`
- [x] Connected to Supabase (chats table + last message)
- [x] Loading / error / empty state
- [x] Realtime subscription (Supabase postgres_changes for instant message delivery)

## Active Orders
- [x] Route: `/vendor/orders`
- [x] Connected to Supabase
- [x] Loading / error / empty state

## Order Detail
- [x] Route: `/vendor/orders/detail`
- [x] Connected to Supabase (real data)
- [x] Tombol aksi real: Terima, Mulai, Selesaikan, Tolak
- [x] Toast sukses/gagal + auto-refetch
- [x] Show scheduled_date + scheduled_time

## Earnings
- [x] Route: `/vendor/earnings`
- [x] Connected to Supabase

---

## Deliverables M5
- [x] vendor UI complete
- [x] vendor operations UI ready
- [x] real action buttons (accept / start / complete)
- [x] vendor reviews visible on vendor detail page
- [x] refund status visible on customer order detail ("Dana Telah Dikembalikan")
- [x] refund stats visible on vendor earnings page
- [x] Xendit payment gateway (Edge Functions deployed, webhook registered, payment flow live)

---

# MILESTONE 6
WALLET SYSTEM

---

## GemaPay Wallet
- [x] Route: `/wallet`
- [x] Balance from Supabase
- [x] Topup (request-based, pending approval)
- [x] Transaction history from Supabase
- [x] Withdraw (request-based, pending approval)
- [x] Topup page: `/wallet/topup`
- [x] Withdraw page: `/wallet/withdraw`

## Voucher History
- [ ] Route: `/wallet/vouchers`

## Promo Detail
- [ ] Route: `/wallet/promo/[id]`

---

## Deliverables M6
- [x] wallet UI + data read complete
- [x] wallet transaction on payment via webhook
- [x] topup / withdraw flow (request-based, pending approval)

---

# MILESTONE 7
REALTIME UX

Integrasi setelah UI stabil.

## Features
- [x] live location updates (basic: watchPosition + localStorage)
- [x] chat realtime (Supabase Realtime subscriptions + polling fallback)
- [x] push notifications (service worker scaffolding)
- [ ] online/offline vendor status
- [x] live order progress (milestones via React Query polling)

## Dependencies
- [x] Supabase realtime (subscriptions implemented for messages table)
- [x] Capacitor geolocation (navigator.geolocation for nearby vendors)
- [x] push notifications (service worker scaffolding)

---

# MILESTONE 8
ADMIN PANEL (future)

Belum ada di design Stitch tapi wajib.

## Admin Features
- [x] vendor approval (verify/unverify vendors)
- [x] dispute management (list + resolve with admin notes)
- [x] fraud detection (via monitoring all orders/transactions)
- [x] payout approval (topup/withdrawal approve/reject)
- [x] analytics dashboard (stats: users, vendors, orders, revenue, pending actions)
- [x] promo CRUD (create, toggle active, delete)
- [x] all orders view (filter by status + search)

---

# 4. State Management Roadmap

Gunakan:

- [x] Zustand → UI state
- [x] React Query / Tanstack Query → server state
- [ ] Supabase realtime subscriptions

---

# 5. Performance Optimization

Karena target low-mid Android devices:

- [ ] lazy load map
- [ ] lazy load images
- [ ] skeleton loading
- [ ] optimize bundle size
- [ ] avoid unnecessary re-renders

---

# 6. UX Rules

WAJIB:

- [x] thumb friendly navigation
- [x] minimum tap friction
- [x] max 3 step checkout
- [ ] clear payment status
- [ ] clear verification progress
- [ ] offline state handling

---

# 7. Frontend Development Priority

Urutan build wajib:

1. [x] Design system
2. [x] Auth flow
3. [x] Customer booking flow
4. [x] Vendor onboarding
5. [x] Vendor dashboard + operations
6. [x] Wallet (UI + read)
7. [ ] Realtime features
8. [ ] Admin panel

DILARANG lompat milestone.

---

# 8. Definition of Done

Setiap milestone dianggap selesai jika:

- [ ] responsive mobile
- [ ] connected to real data
- [ ] no broken navigation
- [ ] reusable components
- [ ] loading states available
- [ ] empty states available
- [ ] error handling available

---

# Final Frontend Goal

Output akhir frontend harus menghasilkan:

- [x] web app
- [ ] android app via Capacitor
- [ ] ios app via Capacitor

dari satu codebase Next.js saja.
