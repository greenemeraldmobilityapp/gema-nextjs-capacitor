# Phase 12 — Scale Phase

> Status: ☐ Belum Dimulai
> Prasyarat: Phase 11 (Beta Launch) sudah mencapai Go/No-Go criteria
> Target: 500+ vendor, 5,000+ customer, 1,000+ transaksi/bulan
> Durasi: 3–6 bulan

---

## 12.0 Prasyarat — Checklist Sebelum Scale

- [ ] Phase 11 Go decision sudah disetujui (founder/CTO)
- [ ] 50+ vendor terverifikasi dan aktif
- [ ] 500+ customer terdaftar
- [ ] 200+ transaksi completed per bulan
- [ ] Refund ratio < 5%
- [ ] NPS customer > 40
- [ ] Revenue positif atau breakeven
- [ ] Semua critical bug resolved
- [ ] Tim support sudah tervalidasi (handle 200+ transaksi/bulan)
- [ ] Infrastructure tidak ada bottleneck

---

## 12.1 Multi-City Expansion

### 12.1.1 Expansion Playbook

Dokumentasi proses yang sudah tervalidasi di beta agar bisa di-replicate ke kota baru:

- [ ] Buat _Expansion Kit_ berisi:
  - SOP rekrutmen vendor per kota
  - Template iklan Facebook/Google per kota
  - Konten sosial media per daerah (bahasa daerah jika perlu)
  - Daftar komunitas/group WhatsApp lokal
  - Mitra potensial (toko material, bengkel) per kota
- [ ] Assign 1 city lead per kota baru
- [ ] Budget akuisisi per kota: Rp 3-5 juta / bulan pertama

### 12.1.2 City Expansion Roadmap

| Wave | Kota | Target Vendor | Target Customer | Timeline |
|------|------|---------------|-----------------|----------|
| 1 | Jakarta (all areas) | 100 | 1,000 | Month 1-2 |
| 2 | Tangerang, Bekasi, Depok, Bogor | 150 | 1,500 | Month 2-4 |
| 3 | Bandung, Surabaya | 100 | 1,000 | Month 4-6 |
| 4 | Medan, Makassar, Semarang | 100 | 1,000 | Month 6-8 |
| 5 | Secondary cities (20+ kota) | 50-100 each | 500 each | Month 8-12 |

### 12.1.3 Category Expansion

Seiring scale, buka kategori baru:

| Wave | Kategori Baru | Justifikasi | Target Order/bulan |
|------|---------------|-------------|-------------------|
| 1 | Jasa kebersihan rumah | Permintaan tinggi, supply mudah | 150 |
| 2 | Tukang taman | Komplementer dengan renovasi | 100 |
| 3 | Jasa pindahan | Musiman (liburan/ tahun baru) | 75 |
| 4 | Guru privat (les) | Online/offline, margin tinggi | 200 |
| 5 | Fotografer/videografer | Event-based, harga tinggi | 50 |
| 6 | Mekanik mobil/motor darurat | On-demand, urgent | 100 |

---

## 12.2 Infrastructure Scale

### 12.2.1 Supabase Optimization

- [ ] Upgrade Supabase plan (Scaler / Team) — disk, connections, bandwidth
- [ ] Implement query optimization:
  - [ ] Review slow queries (> 100ms)
  - [ ] Add composite indexes untuk query umum:
    - `orders(customer_id, created_at DESC)`
    - `orders(vendor_id, created_at DESC)`
    - `services(vendor_id, category)`
    - `messages(chat_id, created_at ASC)`
  - [ ] Implement pagination di semua list query (limit + offset)
- [ ] Setup read replica untuk reporting/analytics (jika perlu)
- [ ] Implement connection pooling (Supabase default atau PgBouncer)
- [ ] Optimasi Realtime:
  - [ ] Realtime channel: hanya subscribe pada chat aktif
  - [ ] Unsubscribe dari channel yang tidak aktif
- [ ] Setup database backup otomatis (point-in-time recovery)

### 12.2.2 Edge Functions Optimization

- [ ] Refactor Edge Functions untuk performa:
  - [ ] Implement caching jika memungkinkan
  - [ ] Reduce cold start: minimalkan dependencies
  - [ ] Parallelize Supabase calls (Promise.all)
- [ ] Monitor execution time — alert jika > 2 detik
- [ ] Implement retry logic untuk Xendit API calls
- [ ] Implement idempotency key untuk semua payment operations

### 12.2.3 Cloudflare Pages Optimization

