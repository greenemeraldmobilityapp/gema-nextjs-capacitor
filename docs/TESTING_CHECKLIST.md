# GEMA Testing Checklist

> Status: ✅ = Lolos | ❌ = Gagal | ☐ = Belum di-test

---

## A. Build & Compile

- [x] `npm run build` — 34 halaman compiled & exported tanpa error (+review, +promo, +map, +realtime)

## B. Auth Flow — Register

### B.1. Register Customer
| Test | Status |
|------|--------|
| Register dengan email baru sebagai Customer | ✅ |
| Redirect ke `/customer/home` setelah sukses | ✅ |
| Error: email sudah terdaftar | ✅ |
| Error: field kosong (required validation) | ✅ |

### B.2. Register Vendor
| Test | Status |
|------|--------|
| Register dengan email baru sebagai Vendor | ✅ |
| Redirect ke `/vendor/dashboard` setelah sukses | ✅ |

## C. Auth Flow — Login

| Test | Status |
|------|--------|
| Login email/password sebagai Customer | ✅ |
| Redirect ke `/customer/home` | ✅ |
| Login email/password sebagai Vendor | ✅ |
| Redirect ke `/vendor/dashboard` | ✅ |
| Error: password salah | ✅ |
| Error: email tidak terdaftar | ✅ |
| Lupa Sandi (link `/forgot-password`) | ☐ |
| **Login Google** | ✅ |

## D. Login Google — Prasyarat

Setup sudah selesai. Lihat [`SUPABASE_GOOGLE_SETUP.md`](./SUPABASE_GOOGLE_SETUP.md) untuk panduan lengkap.

## E. AuthGuard — Route Protection

| Test | Status |
|------|--------|
| Akses `/customer/home` tanpa login → redirect ke `/login` | ✅ |
| Akses `/vendor/dashboard` tanpa login → redirect ke `/login` | ✅ |
| Akses `/login` saat sudah login → redirect ke dashboard sesuai role | ✅ |
| Akses `/register` saat sudah login → redirect ke dashboard | ✅ |
| Spash screen `/` → redirect ke `/onboarding` (jika baru) atau `/login` | ☐ |

## F. Customer Pages

> Customer pages sudah terhubung ke Supabase. Jalankan SQL di bawah untuk membuat data test.

### SQL Script — Data Test untuk Customer Pages

Jalankan script berikut di **Supabase SQL Editor**. Gunakan UUID dari akun vendor yang sudah Anda daftarkan.

