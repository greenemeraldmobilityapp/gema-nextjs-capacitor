# Supabase Pricing & Growth Projection — GEMA

> Last updated: 2026-05-27
> Sumber: https://supabase.com/pricing

---

## 1. Ringkasan Tiers

| Tier | Harga | Target Penggunaan |
|------|-------|-------------------|
| **Free** | $0/bln | Hobby, MVP, beta awal |
| **Pro** | $25/bln | Production, early growth |
| **Team** | $599/bln | Team, SOC2, compliance |
| **Enterprise** | Custom | Large scale, dedicated infra |

---

## 2. Perbandingan Detail

### 2.1 Free — $0/bln

| Resource | Limit |
|----------|-------|
| Database size | 500 MB (shared CPU, 500 MB RAM) |
| Auth MAU | 50,000/bln |
| File storage | 1 GB |
| DB egress | 5 GB/bln |
| Cached egress | 5 GB/bln |
| Edge Functions | 500,000 calls/bln |
| Realtime concurrent | 200 peak |
| Realtime messages | 2 juta/bln |
| Log retention | 1 hari |
| Max file upload | 50 MB |
| Backup | ❌ Tidak ada |
| Pause otomatis | ✅ Setelah 1 minggu idle |
| Support | Community only |
| CDN | Basic CDN |
| Project aktif | Maks 2 |
| Auth: SSO, leaked password, session timeout | ❌ |
| Auth: Audit logs | 1 jam |
| Image transformations | ❌ |

### 2.2 Pro — $25/bln (+ $10 compute credit)

| Resource | Included | Overage Pricing |
|----------|----------|-----------------|
| Database size | 8 GB | $0.125/GB |
| DB egress | 250 GB/bln | $0.09/GB |
| Cached egress | 250 GB/bln | $0.03/GB |
| Auth MAU | 100,000/bln | $0.00325/MAU ($3.25/1,000) |
| File storage | 100 GB | $0.021/GB |
| Edge Functions | 2 juta/bln | $2/juta |
| Realtime concurrent | 500 peak | $10/1,000 |
| Realtime messages | 5 juta/bln | $2.50/juta |
| Log retention | 7 hari | — |
| Backup | Daily, 7 hari | — |
| Max file upload | 500 GB | — |
| Pause otomatis | ❌ Tidak pernah | — |
| Support | Email | — |
| CDN | Smart CDN | — |
| Spending cap | ✅ ON by default | — |
| Custom domain | $10/domain/bln | — |
| Point-in-Time Recovery | $100/bln (7 hari) | — |
| Database branching | $0.01344/branch/jam | — |
| Advanced MFA (Phone) | $75/project pertama, $10/additional | — |
| Image transformations | 100 origin images, $5/1,000 setelahnya | — |
| Auth: Leaked password protection | ✅ | — |
| Auth: Single session per user | ✅ | — |
| Auth: Session timeouts | ✅ | — |
| Remove Supabase branding from emails | ✅ | — |

### 2.3 Team — $599/bln

| Fitur | Detail |
|-------|--------|
| **Semua fitur Pro** | ✅ |
| SOC 2 | ✅ Included |
| HIPAA | Available as paid add-on |
| SSO for Dashboard | ✅ |
| Backup retention | 14 hari |
| Log retention | 28 hari |
| Priority email support + SLA | ✅ |
| Auth Audit Logs | 28 hari |
| Access roles | Read-only, project-scoped |
| Log Drain | $60/drain/bln + $0.20/juta events + $0.09/GB |
| Platform Audit Logs | ✅ |
| Metrics endpoint | ✅ |
| Security Questionnaire Help | ✅ |

### 2.4 Enterprise — Custom

- Designated Support Manager
- 24/7/365 premium support
- Uptime SLAs
- BYO Cloud
- Private Slack channel
- Custom Security Questionnaires
- Custom compute & storage

---

## 3. Compute Add-ons (Pro & Team)

Setiap project di plan berbayar dapat memilih compute size. Harga sudah termasuk $10 credit dari plan.

