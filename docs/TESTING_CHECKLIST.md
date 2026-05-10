# GEMA Testing Checklist

> Status: ✅ = Lolos | ❌ = Gagal | ☐ = Belum di-test

---

## A. Build & Compile

- [x] `npm run build` — 33 halaman compiled & exported tanpa error

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
| `/customer/chat` | Halaman chat | ☐ |

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

> Semua halaman vendor sekarang sudah **terhubung ke Supabase** (kecuali Chat yang masih mock).

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

### K.5. Customer Payment

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Customer | Redirect ke `/customer/home` |
| 2 | Pilih vendor, pilih service, booking | Flow hingga payment |
| 3 | Buka `/customer/payment?order_id=...` | Total amount dari database tampil |
| 4 | Tap "Bayar Sekarang" | Redirect ke `/customer/payment/success` |
| 5 | Halaman sukses | Nama layanan & nominal dari database |

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