```sql
-- ===== ISI DATA TEST UNTUK CUSTOMER PAGES =====
-- Ganti '<UUID_VENDOR>' dengan ID user vendor Anda
-- Cara dapatkan UUID: SELECT id FROM users WHERE role = 'vendor' LIMIT 1;

-- 1. Buat vendor profile
INSERT INTO vendor_profiles (user_id, specialization, bio, rating, total_jobs, is_verified)
VALUES
  ('<UUID_VENDOR>', 'Teknisi AC & Listrik', 'Berpengalaman 10+ tahun di bidang perbaikan AC dan instalasi listrik. Siap membantu perbaikan rumah Anda.', 4.8, 124, true);

-- 2. Buat services
INSERT INTO services (vendor_id, title, category, price, description)
VALUES
  ('<UUID_VENDOR>', 'Perbaikan AC Bocor', 'AC', 150000, 'Service AC tidak dingin, bocor, atau bunyi berisik. Termasuk cek freon dan pembersihan filter.'),
  ('<UUID_VENDOR>', 'Cuci AC Reguler', 'AC', 75000, 'Pembersihan AC menyeluruh, termasuk indoor dan outdoor unit.'),
  ('<UUID_VENDOR>', 'Pemasangan AC Baru', 'AC', 350000, 'Instalasi AC baru lengkap dengan bracket dan pipa.'),
  ('<UUID_VENDOR>', 'Instalasi Listrik Rumah', 'Listrik', 200000, 'Pasang instalasi listrik baru, termasuk stop kontak dan saklar.'),
  ('<UUID_VENDOR>', 'Perbaikan Korsleting', 'Listrik', 100000, 'Perbaikan korsleting listrik dan penggantian kabel rusak.');

-- 3. Buat order test (gunakan UUID customer yang sudah terdaftar)
-- Ganti '<UUID_CUSTOMER>' dengan ID user customer Anda
-- Cara dapatkan UUID: SELECT id FROM users WHERE role = 'customer' LIMIT 1;
INSERT INTO orders (customer_id, vendor_id, service_id, service_category, service_name, scheduled_date, scheduled_time, service_address, notes, base_amount, platform_fee, vendor_payout, total_amount, payment_status, order_status)
VALUES
  ('<UUID_CUSTOMER>', '<UUID_VENDOR>', (SELECT id FROM services WHERE vendor_id = '<UUID_VENDOR>' LIMIT 1), 'AC', 'Perbaikan AC Bocor', CURRENT_DATE + 1, '09:00', 'Jl. Merpati No 45, Jakarta', 'AC tidak dingin, mohon cek freon', 150000, 7500, 142500, 157500, 'escrow', 'accepted'),
  ('<UUID_CUSTOMER>', '<UUID_VENDOR>', (SELECT id FROM services WHERE vendor_id = '<UUID_VENDOR>' OFFSET 1 LIMIT 1), 'Listrik', 'Instalasi Listrik', CURRENT_DATE - 3, '10:00', 'Jl. Kenanga No 12, Jakarta', '', 200000, 10000, 190000, 210000, 'released', 'completed'),
  ('<UUID_CUSTOMER>', '<UUID_VENDOR>', (SELECT id FROM services WHERE vendor_id = '<UUID_VENDOR>' OFFSET 2 LIMIT 1), 'AC', 'Cuci AC Reguler', CURRENT_DATE - 7, '14:00', 'Jl. Mawar No 78, Jakarta', '2 unit AC', 75000, 3750, 71250, 78750, 'released', 'completed');

-- 4. Buat wallet dan transaksi untuk vendor
INSERT INTO wallets (user_id, balance)
VALUES ('<UUID_VENDOR>', 500000);

INSERT INTO wallet_transactions (wallet_id, type, amount, status)
VALUES
  ((SELECT id FROM wallets WHERE user_id = '<UUID_VENDOR>'), 'payment', 150000, 'success'),
  ((SELECT id FROM wallets WHERE user_id = '<UUID_VENDOR>'), 'payment', 200000, 'success'),
  ((SELECT id FROM wallets WHERE user_id = '<UUID_VENDOR>'), 'withdrawal', -500000, 'success');
```

> **Catatan:** Setelah menjalankan SQL, refresh halaman customer untuk melihat data dari database.

### Test List

| Halaman | Test | Status |
|---------|------|--------|
| `/customer/home` | Vendor dari database tampil (bukan mock) | ☐ |
| `/customer/home` | Tap kategori → navigasi ke search | ☐ |
| `/customer/home` | Tap search bar → navigasi ke `/customer/search` | ☐ |
| `/customer/vendor?id=...` | Profil vendor dari database | ☐ |
| `/customer/vendor?id=...` | Daftar services dari database | ☐ |
| `/customer/booking` | Harga & detail dari database | ☐ |
| `/customer/orders` | Daftar order dari database (jika ada) | ☐ |
| `/customer/orders/detail` | Tracking order | ☐ |
| `/customer/payment?order_id=...` | Halaman pembayaran — total dari database | ☐ |
| `/customer/payment/success?order_id=...` | Halaman sukses — detail dari database | ☐ |
| `/customer/profile` | Lihat profil | ☐ |
| `/customer/profile/edit` | Edit profil | ☐ |
| `/customer/chat` | Halaman chat (real messages + Realtime subscriptions) | ☐ |
| `/customer/search` | Search dari Supabase (real data, no mock) | ☐ |
| `/customer/review` | Form review (rating bintang + text + submit) | ☐ |
| `/customer/home` | Promo banner dinamis dari Supabase | ☐ |
| `/customer/home` | Vendor Terbaik (sort by rating) | ☐ |
| `/customer/home` | Vendor Terdekat (sort by distance) + toggle map view | ☐ |
| `/customer/vendor` | Ulasan pelanggan tampil di vendor detail | ☐ |

### F.1. Empty State (Database Kosong)

| Test | Status |
|------|--------|
| `/customer/home` → menampilkan "Belum ada vendor terdaftar" | ☐ |
| `/customer/orders` → menampilkan "Belum ada pesanan aktif" | ☐ |
| Search → menampilkan "Vendor tidak ditemukan" | ☐ |

### F.2. Loading State

| Test | Status |
|------|--------|
| Home menampilkan spinner/loader saat fetch vendor | ☐ |
| Vendor detail menampilkan loader saat fetch data | ☐ |

## G. Vendor Pages

> Semua halaman vendor sekarang sudah **terhubung ke Supabase** (termasuk Chat dengan real messages).

