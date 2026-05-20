# Phase 11 — Beta Launch

> Status: ☐ Belum Dimulai
> Target: 500 vendor terverifikasi, 5,000 customer, 1,000 transaksi/bulan
> Durasi: 8–12 minggu

---

## 11.0 Prasyarat — Checklist Sebelum Launch

- [ ] Semua bug High di `bug_fix_plan.md` sudah ter-resolve
- [ ] `npm run build` — 0 error
- [ ] `npm run lint` — 0 error (atau known warnings only)
- [ ] APK debug lolos uji di minimal 3 device fisik berbeda
- [ ] Xendit production API key terpasang (bukan sandbox)
- [ ] Supabase production environment terkonfigurasi
- [ ] Sentry/Monitoring aktif
- [ ] Semua RLS policy ter-verify untuk role customer, vendor, admin
- [ ] Terms & Conditions serta Privacy Policy sudah live

---

## 11.1 Production Environment Setup

### 11.1.1 Supabase Production

- [ ] Upgrade Supabase project ke paid plan (jika perlu — free tier cukup untuk beta)
- [ ] Switch Xendit API key dari `xnd_development_...` ke `xnd_live_...`
- [ ] Update Xendit webhook URL ke production endpoint
- [ ] Verify webhook callback token terupdate
- [ ] Set Edge Functions env vars: `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`
- [ ] Hapus atau nonaktifkan test users dari database
- [ ] Reset semua wallet balance test
- [ ] Hapus test orders, chats, messages
- [ ] Verify tidak ada data sensitif test tertinggal di storage buckets

### 11.1.2 Cloudflare Pages Production

- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Cloudflare dashboard
- [ ] Set custom domain (misal: `app.gema.co.id` atau `gemaapp.com`)
- [ ] Konfigurasi SSL/TLS di Cloudflare — Full (strict)
- [ ] Setup redirect: `gema-app.pages.dev` → custom domain
- [ ] Test production URL di browser desktop dan mobile
- [ ] Verify semua halaman tidak ada broken asset (gambar, ikon, font)

### 11.1.3 Android Build & Distribution

- [ ] Build release APK dengan keystore signing:
  ```bash
  npm run build
  npx cap sync android
  cd android && ./gradlew assembleRelease
  ```
- [ ] Test APK release di minimal 3 device fisik:
  - Android 12+ (Samsung, Xiaomi, Oppo/Vivo)
  - Layar kecil (< 6 inch) dan besar (> 6.5 inch)
  - Koneksi lambat (3G throttle)
- [ ] Upload APK ke Firebase App Distribution (internal testing, 50 tester)
- [ ] Setup crash reporting (Sentry atau Firebase Crashlytics)
- [ ] Buat halaman landing download APK di website GEMA

### 11.1.4 Google Play Console (Opsional)

- [ ] Buat akun developer Google Play ($25 one-time)
- [ ] Generate signed AAB:
  ```bash
  cd android && ./gradlew bundleRelease
  ```
- [ ] Upload AAB ke Play Console — Internal Testing track
- [ ] Add tester emails (max 100)
- [ ] Publish internal test

---

## 11.2 Onboarding & Supply (Vendor)

### 11.2.1 Vendor Recruitment Pipeline

- [ ] Buat landing page pendaftaran vendor: `/register-vendor`
- [ ] Siapkan materi rekrutmen:
  - Brosur digital (Canva/Figma)
  - Video tutorial pendaftaran (< 2 menit)
  - FAQ vendor (khusus)
- [ ] Rekrut 20 vendor anchor (kota pilot):
  - Target: 5 tukang bangunan, 5 teknisi listrik, 3 teknisi AC, 3 plumbing, 2 interior, 2 renovasi
  - Insentif: 0% fee platform untuk 3 bulan pertama
  - Gratis biaya pencairan dana
- [ ] Bantu 20 vendor anchor menyelesaikan KYC:
  - Upload KTP
  - Upload sertifikat (jika ada)
  - Upload portfolio (min 3 foto)
  - Set lokasi dan jam operasional
- [ ] Rekrut gelombang 2: 30 vendor tambahan (Weeks 3-4)
- [ ] Target total beta: 50+ vendor terverifikasi

### 11.2.2 Vendor Tools & Enablement

- [ ] Buat guide cetak: "Cara Mendapatkan Order Pertama"
- [ ] Siapkan channel komunikasi vendor: WhatsApp Group
- [ ] Buat template pesan (chat) untuk vendor
- [ ] Sediakan format foto portfolio yang baik (lighting, angle, resolusi)
- [ ] Buat video tutorial: cara accept order, start, complete
- [ ] Setup reminder: vendor harus online untuk mendapat order

### 11.2.3 Vendor Automation

- [ ] Implementasi: email/SMS notifikasi saat ada order baru
- [ ] Implementasi: auto-offline jika vendor tidak login > 24 jam
- [ ] Implementasi: badge "Respons Cepat" untuk vendor yang balas chat < 5 menit

---

## 11.3 Customer Acquisition

### 11.3.1 Pre-Launch (Weeks 1-2)

