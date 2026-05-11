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

### K.15. Register Webhook di Xendit Dashboard (Sekali Saja)

> Langkah-langkah ini hanya perlu dilakukan **sekali** di dashboard Xendit agar webhook bisa menerima notifikasi pembayaran. Webhook Edge Function (`xendit-webhook`) sudah di-deploy ke Supabase dan semua secrets sudah diset.

#### Prasyarat — Verifikasi Edge Function & Secrets

Jalankan di terminal proyek:

```bash
# Cek status Edge Function
npx supabase functions list | grep xendit-webhook

# Cek secrets sudah diset
npx supabase secrets list | grep -E 'XENDIT_WEBHOOK_TOKEN|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY'
```

Expected: fungsi berstatus `ACTIVE` dan ketiga secrets muncul.

#### Langkah-langkah di Dashboard Xendit

| Langkah | Aksi | Detail |
|---------|------|--------|
| 1 | Login | Buka [Xendit Dashboard](https://dashboard.xendit.co) |
| 2 | Navigasi | Settings → Webhooks |
| 3 | Add Webhook | Klik **"+ Add Webhook"** |
| 4 | Isi Webhook URL | `https://ajteskgdggxwefcrncuu.supabase.co/functions/v1/xendit-webhook` |
| 5 | Pilih Category | **Payments** |
| 6 | Callback Token | **Otomatis** oleh Xendit (tidak ada input field manual). `XENDIT_WEBHOOK_TOKEN` di Supabase secrets harus diisi dengan token dari halaman webhook detail di Xendit Dashboard |
| 7 | Pilih Events | Centang **`invoice.paid`** (wajib) + opsional **`invoice.expired`** |
| 8 | Simpan | Klik **Save** |

> **Catatan:** Xendit dashboard tidak lagi menyediakan input field untuk Callback Token. Token di-generate otomatis. Ambil token dari halaman detail webhook setelah webhook tersimpan, lalu setel ke Supabase:
> ```bash
> npx supabase secrets set XENDIT_WEBHOOK_TOKEN="<token_dari_xendit>"
> ```

> **Penting — `verify_jwt`:** Function `xendit-webhook` harus punya `verify_jwt = false` di `supabase/config.toml` karena Xendit tidak mengirim Supabase JWT. Tanpa ini webhook akan return 401 `UNAUTHORIZED_NO_AUTH_HEADER`.

#### Verifikasi Webhook

Buat pembayaran test melalui aplikasi:

1. Login sebagai Customer → booking service → tap "Bayar Sekarang"
2. Redirect ke halaman Xendit → selesaikan pembayaran (sandbox: `BNI` → `4515111111` PIN `12345`)
3. Cek Supabase:

```sql
-- Cek wallet_transactions dari webhook
SELECT * FROM wallet_transactions WHERE type = 'payment' ORDER BY created_at DESC LIMIT 5;

-- Cek order yang statusnya berubah via webhook
SELECT id, payment_status, order_status FROM orders WHERE payment_status = 'escrow' ORDER BY updated_at DESC LIMIT 5;
```

Atau cek logs realtime:

```bash
npx supabase functions logs xendit-webhook --tail
```

##### Hasil Test Webhook (11 Mei 2026)

| Test | Status | Catatan |
|------|--------|---------|
| Invoice paid | ✅ `200 OK` | Webhook function menerima & proses escrow + wallet |
| Invoice expired | ✅ `200 OK` (expected) | Function log "Invoice expired" tanpa action |
| Payment session expired | ❌ `400 Missing external_id` | **Bukan event invoice** — `payment_session` punya struktur payload berbeda (`event.data.reference_id` vs `external_id`). Event ini tidak perlu di-handle |

#### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Webhook gagal (401) | Pastikan `verify_jwt = false` di `supabase/config.toml` untuk `xendit-webhook`, lalu redeploy |
| Webhook gagal (401) setelah fix JWT | Cek `XENDIT_WEBHOOK_TOKEN` di Supabase secrets cocok dengan token dari halaman detail webhook Xendit |
| Webhook URL tidak reachable | Pastikan URL adalah Supabase Edge Function URL (publik secara default) |
| Order tidak terupdate | Cek logs di Supabase Dashboard → Edge Functions → `xendit-webhook` → Logs |
| Wallet tidak terisi | Pastikan vendor punya wallet row (auto-create di `/wallet` page) |

---

### K.16. Wallet Topup & Withdraw

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet` | Tombol "Top Up" dan "Tarik" aktif (tidak disabled) |
| 2 | Tap "Top Up" | Redirect ke `/wallet/topup` |
| 3 | Tap nominal Rp 50.000 | Input terisi otomatis |
| 4 | Tap "Top Up Rp 50.000" | Loading "Memproses..." lalu toast sukses |
| 5 | Redirect ke `/wallet` | Transaksi baru muncul di riwayat dengan status "Tertunda" |
| 6 | Tap "Tarik" | Redirect ke `/wallet/withdraw` |
| 7 | Isi jumlah, pilih bank, isi rekening, isi nama | Tombol "Tarik" aktif |
| 8 | Tap "Tarik" | Toast sukses, transaksi "Tertunda" muncul |
| 9 | Cek validasi: jumlah > saldo | Error "Melebihi saldo tersedia" |
| 10 | Cek validasi: jumlah < Rp 10.000 | Tombol disabled |

### K.17. Loading Skeleton Components

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet` saat koneksi lambat | Skeleton card + list muncul (bukan spinner) |
| 2 | Buka `/vendor/orders/detail?id=...` | Skeleton detail muncul saat loading |
| 3 | Buka `/customer/orders/detail?id=...` | Skeleton detail muncul saat loading |

### K.18. Live Location Tracking

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka order detail dengan status `in_progress` | Tombol "Bagikan Lokasi Saya" muncul |
| 2 | Tap "Bagikan Lokasi Saya" | Tombol berubah jadi "Berhenti Bagikan Lokasi" dengan animasi pulse |
| 3 | Login sebagai Customer, buka order detail yang sama | Section "Lokasi Vendor" muncul dengan koordinat |
| 4 | Vendor tap "Berhenti Bagikan Lokasi" | Sharing berhenti |
| 5 | Cek customer page | Lokasi terakhir masih tampil |

### K.19. Push Notification (Scaffolding)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka aplikasi | Service worker terdaftar (cek di DevTools → Application → Service Workers) |
| 2 | Cek `public/sw.js` | File exist dengan event listeners untuk push, notificationclick |
| 3 | Notifikasi | Push notification siap diintegrasikan dengan FCM/Capacitor nanti |

---

### K.20. Admin Dashboard

> Admin pages are protected — only users with `role = 'admin'` can access them. Non-admin users get redirected.

#### K.20.1. Admin Login & Protection

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer, akses `/admin/dashboard` langsung | Redirect ke `/customer/home` (admin layout protection) |
| 2 | Login sebagai Vendor, akses `/admin/dashboard` langsung | Redirect ke `/vendor/dashboard` |
| 3 | Login sebagai Admin | Redirect ke `/admin/dashboard` |
| 4 | Buka `/admin` | Redirect ke `/admin/dashboard` |

#### K.20.2. Dashboard Overview

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/dashboard` | 6 stat cards muncul: Total User, Vendor, Pesanan, Pendapatan, Verifikasi Tertunda, Sengketa Aktif |
| 2 | Cek stat "Verifikasi Tertunda" | Angka sesuai jumlah vendor dengan `is_verified = false` |
| 3 | Cek stat "Sengketa Aktif" | Angka sesuai jumlah dispute dengan `status = 'open'` |
| 4 | Jika ada transaksi pending (topup/withdraw) | Card "Transaksi Tertunda" muncul dengan jumlah |
| 5 | Tap salah satu stat card | Navigasi ke halaman terkait |
| 6 | **Error state:** Koneksi bermasalah | Muncul "Gagal memuat data dashboard" alert |

#### K.20.3. Vendor Verification

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/vendors` | Daftar semua vendor muncul |
| 2 | Tab filter: Semua / Tertunda / Terverifikasi | Filter bekerja sesuai status |
| 3 | Search vendor | Filter by name & specialization |
| 4 | Tap **"Setujui"** pada vendor tertunda | Toast "Vendor berhasil diverifikasi", badge berubah jadi Aktif |
| 5 | Tap **"Nonaktifkan"** pada vendor aktif | Toast "Vendor dinonaktifkan", badge berubah jadi Tertunda |
| 6 | **Empty state:** Tidak ada vendor | Tampil "Belum ada vendor" |
| 7 | **Empty state:** Semua vendor sudah terverifikasi di tab Tertunda | Tampil "Semua vendor sudah terverifikasi" |

#### K.20.4. Dispute Management

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/disputes` | Daftar semua sengketa muncul |
| 2 | Tab filter: Semua / Aktif / Selesai | Filter bekerja sesuai status |
| 3 | Sengketa aktif tampil | Nama layanan, pembuka sengketa, tanggal, nominal tampil |
| 4 | Isi catatan resolusi, tap **"Selesaikan Sengketa"** | Toast sukses, status berubah jadi Selesai |
| 5 | Sengketa selesai tampil | Catatan resolusi tampil di card |
| 6 | **Validation:** Tap "Selesaikan Sengketa" tanpa catatan | Toast "Harap isi catatan resolusi" |
| 7 | **Empty state:** Tidak ada sengketa | Tampil "Tidak ada sengketa" |

#### K.20.5. All Orders

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/orders` | Daftar semua pesanan platform muncul |
| 2 | Filter by status (Semua/Tertunda/Diterima/Berjalan/Selesai/Dibatalkan) | Filter bekerja |
| 3 | Search by service name atau customer name | Filter bekerja |
| 4 | Setiap order card | Tampil nama layanan, kategori, customer, nominal, status badge, payment badge, tanggal |
| 5 | **Empty state:** Tidak ada pesanan dengan filter | Tampil "Tidak ada pesanan" |

#### K.20.6. Promo Management

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/promos` | Daftar promo yang ada |
| 2 | Tap **"Tambah"** | Form tambah promo muncul |
| 3 | Isi judul, deskripsi, diskon, tap "Simpan Promo" | Toast sukses, promo baru muncul di list |
| 4 | **Validation:** Submit form kosong | Toast "Harap isi semua field" |
| 5 | Tap toggle aktif/nonaktif | Status berubah, toast sesuai |
| 6 | Tap **"Hapus"** | Promo dihapus, toast sukses |
| 7 | **Empty state:** Belum ada promo | Tampil "Belum ada promo" |

#### K.20.7. Wallet Transactions Approval

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/transactions` | Daftar semua transaksi wallet |
| 2 | Filter: Semua / Tertunda / Berhasil / Gagal | Filter bekerja |
| 3 | Transaksi pending (topup/withdraw) | Tombol Setujui + Tolak muncul |
| 4 | Tap **"Setujui"** | Toast sukses, status berubah jadi Berhasil, balance wallet terupdate |
| 5 | Tap **"Tolak"** | Toast sukses, status berubah jadi Gagal |
| 6 | Transaksi non-pending | Tidak ada tombol aksi |
| 7 | **Empty state:** Tidak ada transaksi | Tampil "Tidak ada transaksi" |

#### K.20.8. Admin Bottom Nav

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Bottom nav muncul | 6 tab: Dashboard, Vendor, Sengketa, Pesanan, Promo, Transaksi |
| 2 | Tap setiap tab | Navigasi ke halaman yang sesuai, tab aktif berwarna emerald |

### K.20.9. Membuat Akun Admin

> Admin **tidak bisa register** dari UI aplikasi (hanya customer/vendor). Harus dibuat manual.

#### Prasyarat — Jalankan Migration RLS

Jalankan SQL migration di Supabase SQL Editor sebelum buat admin:

```sql
-- File: supabase/migrations/0003_bright_admin.sql
-- Copy-paste seluruh isi file ke Supabase SQL Editor, lalu RUN
```

Migration ini membuat function `is_admin()` + semua RLS policies untuk admin.

#### Langkah Buat Admin

| Langkah | Aksi | Detail |
|---------|------|--------|
| 1 | Buka Supabase Dashboard | Authentication → Add User |
| 2 | Input email & password | Email: `admin@gema.com`, Password: `admin123` |
| 3 | Auto-confirm user | Centang **"Auto Confirm User"** agar langsung aktif |
| 4 | Dapatkan UUID | Buka SQL Editor, jalankan: `SELECT id, email FROM auth.users WHERE email = 'admin@gema.com';` |
| 5 | Update role | `UPDATE users SET role = 'admin' WHERE email = 'admin@gema.com';` |
| 6 | Login ke app | Buka app → login dengan `admin@gema.com` / `admin123` |
| 7 | Verifikasi | Redirect ke `/admin/dashboard`, bottom nav 6 tab muncul |

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Bottom nav muncul | 6 tab: Dashboard, Vendor, Sengketa, Pesanan, Promo, Transaksi |
| 2 | Tap setiap tab | Navigasi ke halaman yang sesuai, tab aktif berwarna emerald |