| Size | CPU | RAM | Direct Conn | Pooler Conn | Harga/bln | Net (after $10 credit) |
|------|-----|-----|-------------|-------------|-----------|----------------------|
| **Micro** | 2-core ARM | 1 GB | 60 | 200 | $10 | **$0** ✅ |
| Small | 2-core ARM | 2 GB | 90 | 400 | $15 | $5 |
| Medium | 2-core ARM | 4 GB | 120 | 600 | $60 | $50 |
| Large | 2-core ARM | 8 GB | 160 | 800 | $110 | $100 |
| XL | 4-core ARM | 16 GB | 240 | 1,000 | $210 | $200 |
| 2XL | 8-core ARM | 32 GB | 380 | 1,500 | $410 | $400 |
| 4XL | 16-core ARM | 64 GB | 480 | 3,000 | $960 | $950 |
| 8XL | 32-core ARM | 128 GB | 490 | 6,000 | $1,870 | $1,860 |
| 12XL | 48-core ARM | 192 GB | 500 | 9,000 | $2,800 | $2,790 |
| 16XL | 64-core ARM | 256 GB | 500 | 12,000 | $3,730 | $3,720 |

### Rekomendasi Compute untuk GEMA

| Growth Stage | Compute Size | RAM | Direct Conn | Alasan |
|-------------|-------------|-----|-------------|--------|
| Phase 11 (Beta) | Micro (default) | 1 GB | 60 | Cukup untuk 500 user concurrent |
| Phase 12 (Month 4-8) | Medium | 4 GB | 120 | 1,000+ transaksi/bulan |
| Phase 12 (Month 9+) | Large | 8 GB | 160 | 5,000+ transaksi/bulan, dedicated CPU |

---

## 4. Disk Configuration

| Type | Max Size | Harga | IOPS | Throughput | Durability |
|------|----------|-------|------|------------|------------|
| **General Purpose** | 16 TB | $0.125/GB (8 GB included) | 3,000 included, $0.024/additional | 125 MB/s included, $0.095/additional | 99.9% |
| **High Performance** | 60 TB | $0.195/GB | $0.119/IOPS | Auto-scale with IOPS | 99.999% |

---

## 5. Growth Projection — Month 1-12

### Asumsi Dasar

- **Phase 11 (Beta)** dimulai Month 1 — basecamp: **Jepara, Jawa Tengah**
- **Phase 12 (Scale)** dimulai Month 4 (setelah Go/No-Go) — ekspansi ke kota-kota Jateng + Jatim
- **Revenue model:** Dual fee — Customer +5%, Vendor -10%
- **Average order value:** Rp 250,000
- **Vendor payout per order:** ~Rp 225,000 (setelah fee 10%)
- **Platform revenue per order:** Rp 12,500 (cust 5%) + Rp 25,000 (vend 10%) = Rp 37,500

### User Target per Bulan

| Month | Phase | Plan Supabase | Est. Cost | Customer | Vendor | Transaksi/bln | Platform Revenue |
|-------|-------|--------------|-----------|----------|--------|---------------|------------------|
| 1 | Beta Launch | Free ($0) | $0 | 100 | 20 | 25 | Rp 937,500 |
| 2 | Beta Launch | Free ($0) | $0 | 250 | 35 | 75 | Rp 2,812,500 |
| 3 | Beta Launch | Free ($0) | $0 | 500 | 50 | 150 | Rp 5,625,000 |
| — | **Go/No-Go** | — | — | **500** | **50** | **200** | **Rp 7,500,000** |
| 4 | Scale | Pro ($25) | $25 | 1,000 | 100 | 300 | Rp 11,250,000 |
| 5 | Scale | Pro ($25) | $25 | 1,500 | 150 | 400 | Rp 15,000,000 |
| 6 | Scale | Pro + Medium ($75) | $75 | 2,500 | 250 | 600 | Rp 22,500,000 |
| 7 | Scale | Pro + Medium ($75) | $75 | 3,500 | 350 | 750 | Rp 28,125,000 |
| 8 | Scale | Pro + Large ($125) | $125 | 4,500 | 450 | 900 | Rp 33,750,000 |
| 9 | Scale | Pro + Large ($125) | $125 | 5,000 | 500 | 1,000 | Rp 37,500,000 |
| 10 | Scale | Pro + XL ($225) | $225 | 6,000 | 600 | 1,200 | Rp 45,000,000 |
| 11 | Scale | Pro + XL ($225) | $225 | 8,000 | 750 | 1,500 | Rp 56,250,000 |
| 12 | Scale | Pro + XL ($225) | $225 | 10,000 | 1,000 | 2,000 | Rp 75,000,000 |