- [ ] Setup CDN caching rules untuk static assets
- [ ] Implement smart CDN: cache API responses jika memungkinkan
- [ ] Enable HTTP/2 dan HTTP/3 (QUIC)
- [ ] Setup Argo Smart Routing (berbayar, opsional)
- [ ] Optimasi build time:
  - [ ] Incremental build (jika didukung)
  - [ ] Parallel page generation

### 12.2.4 CI/CD Automation

- [ ] Setup GitHub Actions untuk Android build:
  - [ ] Debug APK on push ke `main`
  - [ ] Release AAB on tag `v*`
- [ ] Setup GitHub Secrets (lihat `docs/PRODUCTION_SECRETS.md`):
  - `ANDROID_SIGNING_KEY` (base64 keystore)
  - `ANDROID_KEYSTORE_PASSWORD`
  - `ANDROID_KEY_ALIAS`
  - `ANDROID_KEY_PASSWORD`
- [ ] Setup Firebase App Distribution:
  - `FIREBASE_TOKEN`
  - `FIREBASE_APP_ID`
- [ ] Auto-deploy ke Cloudflare Pages via GitHub Actions
- [ ] Setup Slack/Email notification untuk build status

### 12.2.5 Monitoring Scale

- [ ] Upgrade Sentry ke Team plan (jika perlu)
- [ ] Setup custom dashboards:
  - Real-time order volume
  - Payment success/failure rate
  - Supabase API usage (% of quota)
  - Edge Function error rate + execution time
  - Page load time (LCP, FID, CLS)
- [ ] Setup automated alerts:
  - Error rate > 1% → Slack/Email
  - Payment failure > 5% → PagerDuty/Phone
  - Server downtime > 5 menit → Phone
  - Supabase usage > 80% → Email
- [ ] Implement health endpoint: `/api/health`
  - Check: Supabase connection, Xendit API, DB connection
  - Public status page: `status.gema.co.id`

---

## 12.3 Product Scale Features

### 12.3.1 New Verticals

#### 12.3.1.1 Courier Delivery (Wave 1)

**Fitur:**
- Customer request delivery (same-day / scheduled)
- Real-time driver tracking (mirip GoSend)
- Dynamic pricing based on distance + weight

**Tasks:**
- [ ] Buat tabel `deliveries`: id, customer_id, driver_id, pickup_address, delivery_address, item_description, weight, distance, price, status, created_at
- [ ] Buat tabel `drivers`: id, user_id, vehicle_type, plate_number, is_online, current_lat, current_lng
- [ ] Implement real-time driver location (WebSocket via Supabase Realtime)
- [ ] Implement pricing algorithm: base fare + per km + per kg
- [ ] Integrasi dengan wallet untuk pembayaran
- [ ] Tambah filter "Kurir" di halaman home/search

#### 12.3.1.2 Remote Freelance IT (Wave 2)

**Fitur:**
- Remote consultation/jasa IT (desain, programming, instalasi software)
- Online delivery — tanpa visit fisik
- Screen sharing / remote assistance

**Tasks:**
- [ ] Buat kategori baru: "IT & Digital Services"
- [ ] Implement online delivery flow (no location required)
- [ ] Integrasi video call (Agora / LiveKit / Jitsi)
- [ ] Fitur screen sharing (untuk tutorial/pendampingan)
- [ ] Implement time tracking (per jam vs fixed price)

#### 12.3.1.3 Subscription Model (Wave 3)

**Fitur:**
- Vendor bayar subscription bulanan untuk premium listing
- 3 tier: Basic (free), Pro (Rp 50k/bln), Enterprise (Rp 200k/bln)
- Pro: badge "Premium", priority in search, analytics dashboard
- Enterprise: featured listing, dedicated support, promo tools

**Tasks:**
- [ ] Buat tabel `vendor_subscriptions`: id, vendor_id, tier, start_date, end_date, status, auto_renew
- [ ] Implement subscription payment via Xendit recurring
- [ ] Modify search query to prioritize premium vendors
- [ ] Buat vendor analytics dashboard (Pro+)
- [ ] Implement promo tools (Enterprise)

### 12.3.2 Advanced Platform Features

#### 12.3.2.1 AI Recommendations

**Fitur:**
- Rekomendasi vendor berdasarkan histori customer
- Smart search: auto-complete, typo tolerance, synonym matching
- Price estimation tool (AI prediction based on job scope)