- [ ] Buat halaman "Coming Soon" / waitlist landing page:
  - Form email + kota + kebutuhan
  - Notifikasi saat launch
- [ ] Kumpulkan 200+ email dari:
  - Iklan Facebook/Instagram (Rp 500rb budget)
  - Posting di grup Facebook komunitas (perbaikan rumah, Jakarta)
  - Share ke kontak WhatsApp
- [ ] Buat konten sosial media:
  - 3 post per minggu (Instagram/TikTok): tips perbaikan rumah, promo launch
  - Reels/video pendek: demo fitur GEMA

### 11.3.2 Launch Campaign (Weeks 3-4)

- [ ] Kirim email blast ke waitlist: "GEMA Sekarang Tersedia!"
- [ ] Promo launch: "GRATIS Biaya Platform untuk 100 Customer Pertama"
- [ ] Buat referral program:
  - Customer ajak teman → dapat voucher Rp 25.000
  - Vendor ajak customer → fee diturunkan 5% (1 bulan)
- [ ] Pasang iklan Facebook/Instagram Ads (budget: Rp 1-2 juta):
  - Target: usia 25-45, Jakarta, interest: home improvement
  - A/B test 3 kreatif berbeda
- [ ] Cari 5-10 influencer micro (1k-10k followers) untuk review GEMA:
  - Tukar: voucher layanan gratis
  - Konten: unboxing/review pengalaman booking

### 11.3.3 Offline Activation

- [ ] Sebarkan QR code download APK di:
  - Toko material bangunan (kerja sama)
  - Bengkel elektronik/AC
  - Kafe sekitar area pilot
- [ ] Kerja sama dengan 5 RT/RW di area pilot — info ke warga

---

## 11.4 Monitoring & Observability

### 11.4.1 Technical Monitoring

- [ ] Setup Sentry (error tracking):
  - Integrasi dengan Next.js
  - Source maps untuk debugging
  - Alert ke email/Slack untuk error rate > 1%
- [ ] Setup Supabase monitoring:
  - Pantau API usage (jangan sampai limit)
  - Pantau DB CPU, connections, disk usage
  - Setup alert jika connections > 80%
- [ ] Setup uptime monitoring (Better Uptime / Uptime Robot):
  - Monitor: Cloudflare Pages URL
  - Monitor: Supabase project status
  - Monitor: Xendit API availability
- [ ] Setup performance monitoring:
  - Pantau Edge Function execution time
  - Pantau response time: orders, search, chat
  - Pantau error rate per endpoint

### 11.4.2 Business Monitoring

- [ ] Setup dashboard admin untuk metrik real-time:
  - Total vendor terdaftar (vs terverifikasi)
  - Total customer terdaftar
  - Orders per hari
  - Completed orders per hari
  - Revenue (platform fee)
  - Refund ratio
  - Average response time vendor
  - Top categories
  - Geolocation distribution (peta)
- [ ] Setup weekly report otomatis (email):
  - Pertumbuhan vendor
  - Pertumbuhan customer
  - Transaksi
  - Refund dan dispute
  - Fraud alerts

### 11.4.3 Logging

- [ ] Pastikan semua Edge Functions punya `console.log` untuk audit
- [ ] Setup log retention di Supabase (logs disimpan > 30 hari)
- [ ] Buat playbook insiden: apa yang dilakukan jika:
  - Server down
  - Payment error massal
  - Fraud terdeteksi
  - Vendor complaint massal

---

## 11.5 Support & Ops

### 11.5.1 Customer Support

- [ ] Setup channel support:
  - WhatsApp Business (primary)
  - Email: support@gema.co.id
  - In-app: halaman Bantuan + FAQ
- [ ] Buat template balasan untuk isu umum:
  - Pembayaran gagal
  - Vendor tidak datang
  - Cara refund
  - Cara topup wallet
- [ ] Tentukan SLA:
  - Respon pertama: < 1 jam (jam kerja)
  - Resolusi < 24 jam
- [ ] Tentukan jam operasional support: 08:00-20:00
- [ ] Assign minimal 1 admin khusus support

### 11.5.2 Vendor Support

- [ ] Buat channel khusus vendor: WhatsApp Group
- [ ] Buat guide step-by-step untuk:
  - Menerima order
  - Memulai pekerjaan
  - Menyelesaikan order
  - Cairkan dana
- [ ] Tentukan SLA vendor:
  - Konfirmasi order: < 30 menit
  - Sampai lokasi: tepat waktu sesuai jadwal
  - Selesaikan pekerjaan: sesuai estimasi

### 11.5.3 Escalation Matrix

| Level | Siapa | Contoh Isu | Response Time |
|-------|-------|-----------|---------------|
| L1 | Admin Support | Login gagal, cara pakai | < 1 jam |
| L2 | Admin Operasional | Dispute order, refund | < 4 jam |
| L3 | Founder/CTO | Payment outage, data breach | < 30 menit |
| L4 | Xendit Support | Invoice gagal, disbursement error | < 24 jam |

---

## 11.6 Pilot City Execution

### 11.6.1 City Selection Criteria

