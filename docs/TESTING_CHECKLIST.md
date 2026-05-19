# GEMA Testing Checklist

> Status: ✅ = Lolos | ❌ = Gagal | ☐ = Belum di-test

---

## A. Build & Compile

- [x] `npm run build` — 44 halaman compiled & exported, 0 error
- [x] `npm run lint` — ES Lint passes (pre-existing warnings only)
- [x] Admin user `admin@gema.com` exists, role=admin, role_frozen=false
- [x] `fraud_alerts` table exists (BASE TABLE)
- [x] `role_frozen` column exists on `users` (boolean)

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

### K.21. Escrow Release — Wallet Credit via release-payment Edge Function

> Edge Function `release-payment` (verify_jwt=true) dipanggil saat vendor menyelesaikan pekerjaan. Wallet vendor dikreditkan di sini, **bukan** di webhook Xendit.

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka order detail dengan status `in_progress` | Tombol "Selesaikan Pekerjaan" muncul |
| 2 | Tap "Selesaikan Pekerjaan" | Loading, lalu panggil Edge Function `release-payment` |
| 3 | Cek wallet vendor (`/vendor/earnings`) | Balance bertambah sebesar `vendor_payout` |
| 4 | Cek wallet_transactions | Transaksi `type: 'payment'` tercatat dengan amount positif |
| 5 | Cek order status | `order_status = 'completed'`, `payment_status = 'released'` |
| 6 | **Error:** Vendor bukan pemilik order | Edge Function return 403, wallet tidak berubah |
| 7 | **Error:** Order sudah completed | Edge Function return 400, wallet tidak double-credit |
| 8 | **Error:** JWT tidak valid (unauthenticated) | Edge Function return 401 |

### K.22. Xendit Webhook Idempotency

> Webhook `xendit-webhook` (verify_jwt=false) harus idempoten — tidak boleh double-credit wallet jika invoice yang sama dikirim dua kali.

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Simulasikan Xendit kirim webhook `invoice.paid` untuk order dengan `payment_status = 'unpaid'` | `200 OK`, payment_status berubah jadi `escrow`, wallet transaction terbuat |
| 2 | Kirim webhook yang **sama persis** (external_id sama) untuk kedua kalinya | `200 OK` (idempotent), payment_status tetap `escrow`, **tidak ada** wallet transaction duplikat |
| 3 | Kirim webhook untuk order dengan `payment_status = 'escrow'` (sudah diproses) | `200 OK`, tidak ada perubahan, tidak ada duplikasi |
| 4 | Kirim webhook untuk order dengan `payment_status = 'released'` (sudah selesai) | `200 OK`, tidak ada perubahan |
| 5 | Kirim webhook `invoice.expired` | `200 OK`, tidak ada perubahan pada wallet/order |
| 6 | **Regression:** Verifikasi flow end-to-end: booking → bayar → webhook → vendor selesai → release-payment → wallet terisi | Semua langkah berjalan, tidak ada double-credit |

### K.23. Fraud Monitoring — Admin Dashboard

> `fraud_alerts` table + `/admin/fraud` page sudah tersedia. Detection triggers dijadwalkan di Sprint 2.

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/fraud` sebagai Admin | Halaman fraud alert muncul dengan tabel/list |
| 2 | Insert data fraud alert test langsung di SQL: `INSERT INTO fraud_alerts (order_id, alert_type, severity, description) VALUES (NULL, 'test_alert', 'low', 'Test alert — admin fraud page functional');` | Data muncul di halaman fraud |
| 3 | Ganti status alert: Open → Investigating | Status berubah, toast sukses |
| 4 | Ganti status alert: Investigating → Resolved | Status berubah, resolved_at terisi |
| 5 | Ganti status alert: Open → False Positive | Status berubah |
| 6 | **Empty state:** Hapus semua fraud alert (atau sebelum insert) | Tampil "Tidak ada peringatan fraud" |
| 7 | **Cleanup:** `DELETE FROM fraud_alerts WHERE alert_type = 'test_alert';` | Data test bersih |

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
| 5 | Tap "Top Up" | Navigasi ke `/wallet/topup` |

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
| Wallet tidak terisi (order payment) | Pastikan vendor punya wallet row (auto-create di `/wallet` page) |
| Wallet tidak terisi (topup) | Cek `wallet_transactions` apakah webhook sudah update status jadi `success`. Cek logs `xendit-webhook` |

---

### K.16. Wallet Topup & Withdraw

> **Flow Topup:** User input amount → `create-topup-invoice` EF buat transaksi + invoice Xendit → redirect ke Xendit → bayar → webhook `xendit-webhook` detect `topup_<tx_id>` → `status: success` + **balance otomatis bertambah**
>
> **Flow Withdraw (Manual):** User request withdrawal (pending) → Admin approve → `create-disbursement` EF → debit balance → Xendit Disbursement API → kirim dana ke rekening user
>
> **Flow Withdraw (Auto):** Verified vendor request withdrawal → auto-call `create-disbursement` EF → debit balance → Xendit → dana langsung dikirim (skip admin)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet` | Tombol "Top Up" dan "Tarik" aktif |
| 2 | Tap "Top Up" | Redirect ke `/wallet/topup` |
| 3 | Tap nominal Rp 50.000 | Input terisi otomatis |
| 4 | Perhatikan info "Pembayaran via Xendit" | Info card emerald muncul dengan teks redirect ke Xendit |
| 5 | Tap "Top Up Rp 50.000" | Loading "Menyiapkan pembayaran..." lalu redirect ke halaman Xendit |
| 6 | Di halaman Xendit (sandbox), selesaikan pembayaran | Redirect ke `/wallet/topup/success?tx_id=...` |
| 7 | Halaman success polling "Memverifikasi Pembayaran" | Polling status `wallet_transactions` setiap 2 detik |
| 8 | Webhook dari Xendit diterima → status jadi `success` | Halaman berubah jadi "Top Up Berhasil!" |
| 9 | Buka `/wallet` (tanpa refresh manual) | **Balance bertambah**, transaksi topup muncul dengan icon emerald |
| 10 | **Polling timeout:** Jika webhook tidak kunjung tiba (15s) | Halaman fallback "Pembayaran Belum Dikonfirmasi" |
| 11 | Tap "Tarik" | Redirect ke `/wallet/withdraw` |
| 12 | Isi jumlah, pilih bank, isi rekening, isi nama | Tombol "Tarik" aktif |
| 13 | Tap "Tarik" | Toast sukses, transaksi "Tertunda" muncul |
| 14 | **Verified vendor:** buka `/wallet/withdraw` | Zap icon + info "dana dikirim otomatis", langsung panggil EF |
| 15 | **Unverified vendor:** buka `/wallet/withdraw` | Clock icon + info "diproses admin 1-3 hari", status pending |
| 16 | Login sebagai Admin, buka `/admin/transactions` | Transaksi withdrawal pending tampil dengan bank info |
| 17 | Admin tap **"Setujui"** pada withdrawal | Panggil `create-disbursement` EF → debit balance (server-side) → Xendit |
| 18 | Jika disbursement sukses | Toast "Disbursement berhasil dikirim ke Xendit", status `success` |
| 19 | Jika disbursement gagal | EF **refund otomatis** balance, toast error, status tetap `pending` |
| 20 | Cek validasi: jumlah > saldo | Error "Melebihi saldo tersedia" |
| 21 | Cek validasi: jumlah < Rp 10.000 | Toast "Minimal penarikan Rp 10.000" |

### K.16.1. Topup via Xendit — Direct Edge Function Test (Supabase CLI)

```bash
# Test create-topup-invoice (tanpa auth — harus 401)
curl -s -X POST "https://ajteskgdggxwefcrncuu.supabase.co/functions/v1/create-topup-invoice" \
  -H "Content-Type: application/json" \
  -d '{"wallet_id":"test","amount":50000}'
# Expected: {"code":"UNAUTHORIZED_NO_AUTH_HEADER","message":"Missing authorization header"}
```

```bash
# Cek logs xendit-webhook
npx supabase functions logs xendit-webhook --tail
```