**Tasks:**
- [ ] Collect data: search history, order history, ratings
- [ ] Build recommendation model (simple: collaborative filtering)
- [ ] Implement: "Vendor Lainnya yang Mungkin Anda Suka" di halaman vendor detail
- [ ] Implement: search auto-complete dengan Supabase pg_trgm
- [ ] Implement: price range estimator di halaman booking

#### 12.3.2.2 Loyalty Program

**Fitur:**
- Points system: Rp 1,000 = 1 point
- Tier: Bronze (0), Silver (100), Gold (500), Platinum (2000)
- Benefits: fee discount, priority support, exclusive promos

**Tasks:**
- [ ] Buat tabel `loyalty_points`: id, user_id, points, tier, last_updated
- [ ] Buat tabel `loyalty_rewards`: id, name, points_required, description, stock
- [ ] Implement point accrual: on completed orders
- [ ] Implement reward redemption: discount voucher, fee waiver
- [ ] Show tier progress in customer profile

#### 12.3.2.3 Insurance & Protection

**Fitur:**
- Asuransi pekerjaan: protect customer jika vendor merusak properti
- Asuransi vendor: protect vendor saat bekerja
- Free untuk 10 transaksi pertama, lalu paid add-on

**Tasks:**
- [ ] Research partner asuransi (AXA, Allianz, atau insurtech lokal)
- [ ] Implement insurance selection saat booking
- [ ] Implement claim flow via admin panel
- [ ] Integration dengan API partner asuransi

### 12.3.3 Payment & Wallet Enhancement

- [ ] Implement auto-withdrawal — vendor balance otomatis cair tiap Rp 100,000
- [ ] Implement multiple payment methods:
  - QRIS (via Xendit)
  - GoPay / OVO / Dana (via Xendit)
  - Bank transfer
  - Credit card
- [ ] Wallet earning: bunga 0.5% per bulan untuk saldo mengendap
- [ ] Invoice generation — PDF invoice otomatis untuk tiap transaksi
- [ ] Implement Xendit recurring untuk subscription payment

---

## 12.4 Team & Operations Scale

### 12.4.1 Team Structure

| Role | Jumlah Saat Scale | Tanggung Jawab |
|------|-------------------|----------------|
| Community Manager | 2 (per 2 kota) | Vendor recruitment, onboarding, retention |
| Customer Support | 3-5 (scaling) | Respon customer & vendor issues |
| Admin Ops | 2 | Dispute handling, refund, fraud review |
| Software Engineer | 1-2 | Bug fixing, feature development, infra |
| City Lead | 1 per kota | Lokal execution, partnership, acquisition |
| Marketing | 1 | Campaign, content, ads, social media |
| Finance | 1 | Revenue tracking, payout, tax |

### 12.4.2 SOP Documentation

- [ ] **Vendor SOP**: Recruitment, KYC verification, activation, retention, deactivation
- [ ] **Customer SOP**: Support flow, refund flow, complaint handling, escalation
- [ ] **Payment SOP**: Refund approval, dispute resolution, fraud investigation
- [ ] **Technical SOP**: Incident response, server migration, DB maintenance
- [ ] **Finance SOP**: Payout schedule, tax reporting, revenue reconciliation

### 12.4.3 Training Program

- [ ] Buat training module untuk Community Manager:
  - Cara rekrut vendor
  - Cara bantu vendor KYC
  - Cara handle keberatan vendor
- [ ] Buat training module untuk Customer Support:
  - Tools: dashboard admin, WhatsApp Business
  - Template balasan
  - Escalation flow
- [ ] Periodic training refresh: bulanan

---

## 12.5 Marketing & Growth

### 12.5.1 Growth Channels

| Channel | Budget/bln | Target | Notes |
|---------|------------|--------|-------|
| Facebook/Instagram Ads | Rp 5-10 juta | Customer acquisition | A/B test kreatif tiap minggu |
| Google Ads (Search) | Rp 3-5 juta | High-intent customer | Keyword: "tukang terdekat", "service AC" |
| TikTok Ads | Rp 2-3 juta | Awareness (25-35) | Video pendek demo fitur |
| Influencer (micro) | Rp 2-5 juta | Trust building | 5-10 influencer/bulan |
| Referral Program | Rp 1-2 juta | Organic growth | Voucher Rp 25k per referral |
| Content Marketing | Rp 0 (organik) | SEO + authority | Blog: tips perbaikan rumah |
| Partnership | Rp 0 (barter) | Distribution | Toko material, bengkel, properti |

### 12.5.2 Retention Strategies

