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
- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Lucide Icons
- Framer Motion

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
Primary:
- Emerald 500 (#10B981)
- Emerald 600 (#059669)

Secondary:
- Gray scale
- Success
- Warning
- Error

---

## Typography
- Heading
- Subheading
- Body
- Caption

---

## Global Components

Harus dibuat terlebih dahulu:

### Navigation
- Bottom navbar
- Top navbar
- Back header
- Drawer menu

### Form Components
- Input
- Select
- Textarea
- File upload
- OTP input

### Card Components
- Vendor card
- Service card
- Portfolio card
- Order card
- Wallet card

### Feedback Components
- Toast
- Modal
- Alert dialog
- Loading skeleton
- Empty states

### Map Components
- Vendor marker
- Live tracking marker
- Radius search indicator

---

# MILESTONE 1
AUTHENTICATION FLOW

Prioritas pertama karena semua flow bergantung auth.

---

## Screen 1
Splash Screen

UI:
- logo animation
- loading state

Route:
/
→ redirect auth check

---

## Screen 2
Onboarding Discovery

Route:
/onboarding

Features:
- swipe onboarding
- CTA login/register

---

## Screen 3
Role Selection

Route:
/register/role

Features:
- choose customer
- choose vendor

---

## Screen 4
Register

Route:
/register

Features:
- email signup
- google signup
- validation states

---

## Screen 5
Login

Route:
/login

Features:
- email login
- google login
- forgot password

---

## Deliverables M1
✅ auth UI complete  
✅ session persistence  
✅ responsive tested  

---

# MILESTONE 2
CUSTOMER CORE FLOW

Ini adalah core bisnis utama.

---

## Screen 6
Customer Home

Route:
/customer/home

Features:
- nearby vendor map
- service categories
- search bar
- promo banner
- recommendations

---

## Screen 7
Vendor Detail

Route:
/customer/vendor/[id]

Features:
- profile detail
- rating
- portfolio
- service list
- CTA booking

---

## Screen 8
Booking Summary

Route:
/customer/booking/[id]

Features:
- service summary
- notes
- schedule
- pricing breakdown

---

## Screen 9
Payment Method

Route:
/customer/payment/[id]

Features:
- QRIS
- VA
- wallet
- promo voucher

---

## Screen 10
Payment Success

Route:
/customer/payment/success

---

## Screen 11
Order Tracking

Route:
/customer/order/[id]

Features:
- realtime status
- map tracking
- chat vendor

---

## Screen 12
Order History

Route:
/customer/orders

---

## Deliverables M2
✅ booking flow complete  
✅ payment flow complete  
✅ order tracking complete  

---

# MILESTONE 3
CUSTOMER ACCOUNT FLOW

---

## Profile

Route:
/customer/profile

---

## Edit Profile

Route:
/customer/profile/edit

---

## Notification Settings

Route:
/customer/settings/notifications

---

## Security Settings

Route:
/customer/settings/security

---

## Help Center

Route:
/customer/help

---

## FAQ

Route:
/customer/help/faq/[id]

---

## Deliverables M3
✅ account flow complete

---

# MILESTONE 4
VENDOR ONBOARDING FLOW

Vendor onboarding cukup kompleks.

---

## Verification Intro

Route:
/vendor/verification

---

## KTP Verification

Route:
/vendor/verification/ktp

---

## Professional Certification

Route:
/vendor/verification/certification

---

## Verification Review

Route:
/vendor/verification/review

---

## Deliverables M4
✅ vendor onboarding complete

---

# MILESTONE 5
VENDOR BUSINESS FLOW

---

## Vendor Dashboard

Route:
/vendor/dashboard

Features:
- order stats
- earnings summary
- notifications

---

## Vendor Profile

Route:
/vendor/profile

---

## Edit Vendor Profile

Route:
/vendor/profile/edit

---

## Portfolio Management

Route:
/vendor/portfolio

---

## Add Portfolio

Route:
/vendor/portfolio/add

---

## Vendor Chat

Route:
/vendor/chat

---

## Active Orders

Route:
/vendor/orders

---

## Deliverables M5
✅ vendor operations ready

---

# MILESTONE 6
WALLET SYSTEM

---

## GemaPay Wallet

Route:
/wallet

Features:
- balance
- topup
- history
- withdrawals

---

## Voucher History

Route:
/wallet/vouchers

---

## Promo Detail

Route:
/wallet/promo/[id]

---

## Deliverables M6
✅ wallet UI ready

---

# MILESTONE 7
REALTIME UX

Integrasi setelah UI stabil.

---

## Features
- live location updates
- chat realtime
- push notifications
- online/offline vendor status
- live order progress

---

## Dependencies
- Supabase realtime
- Capacitor geolocation
- push notifications

---

# MILESTONE 8
ADMIN PANEL (future)

Belum ada di design Stitch tapi wajib.

---

## Admin Features
- vendor approval
- dispute management
- fraud detection
- payout approval
- analytics dashboard

---

# 4. State Management Roadmap

Gunakan:

- Zustand → UI state
- React Query / Tanstack Query → server state
- Supabase realtime subscriptions

---

# 5. Performance Optimization

Karena target low-mid Android devices:

- lazy load map
- lazy load images
- skeleton loading
- optimize bundle size
- avoid unnecessary re-renders

---

# 6. UX Rules

WAJIB:

- thumb friendly navigation
- minimum tap friction
- max 3 step checkout
- clear payment status
- clear verification progress
- offline state handling

---

# 7. Frontend Development Priority

Urutan build wajib:

1. Design system
2. Auth flow
3. Customer booking flow
4. Vendor onboarding
5. Vendor dashboard
6. Wallet
7. Realtime features
8. Admin panel

DILARANG lompat milestone.

---

# 8. Definition of Done

Setiap milestone dianggap selesai jika:

- responsive mobile
- connected to mock data
- no broken navigation
- reusable components
- loading states available
- empty states available
- error handling available

---

# Final Frontend Goal

Output akhir frontend harus menghasilkan:

- web app
- android app via Capacitor
- ios app via Capacitor

dari satu codebase Next.js saja.