### K.16.2. SQL — Verifikasi Transaksi Topup & Withdraw

```sql
-- Cek transaksi topup sukses via Xendit
SELECT * FROM wallet_transactions 
WHERE type = 'topup' AND status = 'success' 
ORDER BY created_at DESC LIMIT 5;

-- Cek transaksi withdrawal disbursement
SELECT * FROM wallet_transactions 
WHERE type = 'withdrawal' 
ORDER BY created_at DESC LIMIT 5;

-- Cek balance wallet terupdate
SELECT w.id, w.user_id, w.balance, u.email
FROM wallets w
JOIN users u ON u.id = w.user_id
ORDER BY w.balance DESC LIMIT 10;
```

#### K.25. Design System — Button Refinement (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Cek Button default size | `h-12 px-6` (48px height, 24px horizontal padding) |
| 2 | Cek Button size `lg` | `h-14 px-8` (56px height) |
| 3 | Cek Button size `icon` | `size-12` (48x48px) |
| 4 | Cek bahwa size `xs`, `sm`, `icon-xs`, `icon-sm` sudah **tidak ada** | Class `h-6`, `h-7`, `size-6`, `size-7` tidak ada di button.tsx |
| 5 | Cek variant `pill` | Button dengan `rounded-full bg-primary h-12 px-8` |
| 6 | Cek variant `default` tetap `rounded-lg` | Tidak berubah jadi pill |
| 7 | **Regression:** Button dengan variant `outline`, `secondary`, `ghost`, `destructive`, `link` | Masih berfungsi normal |

### K.26. Design System — Card Refinement (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Cek Card component | `rounded-3xl` (24px radius) bukan `rounded-xl` |
| 2 | Cek Card tidak punya `ring-1 ring-foreground/10` | Tidak ada ring border |
| 3 | Cek Card punya `shadow-sm` | Bayangan halus muncul |
| 4 | Cek CardHeader & CardFooter | `rounded-t-3xl` / `rounded-b-3xl` (konsisten dengan Card) |
| 5 | **Regression:** Card sub-components (CardHeader, CardContent, CardFooter, CardTitle) | Masih berfungsi normal |

### K.27. Design System — Input Refinement (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Cek Input height | `h-12` (48px) bukan `h-8` |
| 2 | Cek Input radius | `rounded-xl` (12px) bukan `rounded-lg` |
| 3 | Cek Input background | `bg-surface-container-low` (bukan `bg-transparent`) |
| 4 | Cek Input padding horizontal | `px-4` (16px) bukan `px-2.5` |
| 5 | Cek `md:text-sm` sudah **tidak ada** | Tidak ada responsive breakpoint di input |
| 6 | **Regression:** Input dengan type text, email, password, number | Semua berfungsi normal |
| 7 | **Regression:** Input disabled state | `disabled:bg-input/50 disabled:opacity-50` masih ada |

### K.28. Design System — Bottom Navigation (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Customer Bottom Nav container | `h-14` (56px) bukan `h-16` |
| 2 | Tab aktif Customer | `bg-emerald-100 text-emerald-700 rounded-full px-4 py-1` (pill style) |
| 3 | Tab tidak aktif Customer | `text-gray-500` tanpa background |
| 4 | Vendor Bottom Nav container | `h-14` (56px) bukan `h-16` |
| 5 | Tab aktif Vendor | `bg-emerald-100 text-emerald-700 rounded-full px-4 py-1` (pill style) |
| 6 | Admin Bottom Nav container | `h-14` bukan `h-16` |
| 7 | Tab aktif Admin | `bg-emerald-100 text-emerald-700 rounded-full px-3 py-1` (pill style, compact) |
| 8 | **Regression:** Navigasi ke semua tab | Setiap tab mengarah ke route yang benar |
| 9 | **Regression:** Tab aktif berubah saat pindah halaman | Active state sesuai dengan pathname |

### K.29. Design System — StatusBadge Component (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Cek StatusBadge dengan order status `pending` | `bg-amber-100 text-amber-700` dengan icon Clock, label "Menunggu" |
| 2 | Cek StatusBadge dengan order status `accepted` | `bg-blue-100 text-blue-700` dengan icon Check, label "Diterima" |
| 3 | Cek StatusBadge dengan order status `in_progress` | `bg-blue-100 text-blue-700` dengan icon Sync, label "Diproses" |
| 4 | Cek StatusBadge dengan order status `completed` | `bg-emerald-100 text-emerald-700` dengan icon CheckCircle, label "Selesai" |
| 5 | Cek StatusBadge dengan order status `cancelled` | `bg-red-100 text-red-700` dengan icon XCircle, label "Dibatalkan" |
| 6 | Cek StatusBadge dengan payment status `unpaid` | `bg-yellow-100 text-yellow-700` dengan icon AlertCircle, label "Belum Dibayar" |
| 7 | Cek StatusBadge dengan payment status `escrow` | `bg-blue-100 text-blue-700` dengan icon Shield, label "Escrow" |
| 8 | Cek StatusBadge dengan payment status `released` | `bg-emerald-100 text-emerald-700` dengan icon CheckCircle, label "Dibayarkan" |
| 9 | Cek StatusBadge dengan payment status `refunded` | `bg-red-100 text-red-700` dengan icon RotateCcw, label "Dikembalikan" |
| 10 | Cek StatusBadge dengan status tidak dikenal | `null` atau tidak render (return null) |
| 11 | Cek styling | `rounded-full px-2 py-0.5 text-xs font-semibold`, semua icon `size-3` |

### K.30. Design System — CSS Variables (Stitch BATCH 1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Cek `:root` di globals.css | `--surface-container-low`, `--surface-container`, `--surface-container-high`, `--surface-container-highest`, `--surface-container-lowest` ada |
| 2 | Cek `:root` di globals.css | `--outline`, `--outline-variant` ada |
| 3 | Cek `:root` di globals.css | `--on-surface`, `--on-surface-variant` ada |
| 4 | Cek `:root` di globals.css | `--success`, `--success-foreground` ada |
| 5 | Cek `:root` di globals.css | `--radius-md: 0.75rem` ada |
| 6 | Cek tailwind.config.ts | Semua color aliases untuk CSS variables di atas ada |
| 7 | Cek layout.tsx | Plus_Jakarta_Sans ter-import dengan `--font-heading` variable |
| 8 | Cek tailwind.config.ts | `fontFamily.heading` terdefinisi dengan `var(--font-heading)` |

---

## K.17. Loading Skeleton Components

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
| 1 | Bottom nav muncul | 7 tab: Dashboard, Fraud, Vendor, Sengketa, Transaksi, Promo, Pesanan |
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
| 7 | Verifikasi | Redirect ke `/admin/dashboard`, bottom nav 7 tab muncul |

---

### K.24. Fraud Detection Triggers

> Migration `0004_fraud_detection_triggers.sql` sudah di-apply. 5 trigger aktif: self-dealing, rapid completion, burst registration, review bomb, off-platform contact.

#### K.24.1. Self-Dealing

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Jalankan SQL: `INSERT INTO orders (customer_id, vendor_id, service_id, service_category, service_name, scheduled_date, service_address, base_amount, platform_fee, vendor_payout, total_amount) VALUES ('<SAME_UUID>', '<SAME_UUID>', (SELECT id FROM services LIMIT 1), 'Test', 'Test', NOW(), 'Test', 100000, 5000, 95000, 105000);` | RAISE EXCEPTION 'Self-dealing detected', insert ditolak |
| 2 | Cek `fraud_alerts` | Satu alert type 'self_dealing' tercatat |

#### K.24.2. Rapid Completion

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buat order via UI (customer booking → payment → escrow) | Order dengan payment_status 'escrow' |
| 2 | Login sebagai vendor, update order ke completed dalam < 30 menit sejak created_at | Trigger menyala |
| 3 | Cek `fraud_alerts` | Alert type 'rapid_completion' muncul |
| 4 | Kirim update yang sama lagi (double-trigger) | Tidak ada duplikasi alert (idempotent) |