### SQL Script — Buat Wallet untuk Vendor

Jika vendor profile sudah ada tapi wallet belum, jalankan:

```sql
-- Buat wallet untuk vendor (ganti <UUID_VENDOR>)
INSERT INTO wallets (user_id, balance)
SELECT id, 0 FROM users WHERE id = '<UUID_VENDOR>'
AND NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = '<UUID_VENDOR>');
```

### Test List

| Halaman | Test | Status |
|---------|------|--------|
| `/vendor/dashboard` | Nama vendor dari auth, stats dari database | ☐ |
| `/vendor/orders` | Daftar pesanan dari database (tab Aktif / Riwayat) | ☐ |
| `/vendor/orders` | Empty state saat tidak ada pesanan | ☐ |
| `/vendor/orders/detail` | Progress order + tombol aksi real (Terima/Tolak/Mulai/Selesai) | ☐ |
| `/vendor/orders/detail` | Toast sukses/gagal setelah action | ☐ |
| `/vendor/orders/detail` | Order tidak ditemukan → error state | ☐ |
| `/vendor/earnings` | Saldo & riwayat transaksi dari database | ☐ |
| `/vendor/profile` | Profil vendor dari database | ☐ |
| `/vendor/profile/edit` | Edit profil → simpan ke database | ☐ |
| `/vendor/chat` | Daftar percakapan dari database (bukan mock) | ☐ |
| `/vendor/portfolio` | Daftar portofolio (services) dari database | ☐ |
| `/vendor/portfolio` | Empty state "Belum ada portofolio" | ☐ |
| `/vendor/portfolio/add` | Tambah portofolio → submit ke Supabase | ☐ |
| `/vendor/portfolio/add` | Validasi form (required fields) | ☐ |
| Vendor Bottom Nav | 4 tab berfungsi (Dashboard, Orders, Earnings, Profile) | ☐ |

## H. Error Handling

| Test | Status |
|------|--------|
| Register: error code + message tampil di layar | ✅ |
| Login: error email tidak terdaftar | ✅ |
| Login: error password salah | ✅ |
| Home: fetch gagal → tampilkan "Gagal memuat data vendor" | ☐ |
| Vendor Detail: ID tidak valid → tampilkan "Vendor tidak ditemukan" | ☐ |
| Orders: fetch gagal → tampilkan "Gagal memuat pesanan" | ☐ |

## I. Database Schema & RLS

| Test | Status |
|------|--------|
| SQL migration `clean_and_setup.sql` sukses | ✅ |
| SQL migration `0001_legal_sheva_callister.sql` (add scheduled_time) sukses | ✅ |
| RLS policies aktif di semua tabel | ✅ |
| Trigger `handle_new_user` di-create ulang (versi robust) | ✅ |
| Google OAuth → profile auto-created | ✅ |

## J. Catatan untuk Testing Selanjutnya

1. **Google Login** ✅ — sudah berhasil
2. **Isi data dummy** — jalankan SQL script di section F
3. **Test vendor pages** — sudah terhubung ke database
4. **Test customer pages** — butuh data vendor di database dulu

---

## K. Test Plan — Skenario Manual (Android Tablet)

> Jalankan test ini setelah data dummy sudah diisi (SQL script section F & G).

### K.1. Vendor Order Flow

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor | Redirect ke `/vendor/dashboard` |
| 2 | Dashboard: cek stats | Jumlah pending/completed jobs sesuai data |
| 3 | Dashboard: cek "Permintaan Baru" | Muncul request dari order pending |
| 4 | Tap "Terima" di detail order | Order berubah status jadi Diterima |
| 5 | Tap "Mulai Pekerjaan" | Order berubah status jadi Berjalan |
| 6 | Tap "Selesaikan Pekerjaan" | Order berubah status jadi Selesai, toast sukses |
| 7 | Buka tab orders "Riwayat" | Order selesai muncul di tab riwayat |
| 8 | Buka tab orders "Aktif" | Tidak ada order aktif |
| 9 | Tap "Tolak" pada order baru | Order berubah status jadi Dibatalkan |
| 10 | Cek error: buka detail order dengan ID palsu | Muncul "Pesanan tidak ditemukan" |