- [ ] Push notification: "Vendor sedang online di dekat Anda"
- [ ] Email/SMS: monthly summary transaksi
- [ ] Re-engagement campaign untuk customer yang tidak order > 30 hari
- [ ] "Order week" promo: diskon platform fee tiap minggu pertama bulan
- [ ] Birthday promo: voucher Rp 50,000 untuk customer
- [ ] Vendor loyalty: fee discount untuk vendor dengan rating > 4.8

### 12.5.3 Brand Building

- [ ] Logo, brand guide, color palette final
- [ ] Tagline: "Jasa Profesional, Terpercaya, di Dekatmu"
- [ ] Buat website marketing page (pisah dari app): `gema.co.id`
- [ ] Google My Business: GEMA
- [ ] LinkedIn company page
- [ ] YouTube channel: tutorial + testimonial

---

## 12.6 Financial Model

### 12.6.1 Revenue Projection (Monthly)

| Sumber Revenue | Month 3 | Month 6 | Month 12 |
|----------------|---------|---------|----------|
| Platform fee (customer 5%) | Rp 5 jt | Rp 25 jt | Rp 75 jt |
| Platform fee (vendor 10%) | Rp 10 jt | Rp 50 jt | Rp 150 jt |
| Subscription (vendor) | Rp 0 | Rp 5 jt | Rp 20 jt |
| Advertising (future) | Rp 0 | Rp 2 jt | Rp 10 jt |
| **Total Revenue** | **Rp 15 jt** | **Rp 82 jt** | **Rp 255 jt** |

### 12.6.2 Cost Projection (Monthly)

| Biaya | Month 3 | Month 6 | Month 12 |
|-------|---------|---------|----------|
| Supabase | Rp 500k | Rp 1 jt | Rp 3 jt |
| Cloudflare | Rp 0 (free) | Rp 0 | Rp 200k |
| Xendit | Rp 500k | Rp 2 jt | Rp 5 jt |
| Infra total | Rp 1 jt | Rp 3 jt | Rp 8.2 jt |
| Marketing | Rp 5 jt | Rp 10 jt | Rp 20 jt |
| Tim (3-5 org) | Rp 30 jt | Rp 50 jt | Rp 80 jt |
| **Total Cost** | **Rp 36 jt** | **Rp 63 jt** | **Rp 108.2 jt** |

### 12.6.3 Unit Economics

| Metrik | Target | Formula |
|--------|--------|---------|
| CAC Customer | < Rp 20,000 | Total marketing / new customer |
| CAC Vendor | < Rp 100,000 | Total rekrutmen / new vendor |
| LTV Customer | > Rp 150,000 | Avg order × avg margin × repeat rate |
| LTV Vendor | > Rp 500,000 | Avg monthly fee × avg months active |
| Payback period | < 3 bulan | CAC / monthly margin per user |

### 12.6.4 Cost Optimization

- [ ] Evaluasi Supabase plan — upgrade hanya jika perlu
- [ ] Evaluate Cloudflare plan — Workers/Bandwidth unlimited di free tier
- [ ] Optimasi cost per transaksi — batch Xendit disbursement jika memungkinkan
- [ ] Evaluasi: in-house OCR vs Supabase Storage untuk KYC
- [ ] Evaluasi: push notification in-house vs Firebase

---

## 12.7 Technical Debt & Architecture

### 12.7.1 Refactoring Priorities

- [ ] Migrasi dari polling-based realtime ke Supabase Realtime subscription untuk orders
- [ ] Implement service worker untuk background sync
- [ ] Dynamic import untuk halaman yang jarang diakses (code splitting)
- [ ] Implement offline-first architecture:
  - Cache halaman statis di service worker
  - Queue pending actions (chat, order) saat offline
  - Sync saat online kembali
- [ ] Migrasi dari localStorage pattern ke IndexedDB (untuk data besar)

### 12.7.2 Testing Infrastructure

- [ ] Setup Playwright E2E tests:
  - Critical flows: login, booking, payment, chat
  - Cross-browser testing (Chrome, Firefox, Safari mobile)
- [ ] Implement API integration tests untuk Edge Functions
- [ ] Setup test database (branch via Supabase branching)
- [ ] Implement load testing:
  - k6 or Artillery untuk Edge Functions
  - Target: 100 concurrent users, response < 1s

### 12.7.3 Security Hardening