#### K.24.3. Burst Registration

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Insert >5 user dalam 1 jam di Supabase (`INSERT INTO users ...`) | Trigger menyala |
| 2 | Cek `fraud_alerts` | Satu alert type 'burst_registration' dengan severity 'medium' |
| 3 | Insert user ke-7, 8, dst dalam jam yang sama | Tidak ada duplikasi alert (once per hour) |

#### K.24.4. Review Bomb

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Insert 4 review dengan rating <= 2 dari customer yang sama ke vendor yang sama dalam 24 jam | Trigger menyala di review ke-4 |
| 2 | Cek `fraud_alerts` | Alert type 'review_bomb' muncul |
| 3 | Insert review ke-5 dengan rating tinggi (>= 3) | Tidak ada alert baru |

#### K.24.5. Off-Platform Contact

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Kirim pesan di chat yang berisi nomor HP Indonesia (contoh: "hubungi 081234567890") | Trigger menyala |
| 2 | Cek `fraud_alerts` | Alert type 'off_platform' muncul dengan preview pesan di metadata |
| 3 | Kirim pesan berisi email (contoh: "email saya test@email.com") | Alert baru untuk pesan dengan email |
| 4 | Kirim pesan berisi link wa.me (contoh: "chat wa.me/628123456789") | Alert baru untuk link social media |
| 5 | Kirim pesan normal tanpa kontak | Tidak ada alert |
| 6 | Kirim pesan yang sama dalam 1 jam ke chat yang sama | Tidak ada duplikasi (cooldown 1 jam) |

#### K.24.6. Fraud Alert Admin Page

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/fraud` sebagai Admin | Semua alert dari trigger di atas tampil |
| 2 | Cek tipe alert: self_dealing, rapid_completion, burst_registration, review_bomb, off_platform | Masing-masing muncul dengan label yang sesuai |
| 3 | Filter by status 'Terbuka' | Alert open muncul |
| 4 | Tap 'Selidiki' pada salah satu alert | Status berubah jadi 'Diselidiki' |
| 5 | Tap 'Selesai' | Status berubah jadi 'Selesai' |
| 6 | Cek metadata alert (expand card) | JSON metadata berisi order_id, vendor_id, dll |

## K.25. Auth Refinement (Stitch Design — BATCH 2 Sesi 1)

#### K.25.1. Splash (`/`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/` | Background #10B981, wordmark "GEMA" besar `font-heading` |
| 2 | Tunggu 2 detik | Auto-redirect ke `/onboarding` |
| 3 | Animasi | Muncul dengan scale + opacity (GPU-accelerated) |

#### K.25.2. Onboarding (`/onboarding`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/onboarding` | Slide 1 tampil dengan ikon Wrench + judul |
| 2 | Tap "Selanjutnya" | Slide 2 tampil dengan ikon ShieldCheck |
| 3 | Tap "Selanjutnya" lagi | Slide 3 tampil dengan ikon Wallet + tombol "Mulai" |
| 4 | Pagination dots | Dot active lebih lebar (w-6) bg-emerald-600, dot lain w-2 bg-gray-300 |
| 5 | Tap "Skip" (slide 1 atau 2) | Redirect ke `/register/role` |
| 6 | Tap "Mulai" (slide 3) | Redirect ke `/register/role` |
| 7 | Tap "Masuk" | Redirect ke `/login` |
| 8 | Transisi slide | Animasi translate-x smooth |

#### K.25.3. Register (`/register`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/register?role=customer` | Judul "Buat Akun Pelanggan" pakai `font-heading` |
| 2 | Cek submit button | `rounded-full` pill variant, bukan rounded-xl |
| 3 | Validasi form | Required fields, email format, password min 8 |

#### K.25.4. Login (`/login`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/login` | Judul "Selamat Datang!" pakai `font-heading` |
| 2 | Cek submit button | `rounded-full` pill variant, bukan rounded-xl |
| 3 | Google button | Icon + text center alignment |

#### K.25.5. Customer Home (`/customer/home`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/home` | Header bg-emerald-500 dengan GemaPay widget di pojok kanan |
| 2 | Cek GemaPay widget | Icon Wallet, label "GemaPay", saldo Rp 250.000, tombol PlusCircle |
| 3 | Search bar | `rounded-full` (pill shape) |
| 4 | Promo banner | `rounded-3xl` | 
| 5 | Vendor cards (Vendor Terdekat) | `rounded-3xl`, avatar `rounded-xl` |
| 6 | Vendor cards (Vendor Terbaik) | `rounded-3xl`, avatar `rounded-xl` |
| 7 | "Lihat Semua" link | Pill button dengan bg-emerald-50, rounded-full |

#### K.25.6. Search (`/customer/search`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/search` | Filter chips (Semua, Tukang Bangunan, dll) di atas hasil |
| 2 | Chip style | `rounded-full`, active = bg-emerald-600 text-white, inactive = bg-white border |
| 3 | Tap chip kategori | Filter vendors by specialization |
| 4 | Result cards | `rounded-3xl` |

#### K.25.7. Booking Summary (`/customer/booking`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/booking?serviceId=X&vendorId=Y` | Service card dengan avatar, nama, kategori, `rounded-3xl` |
| 2 | Date/Time section | Grid 2 kolom, icon CalendarDays + Clock di dalam card |
| 3 | Payment method | Radio-style GEMA Pay (Wallet icon) + Transfer Bank (Building2 icon) |
| 4 | Select GEMA Pay | Radio terisi, border berubah emerald |
| 5 | Select Transfer Bank | Radio terisi, border berubah emerald |
| 6 | Cost breakdown | Biaya Layanan, Biaya Platform, Promo, Total |
| 7 | Bottom bar | Sticky total display + "Konfirmasi Pesanan" pill button |
| 8 | Submit button | `variant="pill"`, `rounded-full` |
| 9 | Textarea | `rounded-xl` (konsisten) |

#### K.25.8. Order Detail (`/customer/orders/detail`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/orders/detail?id=X` | Status card `rounded-3xl`, status badge pill style (rounded-full) |
| 2 | All inner cards (Map, Schedule, Cost, Timeline) | `rounded-3xl` |
| 3 | Progress stepper | Completed step = emerald dot + CheckCircle2, Current step = blue dot |
| 4 | Chat button | `variant="pill"`, `rounded-full` |
| 5 | Cancel button (pending order) | `rounded-xl` secondary style |
| 6 | Review button (completed order) | `rounded-xl` secondary style |

#### K.25.9. Order History (`/customer/orders`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/orders` | Tab bar pill style (rounded-full bg-white p-1), active tab = bg-emerald-600 text-white |
| 2 | Tap "Riwayat" tab | Switch ke riwayat pesanan |
| 3 | Order cards | `rounded-3xl` dengan vendor avatar (`w-12 h-12 rounded-full`) |
| 4 | Order ID | Ditampilkan dengan prefix `#` (8 digit pertama) |
| 5 | Status badge | Pill style dengan warna sesuai status |
| 6 | "Lihat Detail" button | Pill button (`rounded-full`) dengan ArrowRight icon |
| 7 | Chat icon button | `w-10 h-10 rounded-full` di samping "Lihat Detail" |
| 8 | Empty state | Icon + pesan "Belum ada pesanan aktif/riwayat" |

#### K.25.10. Review (`/customer/review`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/review?order_id=X` | Star rating icon `size={44}` (touch target) |
| 2 | Hover star | `scale-110` (transform) |
| 3 | Textarea | `rounded-xl` |
| 4 | Submit button | `variant="pill"`, `rounded-full` |

#### K.25.11. Chat (`/customer/chat`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/chat?order_id=X` | Header dengan avatar + online dot (`w-3 h-3 bg-emerald-500`, -bottom-0.5 -right-0.5) |
| 2 | Call button | `w-10 h-10 rounded-full` icon button di header kanan |
| 3 | Attachment button | Paperclip icon button di kiri input |
| 4 | Input | `rounded-full h-12 bg-gray-50`, send button `h-12 w-12 rounded-full` |

---

### K.26 BATCH 4 — New Screens & Refinement