### K.2. Earnings & Wallet

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/earnings` | Saldo, total pendapatan, jumlah selesai sesuai data |
| 2 | Scroll ke riwayat transaksi | Transaksi dari wallet_transactions tampil |
| 3 | Buka `/wallet` | Saldo tampil dari database |
| 4 | Cek riwayat transaksi | Transaksi dari wallet_transactions tampil |
| 5 | Tap "Top Up" | Button disabled (belum terintegrasi) |

### K.3. Portfolio

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/portfolio` | Daftar services dari database tampil |
| 2 | Jika belum ada service | Empty state "Belum ada portofolio" muncul |
| 3 | Tap "Tambah" → isi form | Form validasi required fields |
| 4 | Submit form | Toast "Portofolio berhasil ditambahkan", redirect ke list |
| 5 | Cek list lagi | Service baru muncul di daftar |

### K.4. Vendor Chat

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/chat` | Daftar chat dari database tampil (perlu data chats + messages di Supabase) |
| 2 | Jika tidak ada chat | Empty state "Tidak ada pesan" |
| 3 | Search percakapan | Filter by customer name |

### K.5. Customer Booking → Payment Flow

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer | Redirect ke `/customer/home` |
| 2 | Pilih vendor, pilih service → tap "Pesan" | Masuk ke `/customer/booking` |
| 3 | Pilih tanggal & jam → tap "Lanjut ke Pembayaran" | **createOrder INSERT** ke Supabase + chat auto-created |
| 4 | Loading "Memproses..." | Mutation berjalan |
| 5 | Setelah sukses | Redirect ke `/customer/payment?order_id=...` |
| 6 | Toast "Pesanan berhasil dibuat" | Muncul |
| 7 | Halaman payment tampil | Total amount dari database tampil |
| 8 | Tap "Bayar Sekarang" | Update payment_status → escrow |
| 9 | Redirect ke `/customer/payment/success` | Halaman sukses |
| 10 | Halaman sukses | Nama layanan & nominal dari database |
| 11 | Tap "Lacak Pesanan" | Redirect ke `/customer/orders/detail` dengan data real |
| 12 | Order detail | Service info, jadwal, lokasi, rincian biaya dari DB |
| 13 | Tap "Chat" | Redirect ke `/customer/chat?order_id=...` |
| 14 | Chat page | Kirim & terima pesan real dari Supabase |

### K.6. Customer Profile

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/profile` | Menu "Dompet Saya" muncul |
| 2 | Tap "Dompet Saya" | Navigasi ke `/wallet` |

---

### K.7. Scheduled Time — Test Perbaikan Deviasi PRD

> Migration `0001_legal_sheva_callister.sql` sudah dijalankan. Kolom `scheduled_time` tersedia di tabel orders.

#### K.7.1. Booking — Date & Time Selection

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, pilih vendor, pilih service | Masuk ke `/customer/booking` |
| 2 | Cek field **Tanggal** | Date picker muncul, default hari ini |
| 3 | Ganti tanggal ke beberapa hari ke depan | Label berubah (Besok / nama hari / tanggal) |
| 4 | Cek grid **Waktu** | 8 slot: 08:00, 09:00, 10:00, 11:00, 13:00, 14:00, 15:00, 16:00 |
| 5 | Tap salah satu slot | Slot terpilih (border emerald-500) |
| 6 | Tap slot yang sama lagi | Slot terpilih (toggle on/off) |
| 7 | **Tombol "Lanjut ke Pembayaran"** | **Disabled** jika belum pilih jam |
| 8 | Pilih jam → tombol jadi aktif | Tombol enabled |
| 9 | Tap "Lanjut ke Pembayaran" | URL mengandung `?amount=...&scheduled_date=...&scheduled_time=...` |

#### K.7.2. Vendor Order Detail — Show Time

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka `/vendor/orders` | Daftar order muncul |
| 2 | Cek kolom tanggal di list | Format: `dd/mm/yyyy HH:mm` (contoh: `10/05/2026 09:00`) |
| 3 | Tap order → detail | Halaman detail order |
| 4 | Cek bagian **Informasi Pesanan** | Tanggal format Indonesia + jam muncul |
| 5 | Jika order memiliki `scheduled_time` | Jam tampil dengan icon Clock di samping tanggal |

#### K.7.3. Customer Order History — Show Time

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, buka `/customer/orders` | Daftar order muncul |
| 2 | Cek kolom tanggal | Format: `dd/mm/yyyy, HH:mm` (contoh: `10/05/2026, 09:00`) |
| 3 | Jika `scheduled_time` null | Hanya tanggal yang muncul (tanpa koma dan jam) |

#### K.7.4. Database — Direct SQL Check