- [ ] Regular security audit (bulanan)
- [ ] Penetration testing (sebelum scale ke 10k users)
- [ ] Implement rate limiting di Supabase:
  - Auth: max 5 attempts per 15 menit
  - API: max 100 requests per menit per user
- [ ] Implement IP-based blocking untuk suspicious activity
- [ ] Review dan update RLS policies secara berkala

---

## 12.8 Regulatory & Compliance

### 12.8.1 Legal Requirements

- [ ] Daftarkan perusahaan legal (PT) — jika belum
- [ ] Siapkan perjanjian vendor (PK) — template legal
- [ ] Siapkan syarat & ketentuan (S&K) yang sudah konsultasi hukum
- [ ] Kebijakan privasi — compliant dengan UU PDP (jika sudah berlaku)
- [ ] Daftarkan merek GEMA (HAKI)
- [ ] Daftarkan domain `.co.id` (jika belum)

### 12.8.2 Tax Compliance

- [ ] Daftar NPWP perusahaan
- [ ] Implement Pajak (PPN 11%) di fee structure
- [ ] Siapkan laporan pajak bulanan
- [ ] PPh 21 untuk karyawan
- [ ] PPh 23 untuk vendor (jika memenuhi threshold)
- [ ] Konsultasi dengan konsultan pajak

### 12.8.3 Data Privacy (UU PDP)

- [ ] Data Protection Officer (DPO) assignment
- [ ] Register sistem elektronik ke Kominfo
- [ ] Data Retention Policy
- [ ] Data Deletion Flow (hak customer untuk hapus data)
- [ ] Data Breach Notification Plan
- [ ] Privacy Impact Assessment

---

## 12.9 Exit & Contingency

### 12.9.1 What If Scenarios

| Scenario | Action |
|----------|--------|
| Gagal mencapai product-market fit | Pivot ke model B2B (white-label marketplace) |
| Biaya operasional > revenue | Nonaktifkan ekspansi, fokus optimasi biaya |
| Fraud merajalela | Wajibkan verifikasi lanjutan (video call) untuk vendor |
| Xendit bermasalah | Integrasi Midtrans / iPaymu sebagai backup |
| Competitor muncul | Fokus di niche (home services) + lokalitas |
| Partner vendor hengkang | Bangun komunitas loyal, kurangi ketergantungan |

### 12.9.2 Scale Triggers

Scale fase berikutnya di-trigger oleh metrik:

| Trigger | Action | Target |
|---------|--------|--------|
| 500 transaksi/bulan | Recruit 2 lebih banyak vendor | 8 minggu |
| 1,000 transaksi/bulan | Buka 3 kota baru + hire 2 city lead | 12 minggu |
| 5,000 transaksi/bulan | Evaluasi funding/outside investment | 16 minggu |
| Revenue > cost | Reinvest profit ke marketing | Ongoing |
| NPS > 60 | Ekspansi kategori baru | 4 minggu |

---

## 12.10 Phase 12 Exit Criteria

Proyek GEMA dianggap scaling sukses jika:

- [ ] 500+ vendor terverifikasi
- [ ] 5,000+ customer terdaftar
- [ ] 1,000+ transaksi completed per bulan
- [ ] Repeat order rate > 25%
- [ ] Refund ratio < 5%
- [ ] Revenue > operational cost (breakeven)
- [ ] NPS > 40
- [ ] 5+ kota aktif
- [ ] Tim 5+ orang
- [ ] Automated CI/CD berjalan
- [ ] Tidak ada critical security issue
- [ ] Rating Play Store > 4.0 (jika sudah di Play Store)

---

## 12.11 Timeline Summary

```
Month  1-2:  Multi-city expansion (Jabodetabek)
             Infrastructure scale (Supabase upgrade, indexes, CDN)
             GitHub Actions CI/CD setup
             Team hire: community manager, support

Month  3-4:  Category expansion (cleaning, garden)
             Courier vertical development & launch
             Loyalty points system
             AI recommendations (basic)

Month  5-6:  Bandung + Surabaya launch
             Remote freelance IT vertical
             Subscription model launch
             Multiple payment methods (QRIS, e-wallet)

Month  7-8:  Medan + Makassar launch
             Insurance & protection feature
             Video call integration
             Play Store production launch

Month  9-10: Secondary cities (20+)
             Advanced analytics dashboard
             Marketing automation (push, email)
             Refactoring: offline-first, realtime subscription

Month 11-12: Full automation — CI/CD, monitoring, reporting
             1,000+ transaksi/bulan target
             Funding/investor preparation
             Product roadmap v3.0
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-05-27