### Detail Growth Milestone

| Month | Milestone |
|-------|-----------|
| 1 | ⚡ **Launch Kota Jepara** (basecamp). Target: 20 vendor anchor + 100 customer. Validasi flow dasar. |
| 2 | 📈 **Ekspansi Kudus + Demak.** Target: 35 vendor + 250 customer. Iterasi feedback beta. |
| 3 | 🎯 **Ekspansi Pati + Rembang.** Evaluasi Go/No-Go. Syarat: 50 vendor, 500 customer, 200 transaksi, refund < 5%, NPS > 40. |
| 4 | 🚀 **Pindah ke Pro plan.** Ekspansi kategori baru (cleaning, garden). Ekspansi ke Semarang. Target: 100 vendor. |
| 5 | 🏙️ **Ekspansi Kendal + Salatiga.** Target: 150 vendor, 1,500 customer. |
| 6 | 🚚 **Courier vertical launch.** Ekspansi ke Surabaya. Target: 250 vendor, 2,500 customer. **Upgrade compute ke Medium.** |
| 7 | 🛡️ Insurance & protection feature. Ekspansi ke Purwokerto + Yogyakarta. Target: 350 vendor, 3,500 customer. |
| 8 | 🤖 AI recommendations. Ekspansi ke Solo +Magelang. Target: 450 vendor, 4,500 customer. **Upgrade compute ke Large.** |
| 9 | 🎯 **PRD KPI tercapai:** 500 vendor, 5,000 customer, 1,000 transaksi/bulan. Revenue: Rp 37.5 juta. |
| 10 | 💳 Multiple payment methods (QRIS, e-wallet). Ekspansi ke Jakarta + Bandung. Target: 600 vendor, 6,000 customer. |
| 11 | 📦 Remote freelance IT vertical. Ekspansi ke kota besar lain. Target: 750 vendor, 8,000 customer. **Upgrade compute ke XL.** |
| 12 | 🏆 1,000 vendor, 10,000 customer, 2,000 transaksi/bulan. Revenue: Rp 75 juta. Evaluasi Team plan. |

### Visual Summary

```
Month:     1     2     3     4     5     6     7     8     9     10    11    12
Plan:    Free  Free  Free  Pro   Pro   Pro   Pro   Pro   Pro   Pro   Pro   Pro
Compute: Micro Micro Micro Micro Micro Med.  Med.  Large Large Large XL    XL
Cost:    $0    $0    $0    $25   $25   $75   $75   $125  $125  $125  $225  $225
         ───── Phase 11 (Beta) ───── ───────────── Phase 12 (Scale) ─────────────
Cust:    100   250   500   1K    1.5K  2.5K  3.5K  4.5K  5K    6K    8K    10K
Vend:    20    35    50    100   150   250   350   450   500   600   750   1K
Tx/bln:  25    75    150   300   400   600   750   900   1K    1.2K  1.5K  2K
Rev:    0.9M  2.8M  5.6M  11M   15M   22M   28M   33M   37M   45M   56M   75M
         (dalam Rupiah)
```

---

## 6. Marketing & Advertising Strategy

### 6.1 Strategi Beta — Kota Jepara (Month 1-3)

#### 6.1.1 Profil Kota Jepara