#### K.26.1. Customer Reviews Listing (`/customer/reviews`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/reviews?vendor_id=X` | Header: "Ulasan & Feedback" dengan back button |
| 2 | Aggregate card | Rata-rata rating (font-heading), star distribution bar chart, total ulasan |
| 3 | Filter chips | 7 pill chips: "Semua", "5★", "4★", "3★", "2★", "1★", "Dengan Foto" |
| 4 | Tap filter chip | Reviews terfilter sesuai pilihan |
| 5 | Review card | Avatar nama, tanggal, rating stars, teks, foto thumbnail (jika ada) |
| 6 | Filter "Dengan Foto" | Hanya review dengan `review_image` yang tampil |
| 7 | Empty state | Icon + "Belum ada ulasan" jika tidak ada review |
| 8 | Filter empty | "Tidak ada ulasan dengan filter ini" jika hasil kosong |

#### K.26.2. Payment Methods (`/customer/payment/methods`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/payment/methods?order_id=X` | Header "Pilih Metode Pembayaran" + back button |
| 2 | Order summary card | `rounded-3xl` dengan `font-heading` total amount |
| 3 | Method options | GEMA Pay (wallet + saldo), Transfer Bank, Kartu Kredit — `rounded-3xl` cards |
| 4 | Radio selection | Selected method: `border-emerald-500 bg-emerald-50` |
| 5 | Confirm button | `variant="pill"` `w-full` "Konfirmasi Pembayaran" |
| 6 | Tap confirm | Redirect ke `/customer/payment?order_id=X&method=...` |

#### K.26.3. Payment Success (`/customer/payment/success`) — Refinement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/customer/payment/success?order_id=X` | Full screen bg-emerald-600 |
| 2 | Paid state | CheckCircle icon, "Pembayaran Berhasil!", emerald-100 description |
| 3 | Unpaid state | Clock icon, "Menunggu Pembayaran" |
| 4 | Detail card | `rounded-3xl`: Order ID, Layanan, Total (`font-heading`), Tanggal, Status |
| 5 | Total amount | `font-heading font-bold text-lg` |
| 6 | Polling timeout | 15 detik → fallback ke unpaid state |
| 7 | "Lacak Pesanan" button | `h-14 rounded-xl` bg-white text-emerald-700 + ArrowRight |
| 8 | "Kembali ke Beranda" button | `variant="pill"` dengan Home icon |

#### K.26.4. Wallet (`/wallet`) — Gradient Redesign

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet` | Balance card `rounded-3xl`, `bg-gradient-to-br from-emerald-600 to-emerald-800` |
| 2 | Balance display | `font-heading text-4xl font-bold` |
| 3 | "Top Up" button | `variant="pill"` |
| 4 | "Tarik" button | `rounded-xl` bg-white/20 |
| 5 | Transaction list | Icons `w-10 h-10 rounded-full`: topup=emerald, withdrawal=red, payment=blue |
| 6 | "Promo Saya" link | Di header riwayat transaksi, navigasi ke `/wallet/vouchers` |
| 7 | Loading state | Skeleton `rounded-3xl` |
| 8 | Error state | AlertCircle + "Gagal memuat dompet" |
| 9 | Empty transactions | Wallet icon + "Belum ada transaksi" |

#### K.26.5. Promo Voucher History (`/wallet/vouchers`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/vouchers` | Header "Riwayat Promo" + back button |
| 2 | Voucher cards | `rounded-3xl` dengan notch cutout (circles left/right) dan left border emerald |
| 3 | Status badge per card | "Aktif" (emerald) atau "Kadaluarsa" (gray) pill badge |
| 4 | Tap voucher | Navigasi ke `/wallet/promo?id=X` |
| 5 | Loading state | Loader2 spinner |
| 6 | Empty state | Gift icon + "Belum ada promo" |

#### K.26.6. Promo Voucher Detail (`/wallet/promo`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/promo?id=X` | Header "Detail Promo" + back button |
| 2 | Hero card | Gradient `rounded-3xl`, discount `text-5xl font-heading`, title, description |
| 3 | Countdown timer | "Berakhir dalam X hari Y jam" |
| 4 | Terms & Conditions | List dengan CheckCircle icons |
| 5 | "Gunakan Promo" button | `variant="pill"` `w-full` di sticky bottom |
| 6 | Error state | "Promo tidak ditemukan" jika ID invalid |

#### K.26.7. Premium Deal Banner Component

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Component rendered | `bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl` |
| 2 | Premium badge | Pill `uppercase` "PREMIUM" dengan Gift icon |
| 3 | Discount circle | `w-20 h-20` white/20 rounded-full, `font-heading` |
| 4 | Notch cutout | Half-circles left and right (absolute -translate-y-1/2) |
| 5 | CTA | "Lihat Detail" dengan ArrowRight |

#### K.26.8. Vendor Profile Address (`/vendor/profile/address`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/profile/address` | Header "Alamat & Area Layanan" + back button |
| 2 | Address section | MapPin icon + Input address + LocationPicker map |
| 3 | Map section | Leaflet map (dynamic import), drag marker to set location |
| 4 | Operating hours | 7 days with checkbox, time inputs (open/close), Minggu default inactive |
| 5 | Coverage area | Range slider 1-50 km, display nilai |
| 6 | Simpan button | `variant="pill"` `w-full` |
| 7 | Success save | Toast "Alamat berhasil disimpan" |

---

### K.27 Admin — Profile & Sign-Out

#### K.27.1. Admin Profile Page (`/admin/profile`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/profile` | Header emerald dengan back button ke `/admin/dashboard` |
| 2 | Info card | Avatar circle, nama admin, role badge "Admin" (rounded-full bg-emerald-100) |
| 3 | Email row | Icon Mail w-10 h-10 rounded-full bg-blue-100, tampilkan email admin |
| 4 | Role row | Icon Shield w-10 h-10 rounded-full bg-purple-100, "Administrator" |
| 5 | "Keluar" button | Tombol `w-full h-12 rounded-xl` dengan LogOut icon, border-red-200 text-red-600 |
| 6 | Tap "Keluar" | Sign out dari Supabase (`signOut`), redirect ke `/login` |
| 7 | After logout | `useAuthStore.profile` = `null`, tidak bisa akses `/admin/*` (redirect spinner) |

#### K.27.2. Admin Header — Profile Avatar Access

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/admin/dashboard` | Header emerald dengan icon User lingkaran di kanan |
| 2 | Buka `/admin/orders` | Header dengan icon User lingkaran di kanan |
| 3 | Buka `/admin/vendors` | Header dengan icon User lingkaran di kanan |
| 4 | Buka `/admin/transactions` | Header dengan icon User lingkaran di kanan |
| 5 | Buka `/admin/disputes` | Header dengan icon User lingkaran di kanan |
| 6 | Buka `/admin/promos` | Header dengan icon User di samping tombol "Tambah" |
| 7 | Buka `/admin/fraud` | Header dengan icon User lingkaran di kanan |
| 8 | Tap icon User di header mana pun | Navigasi ke `/admin/profile` |
| 9 | Avatar icon | `w-10 h-10 rounded-full bg-white/20` dengan `User` icon, `hover:bg-white/30` |

### K.28. Vendor Portfolio — Luxury Refinements (REFINE_UI_UX_VENDOR.md §3.9–3.10)

#### K.28.1. Vendor Portfolio List (`/vendor/portfolio`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/portfolio` | Background `bg-stone-50`, header sticky dengan `backdrop-blur-lg bg-white/80` |
| 2 | Header styling | `font-heading text-xl font-bold text-stone-800` untuk judul "Portofolio" |
| 3 | Tambah button | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` dengan Plus icon |
| 4 | Loading state | Loader2 spinner animate-spin + teks "Memuat portofolio..." warna `text-stone-400` |
| 5 | Empty state | Briefcase icon di dalam `w-16 h-16 rounded-full bg-stone-100`, teks "Belum ada portofolio", CTA button gradient |
| 6 | Service card | `bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant` |
| 7 | Card hover | `hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer` |
| 8 | Category icon container | `w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm` |
| 9 | Service title | `font-semibold text-stone-800` |
| 10 | Category label | `text-xs text-stone-400` |
| 11 | Description | `text-xs text-stone-500 line-clamp-2` |
| 12 | Price | `font-bold text-emerald-600` dengan format `Rp` + `.toLocaleString('id-ID')` |
| 13 | Hover service card | Lift effect + shadow increase, cursor pointer |

#### K.28.2. Vendor Add Portfolio (`/vendor/portfolio/add`)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/vendor/portfolio/add` | Background `bg-stone-50`, header `backdrop-blur-lg bg-white/80` |
| 2 | Back button | `w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors` |
| 3 | Form card | `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant` |
| 4 | Labels | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |
| 5 | Input fields | `h-12 bg-stone-50 border-stone-200 rounded-xl` dengan `focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10` |
| 6 | Category pills | Grid 3 kolom, `rounded-xl text-sm font-semibold border-2`, active = `border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm` |
| 7 | Textarea | `bg-stone-50 border-stone-200 rounded-xl resize-none`, placeholder `text-stone-400` |
| 8 | Submit button | `w-full h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` |
| 9 | Submit loading | Loader2 animate-spin + "Menyimpan..." teks |
| 10 | Submit success | Toast.success "Portofolio berhasil ditambahkan" + redirect ke `/vendor/portfolio` |
| 11 | Submit error | Toast.error "Gagal menambahkan portofolio" |

