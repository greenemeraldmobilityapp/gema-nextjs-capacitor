PRD.md — GEMA (Green Emerald Mobility Apps)

Version 2.0 (Execution Ready)

---

## 13. Known Issues & Technical Decisions

### 13.1 Android Chrome — File Upload via `accept` Multi-type

**Issue**: Android Chrome returns `File.type = ''` (empty string) when `<input accept=".pdf,image/*">` contains mixed MIME types (PDF + image). This causes `supabase.storage.upload()` to fail because the fallback `contentType` (`'application/octet-stream'`) is not handled correctly by the client on Android.

**Affects**: Vendor verification — certificate upload page (`/vendor/verification/certification`)
**Fix applied**: Changed `accept=".pdf,image/*"` → `accept="image/*"` with fallback `contentType: 'image/jpeg'`

**Future PDF support**: Must use a **separate upload button/flow** for PDF files, not mixed via `accept` attribute. For example:
- Upload foto sertifikat (JPG/PNG) — `accept="image/*"`
- Upload dokumen pendukung (PDF) — `accept=".pdf"` (button terpisah, endpoint berbeda)

---
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

5. Revenue Model — Dual Transparent Fee

GEMA menerapkan model fee dua sisi (dual-side fee) dengan persentase berbeda dan transparan per pihak. Masing-masing pihak hanya mengetahui fee-nya sendiri, bukan fee pihak lain.

Customer Fee

- Biaya platform: +5% dari harga jasa (base_amount)
- Customer membayar: base_amount + 5%
- Tampilan di customer: "Biaya Platform (5%)" pada rincian pembayaran

Vendor Fee

- Biaya platform: -10% dari harga jasa (base_amount)
- Vendor menerima: base_amount - 10%
- Tampilan di vendor: "Biaya Platform (10%)" pada rincian pembayaran

Ilustrasi Transaksi

Harga jasa: Rp 150.000
Customer bayar: Rp 150.000 + Rp 7.500 (5%) = Rp 157.500
Vendor terima: Rp 150.000 - Rp 15.000 (10%) = Rp 135.000
Platform peroleh: Rp 7.500 + Rp 15.000 = Rp 22.500 (15% dari base)

Prinsip

- Customer tidak melihat fee vendor
- Vendor tidak melihat fee customer
- Fee dipotong otomatis saat escrow release
- Platform fee dicatat di tabel orders (platform_fee, vendor_payout)
- Tidak ada biaya tersembunyi di luar yang ditampilkan

Dasar Hukum & Dokumentasi

- Fee structure ini wajib dicantumkan di:
  - Syarat & Ketentuan (S&K) pengguna
  - Kebijakan Privasi
  - Halaman bantuan (FAQ)
  - Tampilan checkout customer (transparan)
  - Tampilan rincian pesanan vendor (transparan)
- Perubahan fee structure harus melalui persetujuan pengguna via notifikasi in-app

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

## 13. Known Issues & Technical Decisions

### 13.1 Android Chrome — File Upload via `accept` Multi-type

**Issue**: Android Chrome returns `File.type = ''` (empty string) when `<input accept=".pdf,image/*">` contains mixed MIME types (PDF + image). This causes `supabase.storage.upload()` to fail because the fallback `contentType` (`'application/octet-stream'`) is not handled correctly by the client on Android.

**Affects**: Vendor verification — certificate upload page (`/vendor/verification/certification`)
**Fix applied**: Changed `accept=".pdf,image/*"` → `accept="image/*"` with fallback `contentType: 'image/jpeg'`

**Future PDF support**: Must use a **separate upload button/flow** for PDF files, not mixed via `accept` attribute. For example:
- Upload foto sertifikat (JPG/PNG) — `accept="image/*"`
- Upload dokumen pendukung (PDF) — `accept=".pdf"` (button terpisah, endpoint berbeda)

---

### 13.2 Onboarding Page Copy (Opsi A — Friendly & Benefit-First)

**Style**: Friendly, warm, benefit-driven, bahasa Indonesia natural
**Principle**: Benefit-first, tidak corporate/technical, approachable tone

| Slide | Title | Description | Icon |
|-------|-------|-------------|------|
| 1 — Temukan Layanan | "Solusi Layanan Terpercaya di Ujung Jari" | "Temukan tukang ahli di dekat Anda — dari perbaikan rumah hingga kebutuhan sehari-hari, semua dalam satu aplikasi." | Wrench |
| 2 — Vendor Terverifikasi | "Vendor Terpilih, Kualitas Terjamin" | "Setiap Mitra melewati proses verifikasi ketat, sehingga Anda tidak perlu khawatir tentang kualitas dan keamanan." | ShieldCheck |
| 3 — Pembayaran Aman | "Bayar Setelah Selesai, Tanpa Risiko" | "Pembayaran ditahan sampai Anda puas. Dana baru dilepaskan ke Mitra setelah pekerjaan selesai dan Anda konfirmasi." | Wallet |

**Tanggal disusun**: 2026-05-19