| Aspek | Detail |
|-------|--------|
| Populasi Kab. Jepara | ~1,2 juta jiwa |
| Julukan | Kota Ukir — pusat meubel & pengrajin kayu |
| Ekonomi utama | Meubel, ukir kayu, perikanan, pariwisata (Karimunjawa, Bandengan) |
| Potensi vendor | Tukang kayu/meubel, teknisi listrik, tukang bangunan, plumbing, interior |
| Karakter masyarakat | Komunitas erat, word-of-mouth kuat, high smartphone penetration |
| Media lokal | Radio (LPPL Kartini FM, SAS FM), koran: Radar Kudus, Suara Merdeka |

#### 6.1.2 On-the-Ground Recruitment (Offline — Prioritas #1)

**Minggu 1 — Vendor Anchor (20 vendor)**

- [ ] **Visit langsung** ke sentra industri/komunitas:
  - Pasar Jepara (Pasar Ragil, Pasar Welahan)
  - Sentra meubel: Tahunan, Kecamatan Mlonggo
  - Kawasan perumahan baru (manyar, pecangaan) untuk tukang bangunan
  - Bengkel elektronik/AC di Jl. Pemuda, Jl. Raya Kudus
- [ ] **Kerja sama dengan toko material bangunan:**
  - CV. Sinar Abadi, Toko Bangunan Bintang, UD. Barokah
  - Minta rekomendasi vendor langganan mereka
- [ ] **Datangi paguyuban/komunitas:**
  - Paguyuban Tukang Bangunan Jepara
  - Komunitas Pengrajin Meubel
  - Koperasi Serba Usaha (KSU) daerah

**Minggu 2 — Aktivasi Vendor**

- [ ] Install APK langsung ke HP vendor
- [ ] Bantu upload KTP + sertifikat
- [ ] Ambil foto portfolio sendiri agar kualitas bagus
- [ ] Ajari cara menerima order dan chat
- [ ] **Insentif:** Gratis 0% platform fee 3 bulan pertama

#### 6.1.3 Word-of-Mouth & Komunitas (Offline — Prioritas #2)

| Taktik | Detail | Biaya |
|--------|--------|-------|
| **WhatsApp Group** | Sebar info ke grup warga RT/RW, grup arisan, grup ibu-ibu PKK Jepara | Rp 0 |
| **Stiker QR** | Tempel stiker QR download APK di warung, toko material, bengkel, kafe | Rp 200 rb |
| **Brosur A5** | Sebar di perumahan, pasar, sekolah — "Butuh Tukang? Aplikasi aja!" | Rp 300 rb |
| **Sosialisasi RT/RW** | Minta izin ketua RT untuk sosialisasi 5 menit di acara warga | Rp 0 |
| **Testimoni video** | Rekam 3 vendor pertama yang dapat order, edit pendek (< 60 detik), sebar di WA | Rp 0 |
| **Doorprize** | 5 orang pertama booking dapat voucher Rp 50.000 | Rp 250 rb |

#### 6.1.4 Digital Marketing — Jepara (Online)

**Channel Utama: Facebook + Instagram**

| Format | Budget/hari | Target | Isi |
|--------|-------------|--------|-----|
| Carousel post | Rp 50 rb | Ibu rumah tangga 25-50 | "3 Tukang Bangunan Terverifikasi di Jepara" |
| Video pendek | Rp 75 rb | Pria 25-55 | Demo: booking lewat HP, 30 detik |
| Story ads | Rp 25 rb | 18-45 | Promo: "GRATIS biaya platform untuk 100 customer pertama" |
| Broadcast WhatsApp | Rp 0 | Semua kontak | Share link download, minta forward ke grup |

**Geotargeting:** Radius 15 km dari pusat Jepara / -6.590, 110.671 (Alun-alun Jepara)
**Interest targeting:** Home improvement, properti, renovasi rumah, meubel, interior design, bangunan

#### 6.1.5 Konten Lokal (Organik)

Buat akun Instagram/TikTok: **@gema_jepara**