---

#### K.29. Vendor UI/UX Refinement — Session 2 & 6 (Luxury/Professional Enhancement)

##### K.29.1. Components

| # | Element | Spec |
|---|---------|------|
| 1 | `StatusBadge` component | Luxury: `bg-*-50/80 text-*-* border border-*-200/50 rounded-full px-2.5 py-0.5 shadow-sm` for all statuses |
| 2 | `Button` — premium variant | `rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white h-12 shadow-md hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.97]` |
| 3 | `Button` — outline-emerald variant | `rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-12` |

##### K.29.2. Vendor Edit Profile (`/vendor/profile/edit`)

| # | Element | Spec |
|---|---------|------|
| 1 | Background | `bg-stone-50` |
| 2 | Header | `bg-white/90 backdrop-blur-lg border-b border-stone-100` sticky z-20, `font-heading text-lg font-bold text-stone-800` |
| 3 | Back button | `rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200` |
| 4 | Photo card | `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant text-center` |
| 5 | Avatar | `w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md` |
| 6 | Camera button | `w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md hover:from-emerald-600 hover:to-emerald-700` |
| 7 | Labels | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |
| 8 | Inputs | `h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200` |
| 9 | Textarea | `bg-stone-50 border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4` |
| 10 | Form card | `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant` |
| 11 | Location card | `bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm` |
| 12 | Submit button | Variant `premium`, full width |

##### K.29.3. Vendor Orders Detail (`/vendor/orders/detail`)

| # | Element | Spec |
|---|---------|------|
| 1 | Background | `bg-stone-50` |
| 2 | Header | `bg-white/90 backdrop-blur-lg border-b border-stone-100`, `font-heading` title, back button stone colors |
| 3 | All cards | `bg-white/90 backdrop-blur-sm rounded-3xl p-4/5 shadow-elegant` |
| 4 | Progress stepper | Active step `bg-emerald-600 text-white shadow-emerald-600/25`, inactive `bg-stone-200 text-stone-400` |
| 5 | Text colors | `text-stone-800` (primary), `text-stone-500` (secondary), `text-stone-400` (muted) |
| 6 | Chat card | `rounded-3xl shadow-elegant hover:shadow-lifted transition-all`, chat icon `w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm` |
| 7 | Payment section | `border-t border-stone-100`, total `text-emerald-600` |
| 8 | Action bar | `fixed bottom-0 z-50 backdrop-blur-xl bg-white/90 border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]` |
| 9 | Action buttons | Decline: `border-red-200/50 text-red-600 hover:bg-red-50/50`; Primary: variant `premium` |

##### K.29.4. Verification Pages

| Page | Spec |
|------|------|
| Intro | `bg-stone-50`, icon `w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full shadow-lg`, steps `rounded-2xl bg-gradient-to-br from-emerald-50 to-white shadow-sm`, CTA `premium` variant |
| KTP | `bg-stone-50`, header glass, back btn stone, form `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant`, labels uppercase, inputs stone, upload dashed `border-stone-200 bg-stone-50`, submit `premium` |
| Certification | Same luxury treatment as KTP; skip btn `border-2 border-stone-200`, submit `premium` |
| Review | `bg-stone-50`, status icon `w-28 h-28 rounded-full shadow-lg` with `*-50/80 bg border *-200/50`, title `text-stone-800`, desc `text-stone-500`, CTA `premium` |

##### K.29.5. Vendor Address (`/vendor/profile/address`)

| # | Element | Spec |
|---|---------|------|
| 1 | Background | `bg-stone-50` |
| 2 | Header | Glass morphism (`bg-white/90 backdrop-blur-lg`), stone colors, `font-heading` title |
| 3 | Back button | `rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200` |
| 4 | Section cards | `bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant` |
| 5 | Section icons | `w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm` |
| 6 | Labels | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |
| 7 | Inputs | `h-12 bg-stone-50 border-stone-200 rounded-xl` with emerald focus ring |
| 8 | Map container | `h-52 bg-stone-100 rounded-2xl shadow-inner` |
| 9 | Time pickers | `rounded-lg border border-stone-200 bg-stone-50 shadow-sm` with emerald focus ring |
| 10 | Save button | Variant `premium`, container `bg-white/90 backdrop-blur-lg border-t border-stone-100` |

---

### K.31. Phase 9 — QA/UAT Code Audit & Bug Fixes (15 Mei 2026)

#### K.31.1. Audit Results

| Area | Files Audited | Critical Bugs | High Bugs | Medium Bugs | Clean Files |
|------|---------------|---------------|-----------|-------------|-------------|
| Auth Flow | 6 files | 0 | 3 | 4 | auth store |
| Customer Pages | 13 files | 1 | 2 | 2 | vendor detail, review, chat |
| Vendor Pages | 15 files | 6 | 4 | 3 | portfolio, chat list |
| Admin + Wallet | 14 files | 4 | 3 | 2 | disputes, orders, transactions |
| Edge Functions | 3 files | 2 | 3 | 2 | — |
| RLS + Schema | 10 migrations | 3 | 4 | 2 | — |

#### K.31.2. Bugs Fixed in This Session

| ID | Bug | File | Status |
|----|-----|------|--------|
| F1 | Vendor profile error "Gagal memuat profil" — no vendor_profiles row created at registration | `app/(auth)/register/page.tsx` | ✅ Fixed — auto-create on register |
| F2 | `useVendor` crashes on missing profile (`.single()` vs `.maybeSingle()`) | `lib/services/useVendors.ts` | ✅ Fixed — changed to `maybeSingle()` |
| F3 | Build error — conflicting `next.config.js` + `next.config.ts` | root directory | ✅ Fixed — removed duplicate `.js` |
| F4 | Vendor order "Complete" action never updates `order_status` — missing mutation key | `app/vendor/orders/detail/page.tsx` | ✅ Fixed — added `complete` mutation |
| F5 | Vendor order chat link goes to list page, not detail | `app/vendor/orders/detail/page.tsx` | ✅ Fixed — `/chat/detail` |
| F6 | Earnings period selector purely cosmetic — no date filtering | `app/vendor/earnings/page.tsx` | ✅ Fixed — filters by period |
| F7 | Customer home hardcoded wallet balance Rp 250.000 | `app/customer/home/page.tsx` | ✅ Fixed — uses `useWallet` |
| F8 | Map/list toggle renders both views simultaneously | `app/customer/home/page.tsx` | ✅ Fixed — added `viewMode === 'list'` |
| F9 | Customer payment GemaPay always calls Xendit; dead mutation code; wrong back link | `app/customer/payment/page.tsx` | ✅ Fixed — wallet branch, removed dead code, fixed params |
| F10 | Vendor address not persisted to DB (lat/lng only) | `app/vendor/profile/address/page.tsx` | ✅ Fixed — saves address_full |
| F11 | Verification review page status hardcoded as `pending` | `app/vendor/verification/review/page.tsx` | ✅ Fixed — reads `is_verified` from DB |
| F12 | Verification KTP blob URL memory leak | `app/vendor/verification/ktp/page.tsx` | ✅ Fixed — `revokeObjectURL` cleanup |
| F13 | `useVendors` falsy check excludes lat=0/lng=0 | `lib/services/useVendors.ts` | ✅ Fixed — strict null check |
| F14 | `Order` type missing `created_at` | `lib/services/useOrders.ts` | ✅ Fixed — added to type |
| F15 | `VendorProfile.users` missing `address_full` | `lib/services/useVendors.ts` | ✅ Fixed — added to type |