```sql
-- Cek apakah kolom scheduled_time sudah ada
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'scheduled_time';
-- Expected: 1 row (scheduled_time, text)

-- Cek data order yang punya scheduled_time
SELECT id, scheduled_date, scheduled_time FROM orders WHERE scheduled_time IS NOT NULL LIMIT 5;
-- Expected: menampilkan tanggal dan jam

-- Cek data order yang TIDAK punya scheduled_time (backward compat)
SELECT id, scheduled_date FROM orders WHERE scheduled_time IS NULL LIMIT 5;
-- Expected: scheduled_time = null, tidak error
```

---

### K.8. Review System

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, buka order detail dengan status **completed** | Tombol "Beri Ulasan" muncul (warna kuning, icon Star) |
| 2 | Tap "Beri Ulasan" | Redirect ke `/customer/review?order_id=...` |
| 3 | Halaman review | Nama layanan + tanggal dari database tampil |
| 4 | Tap bintang 1–5 | Bintang terisi sesuai pilihan, label muncul (Sangat Kurang / Kurang / Cukup / Baik / Sangat Baik) |
| 5 | Tulis teks ulasan (opsional) | Textarea bisa diisi |
| 6 | Tap "Kirim Ulasan" | Loading, lalu toast "Ulasan berhasil dikirim" |
| 7 | Redirect ke `/customer/orders` | Halaman daftar pesanan |
| 8 | Buka vendor detail (`/customer/vendor?id=...`) | Ulasan baru muncul di section "Ulasan Pelanggan" |
| 9 | Cek rating vendor | Berubah sesuai rata-rata ulasan |
| 10 | Buka kembali order yang sama | Tombol "Beri Ulasan" hilang (sudah review) |
| 11 | Coba akses `/customer/review?order_id=...` yang sudah pernah review | Tampil "Anda sudah memberikan ulasan" |

### K.9. Promo Banner + Recommendations

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/home` | Promo banner muncul (dari Supabase promos table, atau fallback statis "Diskon 50%") |
| 2 | Jika ada promo aktif | Tampil dengan gradient emerald + diskon % dari database |
| 3 | Jika tidak ada promo | Fallback statis "Diskon 50% untuk pengguna baru" tampil |
| 4 | Scroll ke **Vendor Terbaik** | Vendor dengan rating > 0 muncul, diurutkan rating tertinggi ke rendah |
| 5 | Tap salah satu vendor terbaik | Redirect ke `/customer/vendor?id=...` |

### K.10. Nearby Vendors + Leaflet Map

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/home` | Section "Vendor Terdekat" atau "Nearby Vendors" muncul |
| 2 | Jika geolocation di-allow | Vendor diurutkan berdasarkan jarak terdekat, label jarak (km) muncul di tiap card |
| 3 | Jika geolocation di-deny | Vendor ditampilkan tanpa urutan jarak (fallback ke all vendors) |
| 4 | Tap toggle icon map (sebelah "See all") | Map Leaflet muncul dengan marker vendor |
| 5 | Map menampilkan marker | Hanya vendor dengan `lat`/`lng` yang tampil sebagai pin |
| 6 | Tap marker vendor | Redirect ke `/customer/vendor?id=...` |
| 7 | Tap toggle icon list | Kembali ke tampilan list |
| 8 | Buka `/customer/search` | Hasil pencarian dari Supabase (no mock) |
| 9 | Search dengan query | Filter by nama & spesialisasi |
| 10 | Tap kategori dari home page | Search page terisi dengan category filter dari URL |

### K.11. Realtime Chat

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, buka chat (`/customer/chat?order_id=...`) | Chat page tampil |
| 2 | Kirim pesan | Pesan muncul langsung di UI (Realtime + cache update) |
| 3 | Buka browser/device lain, login sebagai Vendor untuk order yang sama | Pesan dari customer muncul **instan** (tanpa refresh) |
| 4 | Vendor balas pesan | Customer lihat balasan **instan** |
| 5 | Matikan koneksi internet | Polling fallback (10s) tetap jalan setelah koneksi kembali |

> **Note:** Untuk Realtime subscription bekerja, pastikan tabel `messages` sudah ditambahkan ke publication `supabase_realtime`:
> ```sql
> alter publication supabase_realtime add table messages;
> ```
> SQL ini GRATIS, semua plan. Tidak perlu Pro.

---