| Post ke- | Tema | Format |
|----------|------|--------|
| 1 | "GEMA hadir di Jepara! 🎉" — carousel fitur | Carousel |
| 2 | Tips: "Cara pilih tukang bangunan terpercaya" | Carousel |
| 3 | Testimoni vendor: "Pak Sastro, tukang AC, dapat order pertama" | Video 30 detik |
| 4 | Tips: "Biaya renovasi rumah per meter di Jepara 2026" | Carousel |
| 5 | Behind the scene: "Cara kami verifikasi vendor" | Video 60 detik |
| 6 | Promo: "GRATIS biaya platform — limited!" | Carousel |
| 7 | Testimoni customer: "Puasa service AC, cepat & murah" | Video 30 detik |
| 8 | Vendor spotlight: "Mengenal pengrajin meubel Jepara" | Carousel |

**Frekuensi:** 4-5 post/minggu. **Hashtag:** #GEMAJepara #TukangJepara #JasaJepara #RenovasiJepara

---

### 6.2 Ekspansi Kota Jateng (Month 2-5)

#### 6.2.1 Expansion Map

```
                    ┌──────────┐
                    │  JEPARA  │ ◄── Basecamp (Month 1)
                    │ (1,2 jt) │
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  KUDUS   │  │  DEMAK   │  │   PATI   │ ◄── Month 2
    │ (850 rb) │  │(1,2 jt)  │  │ (1,3 jt) │
    └──────────┘  └──────────┘  └──────────┘
          │
    ┌─────┴──────┐
    ▼            ▼
┌─────────┐ ┌─────────┐
│SEMARANG │ │KENDAL   │ ◄── Month 4
│(1,7 jt) │ │(1 jt)   │
└─────────┘ └─────────┘
    │
    ▼
┌─────────┐ ┌─────────┐
│ SALATIGA│ │ PURWOK  │ ◄── Month 5
│ (200 rb)│ │ (1 jt)  │
└─────────┘ └─────────┘
```

#### 6.2.2 Strategi per Kota

| Kota | Keunggulan | Strategi Rekrutmen |
|------|-----------|-------------------|
| **Kudus** | Kota industri, banyak pabrik, perumahan padat | Kerja sama dengan koperasi karyawan, rokok, perumahan baru |
| **Demak** | Pertanian + perumahan, banyak tukang bangunan | Visit gapura desa, kerja sama dengan kepala desa |
| **Pati** | Kota besar ketiga Jateng, banyak UMKM | Datangi sentra industri kecil, pasar tradisional |
| **Semarang** | Ibu kota provinsi, pasar terbesar | Digital ads utama, influencer lokal, partnership properti |
| **Kendal** | Kawasan industri, perumahan baru (Kendal Industrial Park) | Kerja sama dengan developer perumahan |
| **Salatiga** | Kota kecil, komunitas erat | Word-of-mouth + kampus untuk freelance IT |
| **Purwokerto** | Pusat Jateng selatan | Basecamp untuk wilayah barat |

**Taktik rekrutmen di tiap kota baru:**
1. ✅ Cari 10 vendor anchor via komunitas lokal (5 tukang + 5 teknisi)
2. ✅ Bantu KYC & portfolio langsung — jangan lepas tangan
3. ✅ Foto portfolio sendiri — hasil bagus, vendor senang
4. ✅ Buat 1-2 konten testimoni vendor baru
5. ✅ Jalankan Facebook Ads geotargeting per kota (budget Rp 50 rb/hari/kota)
6. ✅ Join 3-5 grup Facebook/WhatsApp lokal besar per kota

---

### 6.3 Digital Ads Strategy — Scale (Month 4-12)

#### 6.3.1 Multi-Platform Budget Allocation

| Platform | % Budget | Tujuan | Format Terbaik |
|----------|----------|--------|----------------|
| **Facebook Ads** | 40% | Customer acquisition usia 25-50 | Carousel + Lead Form |
| **Instagram Ads** | 25% | Brand awareness 18-35 | Reels + Story |
| **Google Search Ads** | 20% | High-intent (cari tukang) | Search + Call-only |
| **TikTok Ads** | 10% | Viral potential, demo fitur | Organic + Spark Ads |
| **YouTube Ads** | 5% | Trust building | In-stream testimoni |