- Populasi > 500,000
- Jumlah vendor potensial > 50 (untuk tiap kategori)
- Biaya akuisisi customer rendah (komunitas aktif)
- Akses mudah untuk tim support (jika perlu visit)

### 11.6.2 Recommended Cities (Priority Order)

| Rank | City | Alasan | Target Vendor | Target Customer |
|------|------|--------|---------------|-----------------|
| 1 | Jakarta Selatan | Populasi padat, banyak vendor, komunitas aktif | 30 | 500 |
| 2 | Tangerang Selatan | Pertumbuhan properti tinggi | 20 | 300 |
| 3 | Bekasi | Banyak perumahan baru, kebutuhan renovasi tinggi | 15 | 200 |
| 4 | Surabaya | Kota besar kedua, vendor melimpah | 15 | 200 |

### 11.6.3 Launch Timeline per City

| Week | City | Action |
|------|------|--------|
| 1-2 | Jakarta Selatan | Vendor onboarding + customer acquisition |
| 3-4 | Jakarta Selatan | Launch + monitoring |
| 5-6 | Tangerang Selatan | Vendor onboarding |
| 7-8 | Tangerang Selatan | Launch + monitoring |
| 9-10 | Bekasi / Surabaya | Ekspansi |

---

## 11.7 Iteration & Feedback

### 11.7.1 Feedback Collection

- [ ] Survey NPS (Net Promoter Score) ke customer — 2 minggu setelah launch
- [ ] Survey kepuasan vendor — bulanan
- [ ] Interview mendalam dengan 10 customer + 10 vendor — bulan 2
- [ ] Analisa pola refund & dispute
- [ ] Analisa drop-off di flow booking (di halaman mana customer pergi?)
- [ ] Analisa performa search: apakah customer menemukan vendor?

### 11.7.2 Rapid Iteration Cycle

- [ ] Sprint pertama (2 minggu): fix critical bugs dari laporan user
- [ ] Sprint kedua (2 minggu): improvement berdasarkan feedback
- [ ] Evaluasi bulan 1: lanjut atau pivot?
  - Jika transaksi < 50/bulan → evaluasi ulang strategi
  - Jika refund > 10% → investigasi kualitas vendor
  - Jika fraud > 5 alerts → tightening keamanan

### 11.7.3 Success Criteria Beta

| Metrik | Target | Minimum (No-Go) |
|--------|--------|-----------------|
| Transaksi/bulan | 200 | < 50 |
| Vendor terverifikasi | 50 | < 20 |
| Customer terdaftar | 500 | < 100 |
| Completion rate | > 80% | < 60% |
| Refund ratio | < 5% | > 10% |
| Repeat order rate | > 25% | < 10% |
| App crash rate | < 1% | > 5% |
| Response time vendor | < 30 menit | > 2 jam |
| Customer NPS | > 40 | < 0 |

---

## 11.8 Risk Mitigation

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Vendor tidak aktif (ghost) | Customer kecewa | Auto-offline setelah 24 jam idle. Notifikasi ke vendor tiap order. |
| Fraud transaction | Kerugian finansial | Algorithmic fraud detection + manual review by admin. Frozen wallet jika suspicious. |
| Payment error massal | Trust hilang | Rollback ke fallback payment. Manual refund via admin panel. |
| Server down saat peak | Semua transaksi stop | Cloudflare CDN untuk static assets. Supabase auto-scale. Downtime SLA: < 1 jam. |
| Customer gagal install APK | Churn tinggi | Landing page dengan panduan install step-by-step. Video tutorial. |
| Complaint massal | Reputasi buruk | Respon < 1 jam. Kompensasi voucher. Transparan di media sosial. |

---

## 11.9 Go/No-Go Decision

Sebelum pindah ke **Phase 12 (Scale Phase)**, semua kondisi ini harus terpenuhi:

- [ ] Minimal 50 vendor terverifikasi dan aktif
- [ ] Minimal 500 customer terdaftar
- [ ] Minimal 200 transaksi completed dalam sebulan
- [ ] Completion rate > 80%
- [ ] Refund ratio < 5%
- [ ] Tidak ada open critical/high bugs
- [ ] App tidak crash di 3 device Android berbeda
- [ ] Revenue model ter-validasi (dual fee berjalan)
- [ ] Feedback customer positif (NPS > 40)
- [ ] Playbook insiden sudah teruji
- [ ] Tim support siap handle scale

---

## 11.10 Timeline Summary

```
Week  1-2:  Production env setup + Vendor anchor recruitment
             (20 vendor, KYC, portfolio)
             Waitlist landing page + social media content

Week  3-4:  Launch campaign (Jaksel)
             Customer acquisition (ads, influencer)
             Monitoring setup (Sentry, dashboard)

Week  5-6:  Evaluate week 1-4 metrics
             Tangerang Selatan onboarding
             Quick iteration based on feedback

Week  7-8:  Tangerang Selatan launch
             Bekasi onboarding
             NPS survey + interview

Week  9-10: Bekasi launch
             Surabaya onboarding
             Evaluate Go/No-Go to Phase 12

Week 11-12: Surabaya launch
             Final evaluation
             Documentation for scale
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-05-27