#### K.31.3. Known Gaps — Fixed in Phase 9.1 (15 Mei 2026)

| Gap | Description | Fix | Status |
|-----|-------------|-----|--------|
| RLS: Missing INSERT/UPDATE policies on all tables | Frontend mutations fail with 403 | Migration 0008 — 40+ policies across 10 tables | ✅ Fixed |
| Edge Function: Race condition in wallet update (read-then-write) | Concurrent releases overwrite each other | Atomic `credit_wallet` RPC function | ✅ Fixed |
| Edge Function: release-payment deprecated JWT endpoint | Legacy `/auth/v1/user` endpoint | Migrated to `supabase.auth.getUser()` | ✅ Fixed |
| `accepted_at`/`started_at` columns missing from `orders` | Milestone timestamps never shown | Added to schema + migration 0008 | ✅ Fixed |
| `handle_new_user` trigger | Google OAuth auto-creates user rows | Trigger `on_auth_user_created` in migration 0008 | ✅ Fixed |
| Auto-create wallet on registration | No wallet row for new users | Trigger `on_user_created_wallet` in migration 0008 | ✅ Fixed |
| Duplicate migration 0004/0005 | 0005 fails if 0004 ran first | Added `IF NOT EXISTS` to 0005 | ✅ Fixed |

#### K.31.4. Remaining Known Gaps (New Feature — Phase 10+)

| Gap | Description | Requires |
|-----|-------------|----------|
| Verification flow: No DB schema for KTP/certification documents | Upload stubs store nothing permanently | New `verification_documents` table + Storage bucket |
| `coverageRadius` and `operatingHours` not persisted | Vendor address form data lost on reload | Schema migration |
| Migration 0008 not yet applied to production DB | RLS policies are inert until migration runs | `supabase db push` or manual apply |

---

### K.32. Wallet Module Fixes (18 Mei 2026)

> 5 issues diperbaiki: bank details hilang saat withdraw, cache user tidak di-invalidate setelah admin approve, vendor "Tarik Saldo" button kosmetik, promo detail pakai raw Supabase client, topup invalidasi global.

#### K.32.1. Bank Details Persistence (Issue 🔴 #1)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/withdraw`, isi jumlah 50.000, pilih bank "BCA", isi rekening "1234567890", isi nama "Budi" | Form valid |
| 2 | Tap "Tarik" | Toast sukses, transaksi "Tertunda" muncul di riwayat |
| 3 | Cek row di `wallet_transactions` via SQL: `SELECT bank_name, account_number, account_holder FROM wallet_transactions WHERE type = 'withdrawal' ORDER BY created_at DESC LIMIT 1;` | `bank_name = 'BCA'`, `account_number = '1234567890'`, `account_holder = 'Budi'` |
| 4 | Buka `/admin/transactions` sebagai Admin | Transaksi withdrawal terbaru tampil dengan bank info |
| 5 | Kolom `bank_name`, `account_number`, `account_holder` ada di tabel | Migration 0010 sukses |
| 6 | **Regression:** Transaksi non-withdrawal (topup, payment) | Bank columns = NULL, tidak error |

#### K.32.2. Wallet Cache Invalidation After Admin Approve (Issue 🔴 #2)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, catat saldo di `/vendor/earnings` | Saldo tampil |
| 2 | Login sebagai Admin, buka `/admin/transactions` | Transaksi pending vendor tampil |
| 3 | Admin tap "Setujui" untuk transaksi vendor | Toast sukses |
| 4 | Kembali ke halaman Vendor (tanpa refresh manual) | Saldo **terupdate otomatis** (cache di-invalidate) |
| 5 | Cek bahwa `['wallet', userId]` di-invalidate | Query key pattern confirmed di `useApproveTransaction.onSuccess` |

#### K.32.3. Vendor "Tarik Saldo" Navigation (Issue 🟡 #3)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka `/vendor/earnings` | Card saldo muncul |
| 2 | Tap tombol "Tarik Saldo" di pojok kanan card | Navigasi ke `/wallet/withdraw` |
| 3 | Halaman withdraw muncul | Form jumlah, bank, rekening, nama tampil |
| 4 | **Regression:** Tombol tidak berubah styling | `bg-white/20 backdrop-blur-sm rounded-full`, arrow icon |

#### K.32.4. Promo Detail React Query Refactor (Issue 🟡 #4)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/promo?id=...` dengan ID promo valid | Hero card, discount %, countdown, terms tampil |
| 2 | Cek Network tab | Tidak ada `supabase.from('promos').select()` inline — data dari React Query cache |
| 3 | Buka promo yang sama lagi (navigasi kedua) | Instant load (cache hit), tanpa loading spinner |
| 4 | Buka `/wallet/promo?id=INVALID_ID` | "Promo tidak ditemukan" error state |
| 5 | Loading state | Loader2 spinner saat pertama fetch |
| 6 | **Regression:** Countdown timer masih jalan | "Berakhir dalam X hari Y jam" |
| 7 | **Regression:** "Gunakan Promo" button navigasi ke `/customer/search` | Berfungsi normal |

#### K.32.5. Topup/Withdraw Specific Invalidation (Issue 🟢 #5)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai Vendor, buka `/wallet` | Saldo & transaksi tampil |
| 2 | Tap "Top Up" → isi Rp 50.000 → submit | Toast sukses |
| 3 | Login sebagai **Vendor lain** di browser/device lain | Tidak ada invalidasi global — transaksi vendor lain tidak ter-refetch |
| 4 | Cek `onSuccess` di `useRequestTopup` | `invalidateQueries(['wallet-transactions', data.wallet_id])` — spesifik per wallet |
| 5 | Cek `onSuccess` di `useRequestWithdraw` | `invalidateQueries(['wallet-transactions', data.wallet_id])` — spesifik per wallet |

---

### K.33. Xendit Wallet Integration — Topup via Invoice & Withdraw via Disbursement (18 Mei 2026)

> Integrasi baru: Topup otomatis via Xendit Invoice, withdraw otomatis via Xendit Disbursement. Admin tidak perlu approve topup manual lagi (webhook otomatis credit balance).

#### K.33.1. New Edge Functions

| Function | verify_jwt | Description |
|----------|-----------|-------------|
| `create-topup-invoice` | `true` | Buat pending transaction + Xendit invoice, return invoice_url |
| `create-disbursement` | `true` | Panggil Xendit Disbursement API untuk kirim dana (admin only) |