#### 6.3.2 Facebook/Instagram Ads Detail

**Target Audience:**

| Parameter | Customer | Vendor |
|-----------|----------|--------|
| Usia | 25-50 | 25-55 |
| Gender | 60% Wanita, 40% Pria | 90% Pria |
| Minat | Home improvement, properti, Ibu rumah tangga | Bangunan, konstruksi, meubel, wiraswasta |
| Perilaku | Pemilik rumah (> 2 tahun), baru renovasi | Smartphone aktif, UKM |
| Geotarget | Radius 20 km tiap kota | Radius 30 km tiap kota |

**Ad Creative Strategy:**

| Tipe | Headline | Isi | CTA |
|------|----------|-----|-----|
| Problem-aware | "Renovasi rumah tapi bingung cari tukang?" | Carousel: masalah → solusi → GEMA | "Download Sekarang" |
| Solution-aware | "Tukang bangunan terverifikasi siap datang ke rumah" | Video 15 detik: booking flow cepat | "Coba Gratis" |
| Promo | "GRATIS biaya platform untuk 100 customer pertama" | Carousel: promo + benefit | "Klaim Promo" |
| Vendor | "Mau dapet order tanpa cari-cari pelanggan?" | Video testimoni vendor sukses | "Daftar Jadi Mitra" |
| Social proof | "Sudah 500+ customer puas pakai GEMA" | Carousel review + rating | "Lihat Testimoni" |

**Budget Scale:**

| Month | Budget/hari | Budget/bln | Platform Mix |
|-------|-------------|------------|--------------|
| 1-3 (Beta) | Rp 100 rb | Rp 3 jt | FB + IG only |
| 4-6 | Rp 200 rb | Rp 6 jt | FB + IG + Google |
| 7-9 | Rp 400 rb | Rp 12 jt | FB + IG + Google + TikTok |
| 10-12 | Rp 700 rb | Rp 21 jt | All platforms |

#### 6.3.3 Google Ads Strategy

**Search Keywords (High Intent):**

| Keyword | Match Type | Avg CPC |
|---------|-----------|---------|
| tukang bangunan terdekat | Phrase | Rp 2.000-4.000 |
| service AC panggilan | Exact | Rp 3.000-5.000 |
| tukang plumbing darurat | Phrase | Rp 4.000-6.000 |
| renovasi rumah murah | Phrase | Rp 3.000-5.000 |
| interior consultant murah | Broad | Rp 2.000-3.000 |
| jasa perbaikan listrik rumah | Phrase | Rp 3.000-5.000 |
| [nama kota] + [jasa] | Phrase | Rp 1.500-3.000 |

**Ad Extensions:**
- Call button: "Hubungi Langsung"
- Location: alamat kantor (jika sudah ada)
- Sitelink: "Cara Kerja", "Biaya", "Testimoni"

**Budget:** Rp 50-100 rb/hari mulai Month 4

---

### 6.4 Content Marketing (Organik)

#### 6.4.1 Blog & SEO

Buat artikel di website GEMA (subdomain blog.gema.co.id atau halaman `/blog`):

| Bulan | Artikel | Keyword Target |
|-------|---------|----------------|
| 1 | "Cara Memilih Tukang Bangunan Terpercaya di Jepara" | tukang bangunan Jepara |
| 1 | "Biaya Service AC Rumah 2026" | service AC, biaya AC |
| 2 | "Tips Renovasi Rumah Minimalis Budget 50 Juta" | renovasi rumah murah |
| 2 | "Daftar Harga Tukang Bangunan per Meter 2026" | harga tukang bangunan |
| 3 | "Apa Itu Escrow? Cara Aman Bayar Jasa" | pembayaran escrow aman |
| 3 | "Perbedaan Tukang Harian vs Borongan" | tukang harian vs borongan |
| 4+ | Artikel musiman: "Persiapan Rumah Sambut Lebaran" | — |

**Distribusi:** Share tiap artikel ke grup WA, Facebook, Instagram story, newsletter email