### K.12. Vendor Location Picker

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka `/vendor/profile/edit` | Scroll ke section "Lokasi Usaha" |
| 2 | Map Leaflet muncul dengan pin | Pin bisa di-drag, tap peta untuk pindah pin |
| 3 | Tap "Gunakan Lokasi Saya" | Geolocation request → pin pindah ke lokasi user |
| 4 | Simpan profil | Koordinat tersimpan di `users.lat` / `users.lng` |
| 5 | Buka home customer | Vendor muncul sebagai pin di map (jika lat/lng terisi) |

---

### K.13. Refund Logic

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka order detail dengan status **accepted** (payment escrow) | Tombol "Tolak" + "Mulai Pekerjaan" muncul |
| 2 | Tap **"Tolak"** | Order berubah status jadi **Dibatalkan**, payment_status jadi **refunded** |
| 3 | Toast "Pesanan ditolak" muncul | Notifikasi sukses |
| 4 | Wallet transaction `type: 'refund'` ter-create | Audit trail tercatat (cek Supabase table `wallet_transactions`) |
| 5 | Login sebagai Customer, buka order detail yang direfund | Badge **"Dana Telah Dikembalikan"** muncul dengan nominal |
| 6 | Cek badge | Warna merah, menampilkan total_amount yang direfund |
| 7 | Login sebagai Vendor, buka `/vendor/earnings` | Ringkasan menampilkan stat **Refund** (jika ada) |
| 8 | Cek Riwayat Transaksi | Transaksi refund muncul (type: 'refund', amount negatif) |
| 9 | **Regression:** Vendor "Tolak" pada order **pending** (payment unpaid) | Order dibatalkan, **tanpa** refund (payment_status tetap unpaid) |
| 10 | **Regression:** Customer "Batalkan Pesanan" pada order pending | Order dibatalkan + payment_status refunded (sama seperti sebelumnya) |

---

### K.14. Xendit Payment Gateway

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, buat booking lalu ke `/customer/payment` | Halaman payment muncul dengan 4 metode |
| 2 | Tap **"Bayar Sekarang"** | Loading "Mengarahkan ke pembayaran..." lalu redirect ke halaman Xendit |
| 3 | Di halaman Xendit (sandbox), selesaikan pembayaran | Redirect balik ke `/customer/payment/success?order_id=...` |
| 4 | Success page loading "Memverifikasi pembayaran..." | Polling payment_status dari Supabase |
| 5 | Webhook dari Xendit diterima → payment_status berubah jadi `escrow` | Halaman berubah jadi "Pembayaran Berhasil!" |
| 6 | Cek wallet vendor | Balance bertambah sebesar vendor_payout |
| 7 | Cek wallet_transactions | Transaksi `type: 'payment'` tercatat |
| 8 | **Fallback:** Jika Edge Function tidak reachable | Sistem fallback ke direct mutation (`payment_status: 'escrow'`) |
| 9 | **Fallback:** Jika pembayaran di halaman Xendit dibatalkan | Redirect ke `/customer/payment?order_id=...` (halaman ulang) |

---

### K.15. Setup Webhook Xendit (Sekali Saja)

> Langkah-langkah ini hanya perlu dilakukan **sekali** di dashboard Xendit agar webhook bisa menerima notifikasi pembayaran.

**Di Dashboard Xendit:**
1. Login ke [Xendit Dashboard](https://dashboard.xendit.co) → Settings → Webhooks
2. Klik **"+ Add Webhook"**
3. Isi:
   - **Webhook URL**: `https://ajteskgdggxwefcrncuu.supabase.co/functions/v1/xendit-webhook`
   - **Callback Token**: `gema_webhook_token_2026`
   - **Events**: centang `invoice.paid` (dan opsional `invoice.expired`)
4. Klik **Save**

**Verifikasi Webhook:**
```sql
-- Cek di Supabase apakah webhook sudah memproses transaksi
SELECT * FROM wallet_transactions WHERE type = 'payment' ORDER BY created_at DESC LIMIT 5;

-- Cek order yang statusnya berubah via webhook
SELECT id, payment_status, order_status FROM orders WHERE payment_status = 'escrow' ORDER BY updated_at DESC LIMIT 5;
```

**Troubleshooting:**
- Jika webhook gagal, cek logs di Supabase Dashboard → Edge Functions → `xendit-webhook` → Logs
- Pastikan `XENDIT_WEBHOOK_TOKEN` di Supabase secrets (`gema_webhook_token_2026`) cocok dengan Callback Token di dashboard Xendit
- Webhook URL harus bisa diakses publik (URL Supabase Edge Function sudah publik secara default)```