#### K.33.2. Topup via Xendit Invoice

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/topup` | Saldo saat ini tampil di balance card |
| 2 | Pilih nominal Rp 100.000 | Input terisi, ringkasan "Jumlah Top Up Rp 100.000" |
| 3 | Info card "Pembayaran via Xendit" | Card emerald dengan icon ExternalLink |
| 4 | Tap "Top Up Rp 100.000" | Loading "Menyiapkan pembayaran..." |
| 5 | EF `create-topup-invoice` dipanggil | Insert `wallet_transactions` (type=topup, status=pending) + create Xendit invoice |
| 6 | Redirect ke halaman Xendit | URL = `https://checkout.xendit.co/...` |
| 7 | Jika Xendit error (saldo tidak cukup, dll) | Rollback: pending transaction dihapus, toast error |
| 8 | Selesaikan pembayaran di Xendit sandbox | Redirect ke `/wallet/topup/success?tx_id=...` |
| 9 | Halaman success | Polling setiap 2 detik, status loading "Memverifikasi Pembayaran" |
| 10 | Webhook `xendit-webhook` terima `PAID` untuk `external_id = topup_<tx_id>` | Update status = 'success', **credit wallet balance** |
| 11 | Halaman berubah jadi "Top Up Berhasil!" | CheckCircle icon, tombol "Kembali ke Dompet" |
| 12 | Buka `/wallet` | Saldo bertambah, transaksi topup dengan icon emerald + "success" |
| 13 | **Idempotency:** Kirim webhook yang sama dua kali | Kedua kalinya di-skip, tidak ada double-credit |
| 14 | **Expired:** Invoice tidak dibayar, webhook `EXPIRED` | Transaksi di-update jadi `failed` |
| 15 | **Fallback timeout:** Polling 30x (60 detik) tanpa webhook | Halaman fallback "Pembayaran Belum Dikonfirmasi" |

#### K.33.3. Withdraw via Xendit Disbursement

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/withdraw` | Saldo tersedia tampil |
| 2 | Isi jumlah 50.000, pilih bank "BCA", norek "1234567890", nama "Budi" | Form valid, tombol "Tarik" aktif |
| 3 | Tap "Tarik" | Insert `wallet_transactions` (type=withdrawal, status=pending, bank_name, account_number terisi) |
| 4 | Login sebagai Admin, buka `/admin/transactions` | Transaksi withdrawal pending tampil dengan info bank |
| 5 | Admin tap **"Setujui"** | Panggil `create-disbursement` EF |
| 6 | EF verify JWT + role (admin OR verified vendor w/ amount ≤ 5jt) | 403 jika tidak authorized |
| 7 | EF validasi: type=withdrawal, status=pending, bank details lengkap | Validasi lolos |
| 8 | EF: **debit balance** via `credit_wallet(p_wallet_id, -amount)` | Balance terpotong (server-side, atomic) |
| 9 | EF panggil Xendit Disbursement API `POST /v2/disbursements` | Request body: bank_code, account_number, account_holder_name, amount |
| 10 | Xendit return success | Transaction status = 'success' |
| 11 | Xendit return error → EF **refund** via `credit_wallet(p_wallet_id, +amount)` | Balance kembali, tx tetap pending |
| 12 | Cek wallet vendor | Balance sudah terpotong (server-side) |
| 13 | **Error:** Transaksi sudah diproses sebelumnya | EF return 400 "Transaction already processed" |
| 14 | **Error:** Transaksi bukan withdrawal | EF return 400 "Not a withdrawal transaction" |

#### K.33.4. Regression — Topup Manual (via Admin) masih berfungsi

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Insert `wallet_transactions` langsung: `INSERT INTO wallet_transactions (wallet_id, type, amount, status) VALUES ('<WALLET_ID>', 'topup', 25000, 'pending')` | Transaksi pending muncul di admin |
| 2 | Admin tap "Setujui" untuk topup manual | Menggunakan `useApproveTransaction` (bukan disbursement), balance bertambah |
| 3 | **Regression:** Topup Xendit tetap terproses via webhook | Kedua flow tidak konflik |

### K.34. Withdraw Refactor — Server-side Deduction + Auto-Disburse (18 Mei 2026)

> **3 perubahan besar:** (1) Balance deduction dipindah dari client ke `create-disbursement` EF, (2) Verified vendor auto-disburse (skip admin), (3) Disbursement webhook handler + refund otomatis.

#### K.34.1. Balance Deduction Server-Side (Atomic)

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Admin tap "Setujui" untuk withdrawal pending | Panggil `create-disbursement` EF |
| 2 | EF: **debit balance** via `credit_wallet(p_wallet_id, -amount)` | Balance terpotong SEBELUM panggil Xendit |
| 3 | EF: panggil Xendit Disbursement API | Xendit process |
| 4 | Xendit sukses → EF update status `success` | Balance sudah terpotong, tidak ada double-debit |
| 5 | Xendit gagal → EF **refund** via `credit_wallet(p_wallet_id, +amount)` | Balance kembali seperti semula |
| 6 | Cek `useApproveWithdrawDisbursement` client | **Tidak ada** balance deduction di client — hanya panggil EF |
| 7 | **Regression:** Admin approve topup manual | Tidak terpengaruh — masih pakai `useApproveTransaction` |

#### K.34.2. Auto-Disburse untuk Verified Vendor

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Login sebagai **verified vendor** (is_verified=true), buka `/wallet/withdraw` | Info "Vendor terverifikasi — dana dikirim otomatis" muncul |
| 2 | Isi jumlah Rp 50.000 (di bawah Rp 5.000.000) | Tombol berlabel "Tarik Rp 50.000" |
| 3 | Tap "Tarik" | Create pending tx via RPC → langsung panggil `create-disbursement` EF |
| 4 | EF: auth check — vendor verified, amount ≤ 5jt, tx milik vendor sendiri → **allow** | 200 OK, balance terpotong |
| 5 | Toast "Penarikan berhasil! Dana dikirim ke rekening Anda" | Redirect ke `/wallet` |
| 6 | Cek wallet balance | Terpotong otomatis |
| 7 | Cek `wallet_transactions` | Status = `success` (langsung, tanpa pending) |
| 8 | **Flow tanpa auto-disburse:** Login sebagai vendor **unverified** | Info "Penarikan diproses oleh admin" |
| 9 | Unverified vendor tap "Tarik" | Status = `pending`, perlu admin approve |
| 10 | **Threshold:** Verified vendor request Rp 6.000.000 (di atas 5jt) | Harus pending + admin approve (auto-disburse skip) |

#### K.34.3. Disbursement Webhook — Xendit Callback

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Xendit kirim callback `status=COMPLETED` dengan `external_id=wd_{tx_id}` | Webhook log "Disbursement completed", tidak ada perubahan status |
| 2 | Xendit kirim callback `status=FAILED` dengan `external_id=wd_{tx_id}` | Webhook cek status tx → refund balance via `credit_wallet` |
| 3 | Cek wallet setelah refund | Balance kembali (amount direfund) |
| 4 | Cek `wallet_transactions` setelah refund | Status jadi `failed` |
| 5 | **Idempotency:** Kirim callback FAILED dua kali | Kedua kalinya skip (status already 'failed') |

#### K.34.4. Withdraw Page — UX Improvements

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka `/wallet/withdraw` sebagai **verified vendor** | Zap icon + "Vendor terverifikasi — dana dikirim otomatis" |
| 2 | Buka `/wallet/withdraw` sebagai **unverified vendor** | Clock icon + "Penarikan diproses oleh admin" |
| 3 | Isi amount valid | Summary card: Ringkasan (penarikan, biaya gratis, sisa saldo) |
| 4 | Summary info box: auto vs manual | Auto: "dana langsung dikirim", Manual: "admin akan memproses 1-3 hari" |
| 5 | Balance 0 + unverified | Info card: "Lengkapi verifikasi untuk penarikan otomatis" |
| 6 | Bank select | BottomSheetSelect (bukan native `<select>`) |
| 7 | **Error:** Amount > balance | "Melebihi saldo tersedia", tombol disabled |
| 8 | **Error:** Amount < 10.000 | Toast "Minimal penarikan Rp 10.000" |

#### K.34.5. Regression — Withdraw Flow End-to-End

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Flow lengkap: User request → pending tx → Admin approve → EF debit → Xendit → success | Semua langkah berjalan, balance terpotong sekali |
| 2 | Flow auto: Verified vendor request → auto-disburse → Xendit → success | Balance terpotong, tx langsung success |
| 3 | Flow gagal: Xendit error → EF refund → balance kembali | Balance tidak hilang, tx tetap pending |
| 4 | Flow webhook: Xendit FAILED callback → refund otomatis | Balance refund, tx status failed |
| 5 | **Idempotency:** Semua panggilan idempoten | Tidak ada double-debit, double-refund, atau double-credit |

#### K.34.6. Deploy & Verify Updated Edge Functions

```bash
# Deploy updated functions
npx supabase functions deploy create-disbursement
npx supabase functions deploy xendit-webhook