#### 6.4.2 YouTube (Long-form)

| Video | Durasi | Frekuensi |
|-------|--------|-----------|
| Testimoni vendor & customer | 2-5 menit | 2x/bulan |
| Tutorial cara booking | 1-2 menit | 1x/bulan |
| Edukasi (biaya renovasi, tips) | 5-10 menit | 1x/bulan |
| Behind the scene verifikasi vendor | 3-5 menit | 1x/bulan |

---

### 6.5 Partnership & PR

#### 6.5.1 Partnership Potensial

| Mitra | Bentuk Kerja Sama | Benefit |
|-------|-------------------|---------|
| **Toko material bangunan** | Rekomendasi vendor + pasang stiker | Akses ke vendor potensial |
| **Developer perumahan** | Bundle jasa renovasi untuk rumah baru | 100+ customer potensial |
| **Bank/Koperasi** | Promo cicilan untuk jasa GEMA | Customer value lebih tinggi |
| **Komunitas pengrajin** | Platform digital untuk UKM meubel | 50+ vendor meubel |
| **Pemerintah desa/kelurahan** | Sosialisasi di musrembang/rapat warga | Trust + coverage |
| **Radio lokal** (Kartini FM, SAS FM) | Iklan spot 30 detik, talkshow | Jangkauan luas usia 35+ |
| **Kampus** (UNISNU, UMK Jepara) | Magang/freelance IT via GEMA | Vendor potensial anak muda |

#### 6.5.2 Biaya Partnership

| Aktivitas | Biaya (one-time/bln) |
|-----------|---------------------|
| Radio spot 30 detik (10x/bln) | Rp 500 rb - 1 jt |
| Spanduk di toko material (10 titik) | Rp 500 rb |
| Stiker + brosur (batch 1,000) | Rp 300 rb |
| Kopi darat komunitas (snack) | Rp 200 rb/event |
| Kalender branded untuk vendor | Rp 500 rb |

---

### 6.6 Viral & Growth Hacking

| Taktik | Biaya | Potensi Viral |
|--------|-------|---------------|
| **Referral program:** "Ajak teman, dapat Rp 25.000" | Rp 25 rb/orang | ⭐⭐⭐⭐⭐ |
| **First-order free:** Gratis biaya platform untuk 100 customer pertama | Rp 3,7 jt (100 x Rp 37.500) | ⭐⭐⭐⭐ |
| **Challenge TikTok:** #GEMAJepara — review jasa via GEMA | Rp 0 (organik) | ⭐⭐⭐⭐⭐ |
| **Vendor of the month:** Profile vendor dengan rating terbaik | Rp 0 | ⭐⭐⭐ |
| **Giveaway:** "Booking lewat GEMA, menang TV 32 inch" | Rp 3 jt | ⭐⭐⭐⭐⭐ |
| **Lomba foto:** "Hasil Renovasi Terbaik via GEMA" | Rp 1 jt (voucher) | ⭐⭐⭐⭐ |

---

### 6.7 Retensi & Repeat Order

Setelah customer pertama kali booking, targetkan repeat order:

| Taktik | Trigger | Biaya |
|--------|---------|-------|
| **Push notification:** "Vendor terdekat sedang online" | 7 hari setelah order selesai | Rp 0 |
| **Diskon 10%** untuk booking kedua | Setelah order selesai | Rp 0 (kurang fee) |
| **Email/SMS:** "Ada promo tukang AC, cek sekarang!" | 30 hari setelah order selesai | Rp 50 rb/bln |
| **Birthday voucher** Rp 50.000 | Tanggal lahir customer | Rp 50 rb/user |
| **Vendor loyalty:** fee discount jika rating > 4.8 | Bulanan | Rp 0 (relakan fee) |

---

### 6.8 Marketing Budget Summary

