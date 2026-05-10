PRD.md — GEMA (Green Emerald Mobility Apps)

Version 2.0 (Execution Ready)

---

1. Product Vision

GEMA adalah marketplace jasa profesional berbasis lokasi yang menghubungkan customer dengan vendor terpercaya untuk layanan teknikal dan home services.

Fokus MVP:

- Tukang bangunan
- Teknisi listrik
- Teknisi AC
- Plumbing
- Interior consultation
- Jasa renovasi ringan
- Kurir lokal (phase berikutnya, bukan MVP)

---

2. Problem Statement

Permasalahan pasar saat ini:

Customer Problems

- Sulit menemukan vendor terpercaya
- Tidak ada transparansi harga
- Risiko penipuan pembayaran
- Sulit melacak progress pekerjaan
- Sulit menemukan vendor terverifikasi

Vendor Problems

- Sulit mendapatkan pelanggan konsisten
- Tidak memiliki sistem pembayaran aman
- Sulit membangun reputasi digital
- Tidak memiliki tools operasional

---

3. MVP Scope (STRICT)

MVP hanya fokus pada:

Customer

- Register/login
- Search vendor nearby
- Booking service
- Escrow payment
- Live tracking
- Chat
- Review

Vendor

- Registration
- KYC verification
- Portfolio upload
- Order management
- Earnings dashboard

Admin

- Vendor approval
- Order dispute handling
- Refund approval
- Fraud monitoring

---

4. Future Scope (NOT MVP)

- Courier delivery
- Remote freelance IT services
- Subscription model
- Insurance
- AI recommendations
- Advanced loyalty program
- Multi-city expansion

---

5. Revenue Model

Platform Fee

5–15% per transaction

Vendor Subscription (future)

Premium listing

Ads Placement (future)

---

6. Technical Architecture

Frontend

- Next.js App Router
- Static Export
- Tailwind CSS
- Shadcn UI
- Capacitor

Backend

- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

ORM

- Drizzle ORM

Payment

- Xendit

Monitoring

- Sentry
- Mixpanel

---

7. User Roles

Customer

Mencari dan memesan jasa

Vendor

Menyediakan jasa

Admin

Monitoring marketplace

---

8. Database Schema

users

- id
- full_name
- email
- phone
- role
- lat
- lng
- is_online
- created_at

---

vendor_profiles

- user_id
- specialization
- bio
- rating
- total_jobs
- is_verified
- avatar_url

---

services

- id
- vendor_id
- title
- category
- price
- description

---

orders

- id
- customer_id
- vendor_id
- service_id
- service_category
- service_name
- scheduled_date
- scheduled_time
- service_address
- notes
- base_amount
- platform_fee
- vendor_payout
- total_amount
- payment_status
- escrow_status
- order_status
- completed_at
- cancelled_at

---

chats

- id
- order_id
- sender_id

---

messages

- id
- chat_id
- sender_id
- message
- attachment_url
- created_at

---

reviews

- id
- order_id
- customer_id
- vendor_id
- rating
- review_text
- review_image

---

wallets

- id
- user_id
- balance

---

wallet_transactions

- id
- wallet_id
- type
- amount
- status

---

disputes

- id
- order_id
- opened_by
- status
- resolution

---

9. Security

- Supabase RLS wajib aktif
- Xendit secret key hanya di Edge Functions
- KYC document encrypted storage
- Rate limiting auth endpoints
- Device session validation

---

10. KPI Success Metrics

Target 6 bulan pertama:

- 500 vendor terverifikasi
- 5,000 customer
- 1,000 completed transactions/month
- Repeat order rate > 25%
- Refund ratio < 5%

---

11. Non Functional Requirements

- Fast loading on low-end Android devices
- Mobile first UX
- Offline fallback state
- Push notifications
- Crash monitoring
- Realtime order updates

---

12. Major Risks

- Vendor supply shortage
- Fraud transactions
- Poor service quality
- High customer acquisition cost

---