# Verify logs
npx supabase functions logs create-disbursement --tail
npx supabase functions logs xendit-webhook --tail
```

---

#### K.33.5. Deploy & Verify Edge Functions via Supabase CLI

```bash
# 1. Deploy semua function
npx supabase functions deploy create-topup-invoice
npx supabase functions deploy create-disbursement
npx supabase functions deploy xendit-webhook

# 2. Verifikasi semua function terdeploy
npx supabase functions list

# 3. Test create-topup-invoice tanpa auth (harus 401)
curl -s -X POST "https://ajteskgdggxwefcrncuu.supabase.co/functions/v1/create-topup-invoice" \
  -H "Content-Type: application/json" \
  -d '{"wallet_id":"test","amount":50000}'
# Expected: 401 Unauthorized

# 4. Test xendit-webhook tanpa callback token (harus 401)
curl -s -X POST "https://ajteskgdggxwefcrncuu.supabase.co/functions/v1/xendit-webhook" \
  -H "Content-Type: application/json" \
  -d '{"external_id":"test_123","status":"PAID"}'
# Expected: 401 Unauthorized

# 5. Cek logs realtime
npx supabase functions logs xendit-webhook --tail
npx supabase functions logs create-topup-invoice --tail
```

---

### K.35 — KYC Verification System

#### K.35.1. Vendor KTP Upload

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Vendor buka `/vendor/verification` | Halaman intro verifikasi muncul |
| 2 | Tap "Mulai Verifikasi" → `/vendor/verification/ktp` | Form upload KTP muncul |
| 3 | Upload foto KTP (JPG/PNG) | Preview gambar muncul |
| 4 | Isi NIK (16 digit) + Nama sesuai KTP | Input terisi |
| 5 | Tap "Simpan & Lanjutkan" | Toast "Dokumen KTP berhasil disimpan", redirect ke `/vendor/verification/certification` |
| 6 | Cek DB: `verification_submissions` | Row baru dengan `user_id` vendor, `status` = 'pending', `nik`, `ktp_name`, `ktp_url` terisi |
| 7 | Cek storage: `verification/{userId}/ktp/` | File KTP terupload |
| 8 | **Error:** Upload gagal | Toast error, tidak redirect |
| 9 | **Error:** NIK < 16 digit | Form validation (jika ada) |

#### K.35.2. Vendor Certificate Upload

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Vendor di `/vendor/verification/certification` | Form sertifikat muncul, `submission` ter-load dari DB |
| 2 | Upload file sertifikat (PDF/image) | Preview muncul (image) atau icon PDF |
| 3 | Isi Nama Sertifikat, Penerbit, Tahun | Input terisi |
| 4 | Tap "Simpan & Lanjutkan" | Toast "Sertifikat berhasil disimpan", redirect ke `/vendor/verification/review` |
| 5 | Cek DB: `verification_submissions` | Row yang sama terupdate: `certificate_url`, `certificate_name`, `certificate_issuer`, `certificate_year` |
| 6 | Cek storage: `verification/{userId}/cert/` | File sertifikat terupload |
| 7 | **Optional:** Tap "Lewati" tanpa upload sertifikat | Redirect ke review, `certificate_url` = null di DB |
| 8 | **Error:** Upload file gagal | Toast "Gagal upload file sertifikat", tidak redirect |
| 9 | **Edge:** File PDF > 5MB | Harusnya ditolak storage |
| 10 | **Edge:** Submit tanpa submission (guard) | Toast "Data verifikasi tidak ditemukan" |

#### K.35.3. Vendor Verification Review

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Vendor di `/vendor/verification/review` | Status "Menunggu Review" dengan icon pending |
| 2 | Cek tampilan | KTP info tampil (NIK, nama, foto KTP), sertifikat info tampil (jika diisi) |
| 3 | **Status approved** | Badge hijau "Terverifikasi", tombol ke dashboard |
| 4 | **Status rejected** | Badge merah "Ditolak", alasan penolakan tampil, tombol upload ulang |

#### K.35.4. Admin Vendor Detail Page

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Admin login → `/admin/vendors` | Daftar vendor muncul, masing2 card ada link ke detail |
| 2 | Tap card vendor → `/admin/vendors/detail?id={userId}` | Halaman detail vendor tampil dalam 3 detik |
| 3 | Loading state | Skeleton loading muncul saat fetch |
| 4 | Error state | "Vendor tidak ditemukan" dengan tombol Kembali |
| 5 | Informasi vendor | Nama, email, phone, spesialisasi tampil |
| 6 | Status badge | Badge sesuai status (Menunggu Review / Terverifikasi / Ditolak) |
| 7 | Dokumen KTP | Foto KTP tampil, NIK + Nama terlihat |
| 8 | **Image error fallback** | Jika gambar gagal load, tampil "Gagal memuat gambar" + link "Buka di tab baru" |
| 9 | **Certificate section** | Hanya muncul jika ada `certificate_url` atau `certificate_name` |
| 10 | **Certificate image** | Jika image format → preview; jika PDF → FileText icon + link buka |
| 11 | Rejection reason | Hanya muncul jika `verification_status` = 'rejected' |

#### K.35.5. Admin Approve/Reject Flow

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Admin lihat submission status 'pending' | Tombol "Setujui" dan "Tolak" muncul |
| 2 | Tap "Setujui" | Toast "Vendor berhasil diverifikasi" |
| 3 | Cek DB: `verification_submissions` | `status` = 'approved', `reviewed_at`, `reviewed_by` terisi |
| 4 | Cek DB: `vendor_profiles` | `is_verified` = true, `verification_status` = 'approved', `rejection_reason` = null |
| 5 | Tap "Tolak" | Modal konfirmasi muncul |
| 6 | Isi alasan, tap "Tolak" | Toast "Verifikasi ditolak" |
| 7 | Cek DB: `verification_submissions` | `status` = 'rejected', `rejection_reason` terisi |
| 8 | Cek DB: `vendor_profiles` | `is_verified` = false, `verification_status` = 'rejected', `rejection_reason` terisi |
| 9 | **Edge:** Tap "Batal" di modal reject | Modal tertutup, tidak ada perubahan |
| 10 | **Edge:** Reject tanpa alasan | Tombol "Tolak" disabled |
| 11 | **Security:** Non-admin coba akses | AuthGuard redirect ke login |

#### K.35.6. Full KYC Flow Integration

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Vendor upload KTP + sertifikat | Kedua file di storage, data di `verification_submissions` |
| 2 | Admin approve | Submission → 'approved', vendor_profiles → 'approved' |
| 3 | Vendor buka review page | Badge "Terverifikasi" |
| 4 | Admin reject | Submission → 'rejected', vendor_profiles → 'rejected' |
| 5 | Vendor buka review page | Badge "Ditolak" + alasan |
| 6 | Build verification | `npm run build` → 0 errors |

#### K.36. Custom DivIcon Vendor Map Markers

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Buka halaman dengan VendorMap (customer home, customer vendor) | Map render dengan marker custom (card putih + nama + spesialisasi + pin dot emerald) |
| 2 | Cek marker card | Menampilkan nama vendor (bold) + spesialisasi (abu-abu, lebih kecil) |
| 3 | Cek pin dot | Lingkaran gradient emerald (`#059669`→`#047857`) dengan border putih |
| 4 | Hover card | Border card berubah ke emerald (`#10b981`) |
| 5 | Klik marker | `onVendorClick` terpanggil, popup muncul dengan nama + spesialisasi |
| 6 | Pin berdekatan | MarkerCluster mengelompokkan pin dengan `maxClusterRadius: 60` |
| 7 | Zoom in ke cluster | Cluster pecah, jadi DivIcon individual |
| 8 | Mobile viewport | Card tetap terbaca, `pointer-events: none` pada wrapper tidak mengganggu tap |
| 9 | HTML escaping | Nama vendor mengandung karakter spesial (`&<>"`) → tampil aman |
| 10 | Build verification | `npm run build` → 0 errors |