| Bulan | Phase | Digital Ads | Offline | Partnership | Total |
|-------|-------|-------------|---------|-------------|-------|
| 1 | Beta | Rp 3 jt | Rp 1 jt | Rp 500 rb | Rp 4,5 jt |
| 2 | Beta | Rp 3 jt | Rp 500 rb | Rp 500 rb | Rp 4 jt |
| 3 | Beta | Rp 3 jt | Rp 500 rb | Rp 0 | Rp 3,5 jt |
| 4 | Scale | Rp 6 jt | Rp 1 jt | Rp 1 jt | Rp 8 jt |
| 5 | Scale | Rp 6 jt | Rp 1 jt | Rp 1 jt | Rp 8 jt |
| 6 | Scale | Rp 6 jt | Rp 1 jt | Rp 1 jt | Rp 8 jt |
| 7 | Scale | Rp 12 jt | Rp 2 jt | Rp 2 jt | Rp 16 jt |
| 8 | Scale | Rp 12 jt | Rp 2 jt | Rp 2 jt | Rp 16 jt |
| 9 | Scale | Rp 12 jt | Rp 2 jt | Rp 2 jt | Rp 16 jt |
| 10 | Scale | Rp 21 jt | Rp 3 jt | Rp 3 jt | Rp 27 jt |
| 11 | Scale | Rp 21 jt | Rp 3 jt | Rp 3 jt | Rp 27 jt |
| 12 | Scale | Rp 21 jt | Rp 3 jt | Rp 3 jt | Rp 27 jt |

### 6.9 KPI Marketing

| Metrik | Target |
|--------|--------|
| CAC Customer (Month 1-3) | < Rp 10,000 |
| CAC Customer (Month 4-12) | < Rp 15,000 |
| CAC Vendor | < Rp 50,000 |
| Cost per lead (FB/IG) | < Rp 2,000 |
| Cost per click (Google) | < Rp 3,000 |
| Organic registrations | > 30% dari total |
| Repeat order rate | > 25% |
| Referral registrations | > 15% dari total |
| App download-to-register rate | > 60% |

---

## 7. Kapan Upgrade Plan?

### Free → Pro ($25/bln)
**Trigger:**
- [ ] Database > 400 MB (dari limit 500 MB)
- [ ] Butuh backup harian (data sudah bernilai)
- [ ] Butuh email support
- [ ] Tidak mau ada risiko project pause
- [ ] Transaksi > 200/bulan
- **Estimasi:** Month 3-4

### Pro Micro → Pro Medium ($25 + $50 = $75/bln)
**Trigger:**
- [ ] CPU usage > 80% sustained
- [ ] Memory > 80% sustained
- [ ] Connection pool > 150 concurrent
- [ ] Edge Function cold start mulai terasa
- **Estimasi:** Month 5-6

### Pro Medium → Pro Large ($25 + $100 = $125/bln)
**Trigger:**
- [ ] 1,000+ transaksi/bulan
- [ ] DB queries mulai slow (> 100ms)
- [ ] Auth MAU > 50,000/bln
- **Estimasi:** Month 8-9

### Pro → Team ($599/bln)
**Trigger:**
- [ ] Butuh SOC 2 compliance
- [ ] Butuh HIPAA
- [ ] Butuh SSO dashboard
- [ ] Butuh 28 hari log retention
- [ ] Revenue > $5,000/bln (Rp 80 juta)
- **Estimasi:** Month 12+ (jika diperlukan)

---

## 8. Cost Optimization Tips

1. **Gunakan spending cap** — ON by default, jangan matikan tanpa sadar
2. **Pantau bandwidth** — Egress 250 GB Pro cukup untuk ~50,000 page load/bulan
3. **Cached egress lebih murah** — $0.03/GB vs $0.09/GB. Optimasi CDN caching
4. **Compress gambar** sebelum upload ke Storage — hemat storage & bandwidth
5. **Batch Edge Function calls** — 2 juta calls/bln cukup untuk ~66,000 calls/hari
6. **Hapus data test** — jangan biarkan data sampah memenuhi DB 500 MB
7. **Satu project untuk dev & prod** — Free tier hanya 2 project aktif

---

**Document Version**: 1.0.0
**Last Updated**: 2026-05-27
