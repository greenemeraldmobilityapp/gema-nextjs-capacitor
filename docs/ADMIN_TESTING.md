# GEMA — Admin Module Testing Checklist

> Status: ✅ = Lolos | ❌ = Gagal | ☐ = Belum di-test
> Tanggal: 18 Mei 2026

---

## 1. Setup Akun Admin

### 1.1. Prasyarat — Migration RLS

Jalankan SQL berikut di Supabase SQL Editor sebelum testing:

```sql
-- Function is_admin() untuk RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;
```

### 1.2. Buat Admin

| Langkah | Aksi | Detail |
|---------|------|--------|
| 1 | Buka Supabase Dashboard → Authentication → Add User | Input email & password |
| 2 | Email: `admin@gema.com`, Password: `admin123` | Centang **"Auto Confirm User"** |
| 3 | Dapatkan UUID | `SELECT id, email FROM auth.users WHERE email = 'admin@gema.com';` |
| 4 | Set role admin | `UPDATE public.users SET role = 'admin', role_frozen = true WHERE email = 'admin@gema.com';` |
| 5 | Login ke app | `admin@gema.com` / `admin123` → redirect ke `/admin/dashboard` |

### 1.3. Membuat Data Test

Jalankan script berikut di SQL Editor (ganti UUID sesuai data Anda):

```sql
-- ===== ISI DATA TEST UNTUK ADMIN MODULE =====

-- 1. Buat vendor profile & 8 kategori services
-- Ganti <UUID_VENDOR_1> dengan UUID dari akun vendor Anda

INSERT INTO vendor_profiles (user_id, specialization, bio, rating, total_jobs, is_verified)
VALUES
  ('<UUID_VENDOR_1>', 'Tukang Bangunan', 'Berpengalaman 15+ tahun', 4.5, 50, false);

INSERT INTO services (vendor_id, title, category, price, description)
VALUES
  ('<UUID_VENDOR_1>', 'Renovasi Rumah', 'tukang-bangunan', 5000000, 'Renovasi total'),
  ('<UUID_VENDOR_1>', 'Pasang Keramik', 'tukang-bangunan', 150000, 'Pemasangan keramik lantai');

-- 2. Buat order test
-- Ganti <UUID_CUSTOMER> dengan UUID dari akun customer Anda

INSERT INTO orders (customer_id, vendor_id, service_id, service_category, service_name, scheduled_date, scheduled_time, service_address, base_amount, platform_fee, vendor_payout, total_amount, payment_status, order_status)
VALUES
  ('<UUID_CUSTOMER>', '<UUID_VENDOR_1>', (SELECT id FROM services WHERE vendor_id = '<UUID_VENDOR_1>' LIMIT 1), 'tukang-bangunan', 'Renovasi Rumah', CURRENT_DATE + 2, '09:00', 'Jl. Test No 1', 5000000, 250000, 4750000, 5250000, 'escrow', 'accepted');

-- 3. Buat wallet + transaksi pending
INSERT INTO wallets (user_id, balance)
VALUES
  ('<UUID_VENDOR_1>', 500000),
  ('<UUID_CUSTOMER>', 1000000);

INSERT INTO wallet_transactions (wallet_id, type, amount, status)
VALUES
  ((SELECT id FROM wallets WHERE user_id = '<UUID_VENDOR_1>'), 'withdrawal', -200000, 'pending'),
  ((SELECT id FROM wallets WHERE user_id = '<UUID_CUSTOMER>'), 'topup', 500000, 'pending');

-- 4. Buat dispute test
INSERT INTO disputes (order_id, opened_by, status)
VALUES
  ((SELECT id FROM orders WHERE vendor_id = '<UUID_VENDOR_1>' LIMIT 1), '<UUID_CUSTOMER>', 'open');
```

---

## 2. Testing Halaman Admin

### 2.1. Route Protection & Layout

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.1.1 | Login sebagai Customer, akses `/admin/dashboard` | Redirect ke `/customer/home` |
| 2.1.2 | Login sebagai Vendor, akses `/admin/dashboard` | Redirect ke `/vendor/dashboard` |
| 2.1.3 | Login sebagai Admin | Redirect ke `/admin/dashboard` |
| 2.1.4 | Buka `/admin` (root) | Redirect ke `/admin/dashboard` |
| 2.1.5 | Cek bottom nav | 7 tab: Dashboard, Fraud, Vendor, Sengketa, Pesanan, Transaksi, Promo |
| 2.1.6 | Tap setiap tab bottom nav | Navigasi ke halaman sesuai, tab aktif bg-emerald-100 |
| 2.1.7 | Header emerald di setiap halaman | Icon User di kanan → tap → `/admin/profile` |

### 2.2. Dashboard (`/admin/dashboard`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.2.1 | Buka halaman dashboard | 6 stat cards muncul di grid 2 kolom |
| 2.2.2 | Total User | = count `users` table |
| 2.2.3 | Jumlah Vendor | = count `vendor_profiles` table |
| 2.2.4 | Pesanan | = count `orders` table |
| 2.2.5 | Pendapatan | = sum `total_amount` WHERE `payment_status = 'released'` |
| 2.2.6 | Verifikasi Tertunda | = count `vendor_profiles` WHERE `is_verified = false` |
| 2.2.7 | Sengketa Aktif | = count `disputes` WHERE `status = 'open'` |
| 2.2.8 | Jika ada transaksi pending | Card "Transaksi Tertunda" muncul di bawah grid |
| 2.2.9 | Tap "Transaksi Tertunda" | Navigasi ke `/admin/transactions` |
| 2.2.10 | Error state: koneksi bermasalah | Alert "Gagal memuat data dashboard" merah |
| 2.2.11 | Loading state | Spinner animasi |

### 2.3. Vendor Management (`/admin/vendors`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.3.1 | Buka halaman vendors | Daftar semua vendor dari database |
| 2.3.2 | Tab "Semua" | Semua vendor tampil tanpa filter |
| 2.3.3 | Tab "Tertunda" | Hanya vendor `is_verified = false` |
| 2.3.4 | Tab "Terverifikasi" | Hanya vendor `is_verified = true` |
| 2.3.5 | Search bar | Filter by nama & specialization |
| 2.3.6 | Tap **"Setujui"** pada vendor tertunda | Toast "Vendor berhasil diverifikasi" |
| 2.3.7 | Cek vendor setelah disetujui | Badge berubah jadi "Aktif" (emerald) |
| 2.3.8 | Tap **"Nonaktifkan"** | Toast, badge berubah "Tertunda" |
| 2.3.9 | Cek customer home setelah verifikasi | Vendor muncul di `/customer/home` + `/customer/search` |
| 2.3.10 | Cek vendor masih muncul di `/admin/vendors` | Vendor tetap di list (hanya status berubah) |
| 2.3.11 | Empty: tidak ada vendor | "Belum ada vendor" |
| 2.3.12 | Empty: semua sudah terverifikasi di tab Tertunda | "Semua vendor sudah terverifikasi" |
| 2.3.13 | Loading state | Spinner |

### 2.4. Orders (`/admin/orders`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.4.1 | Buka halaman orders | Daftar semua orders platform-wide |
| 2.4.2 | Tab filter status | Semua / Tertunda / Diterima / Berjalan / Selesai / Dibatalkan |
| 2.4.3 | Search | Filter by service name & customer name |
| 2.4.4 | Card order | Nama layanan, kategori, customer, nominal, status order + payment badge, tanggal |
| 2.4.5 | Order dari customer/vendor | Tampil dengan data dari database |
| 2.4.6 | Empty: tidak ada pesanan | "Tidak ada pesanan" |
| 2.4.7 | Loading state | Spinner |

### 2.5. Disputes (`/admin/disputes`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.5.1 | Buka halaman disputes | Daftar semua sengketa dari database |
| 2.5.2 | Tab filter | Semua / Aktif / Selesai |
| 2.5.3 | Card sengketa aktif | Nama layanan, pembuka (nama user), tanggal, nominal |
| 2.5.4 | Input resolusi + **"Selesaikan Sengketa"** | Toast sukses, status "Selesai" |
| 2.5.5 | Card sengketa selesai | Resolution text tampil |
| 2.5.6 | Validation: submit tanpa catatan | Toast "Harap isi catatan resolusi" |
| 2.5.7 | Empty: tidak ada sengketa | "Tidak ada sengketa" |
| 2.5.8 | Loading state | Spinner |

### 2.6. Wallet Transactions (`/admin/transactions`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.6.1 | Buka halaman transactions | Daftar semua transaksi wallet |
| 2.6.2 | Filter | Semua / Tertunda / Berhasil / Gagal |
| 2.6.3 | Transaksi pending (topup) | Tombol **"Setujui"** + **"Tolak"** |
| 2.6.4 | Transaksi pending (withdrawal) | Tombol **"Setujui"** + **"Tolak"** |
| 2.6.5 | Tap **"Setujui"** topup | Toast, status "Berhasil", balance wallet **BERTAMBAH** |
| 2.6.6 | Verifikasi balance | Cek di halaman wallet user → saldo bertambah |
| 2.6.7 | Tap **"Setujui"** withdrawal | Toast, status "Berhasil", balance wallet **BERKURANG** (amount negatif) |
| 2.6.8 | Verifikasi balance withdrawal | Cek halaman wallet → saldo berkurang sesuai jumlah |
| 2.6.9 | Tap **"Tolak"** | Toast, status "Gagal" |
| 2.6.10 | Transaksi non-pending | Tidak ada tombol aksi |
| 2.6.11 | Empty: tidak ada transaksi | "Tidak ada transaksi" |
| 2.6.12 | Loading state | Spinner |
| 2.6.13 | Amount display format | Positive = `+Rp`, Negative = `-Rp` (warna emerald/red sesuai) |

### 2.7. Fraud Alerts (`/admin/fraud`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.7.1 | Buka halaman fraud | Daftar fraud alerts dari database |
| 2.7.2 | Severity colors | Critical=red, High=orange, Medium=yellow, Low=gray |
| 2.7.3 | Filter status | Terbuka / Diselidiki / Selesai / Positif Palsu |
| 2.7.4 | Search | Filter by title & description |
| 2.7.5 | Expand card | Metadata JSON tampil |
| 2.7.6 | Tap **"Selidiki"** | Status → "Diselidiki" |
| 2.7.7 | Tap **"Selesai"** | Status → "Selesai", resolved_at terisi |
| 2.7.8 | Tap **"Positif Palsu"** | Status → "Positif Palsu" |
| 2.7.9 | Auto-refresh setiap 30 detik | Data terbaru muncul tanpa refresh manual |
| 2.7.10 | Empty: tidak ada fraud alert | "Tidak ada peringatan fraud" |
| 2.7.11 | Loading state | Spinner |

### 2.8. Promo Management (`/admin/promos`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.8.1 | Buka halaman promos | Daftar promo dari database |
| 2.8.2 | Tap **"Tambah"** | Form create promo muncul |
| 2.8.3 | Isi judul, deskripsi, diskon → **"Simpan Promo"** | Toast sukses, promo baru di list |
| 2.8.4 | Validation: submit form kosong | Toast error |
| 2.8.5 | Toggle aktif/nonaktif | Status berubah, toast sesuai |
| 2.8.6 | Tap **"Hapus"** | Promo dihapus, toast sukses |
| 2.8.7 | Verifikasi di customer home | Promo aktif muncul di `/customer/home` |
| 2.8.8 | Nonaktifkan promo | Promo hilang dari customer home |
| 2.8.9 | Empty: belum ada promo | "Belum ada promo" |
| 2.8.10 | Loading state | Spinner |

### 2.9. Admin Profile (`/admin/profile`)

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 2.9.1 | Buka `/admin/profile` | Header emerald, back button ke `/admin/dashboard` |
| 2.9.2 | Info card | Avatar circle, nama admin dari auth,  role badge "Admin" |
| 2.9.3 | Email row | Tampilkan email admin |
| 2.9.4 | Tap **"Keluar"** | Sign out, redirect ke `/login` |
| 2.9.5 | After logout | Zustand store cleared, tidak bisa akses `/admin/*` |

---

## 3. Cross-Module Integration Testing

### 3.1. Vendor Registration → Admin Verification → Customer Discovery

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Register sebagai Vendor baru | `vendor_profiles.is_verified = false` |
| 2 | Login sebagai Admin → `/admin/vendors` | Vendor muncul di tab "Tertunda" |
| 3 | Tap **"Setujui"** | Toast "Vendor berhasil diverifikasi" |
| 4 | Login sebagai Customer | Vendor muncul di `/customer/home` (Vendor Terdekat) |
| 5 | Buka `/customer/search` | Vendor muncul dengan category filter yang sesuai |
| 6 | Tap map toggle di home | Leaflet map muncul dengan marker vendor |
| 7 | Cek `/customer/vendor?id=...` | Profil vendor tampil dengan data dari DB |

### 3.2. Customer Booking → Admin Order Oversight

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Customer booking → payment | Order terbuat di `orders` table |
| 2 | Login sebagai Admin → `/admin/orders` | Order baru muncul di daftar |
| 3 | Verifikasi data order | Nama layanan, customer, nominal, status sesuai |
| 4 | Login sebagai Vendor → accept | Order status → "accepted" |
| 5 | Admin refresh orders | Status badge berubah jadi "Diterima" |

### 3.3. Dispute → Admin Resolution

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Customer buka dispute via order | `disputes` row terbuat dengan `status = 'open'` |
| 2 | Admin buka `/admin/disputes` | Dispute baru muncul |
| 3 | Admin isi resolusi + **"Selesaikan Sengketa"** | Toast sukses, status "Selesai" |
| 4 | Cek customer/vendor page | Dispute status reflected (tidak ada UI dispute di sisi user saat ini) |

### 3.4. Topup → Admin Approval → Wallet Update

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Customer/vendor buka `/wallet/topup` | Ajukan topup Rp 100.000 |
| 2 | `wallet_transactions` | Row baru `type='topup', amount=100000, status='pending'` |
| 3 | Admin buka `/admin/transactions` | Transaksi "Tertunda" muncul dengan amount `+Rp 100.000` |
| 4 | Admin tap **"Setujui"** | Toast sukses, status → "Berhasil" |
| 5 | Cek wallet user | Balance **bertambah** Rp 100.000 |
| 6 | Cek riwayat transaksi user | Transaksi muncul dengan status "Berhasil" |

### 3.5. Withdrawal → Admin Approval → Wallet Debit

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Customer/vendor buka `/wallet/withdraw` | Ajukan withdraw Rp 50.000 |
| 2 | `wallet_transactions` | Row baru `type='withdrawal', amount=-50000, status='pending'` |
| 3 | Admin buka `/admin/transactions` | Transaksi "Tertunda" dengan amount `-Rp 50.000` |
| 4 | Admin tap **"Setujui"** | Toast sukses, status → "Berhasil" |
| 5 | Cek wallet user | Balance **berkurang** Rp 50.000 (amount -50000) |
| 6 | Cek riwayat transaksi | Transaksi muncul dengan status "Berhasil" |

### 3.6. Promo → Admin CRUD → Customer Display

| Langkah | Skenario | Expected Result |
|---------|----------|----------------|
| 1 | Admin buka `/admin/promos` | Daftar promo |
| 2 | Admin buat promo baru (diskon 30%) | Toast sukses |
| 3 | Login sebagai Customer → `/customer/home` | Promo banner muncul dengan diskon 30% |
| 4 | Admin nonaktifkan promo | Status berubah jadi tidak aktif |
| 5 | Customer refresh home | Promo banner hilang (fallback ke static) |
| 6 | Admin hapus promo | Toast sukses |
| 7 | Customer refresh home | Promo benar-benar tidak muncul |

---

## 4. Edge Cases & Error States

### 4.1. Vendor Management

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 4.1.1 | Verifikasi vendor yang sudah terverifikasi | Button berubah jadi "Nonaktifkan" |
| 4.1.2 | Nonaktifkan → Setujui lagi | Vendor aktif kembali |
| 4.1.3 | Search dengan string tidak cocok | "Vendor tidak ditemukan" |
| 4.1.4 | Network offline saat approve | Toast "Gagal memperbarui status vendor" |
| 4.1.5 | Double-click "Setujui" cepat | Hanya 1 mutation jalan (isPending guard) |

### 4.2. Transactions

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 4.2.1 | Approve transaksi yang sudah success | Tidak ada tombol aksi (hanya pending) |
| 4.2.2 | Reject → Approve lagi | Tidak bisa (status sudah failed) |
| 4.2.3 | Topup amount 0 | Cegah di form topup, tidak relevan di admin |
| 4.2.4 | Network offline saat approve | Toast "Gagal menyetujui transaksi" |
| 4.2.5 | Double-click "Setujui" | isPending guard mencegah duplicate |

### 4.3. Disputes

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 4.3.1 | Resolve dispute yang sudah selesai | Tidak ada tombol "Selesaikan" |
| 4.3.2 | Submit resolusi kosong | Toast "Harap isi catatan resolusi" |
| 4.3.3 | Network offline | Toast "Gagal menyelesaikan sengketa" |

### 4.4. Fraud Alerts

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 4.4.1 | Investigate → Resolve sequence | Status: open → investigating → resolved |
| 4.4.2 | Investigate → False Positive | Status: open → investigating → false_positive |
| 4.4.3 | Open → langsung Resolve | Bisa (skip investigating) |
| 4.4.4 | Resolved alert → coba Investigate lagi | Tombol aksi hilang (resolved/false_positive tidak punya action) |
| 4.4.5 | Filter + search kombinasi | Filter based on status dan search keyword |

### 4.5. Dashboard

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 4.5.1 | DB kosong (no users, vendors, orders) | Semua stat = 0, pendingVerifications = 0 |
| 4.5.2 | Hanya data customer | totalUsers > 0, totalVendors = 0 |
| 4.5.3 | Banyak data (stress test) | Semua count queries jalan tanpa timeout |

---

## 5. RLS Policy Verification

### 5.1. Admin Access

| Test | SQL | Expected |
|------|-----|----------|
| 5.1.1 | `SELECT * FROM users` | Admin bisa lihat semua users |
| 5.1.2 | `UPDATE vendor_profiles SET is_verified = true` | Admin bisa update |
| 5.1.3 | `UPDATE wallet_transactions SET status = 'success'` | Admin bisa approve/reject |
| 5.1.4 | `INSERT INTO promos` | Admin bisa create promo |
| 5.1.5 | `DELETE FROM promos` | Admin bisa delete promo |

### 5.2. Non-Admin Blocked

| Test | SQL (sebagai customer/vendor) | Expected |
|------|-----|----------|
| 5.2.1 | `UPDATE vendor_profiles SET is_verified = true` | 403 Forbidden |
| 5.2.2 | `UPDATE wallet_transactions SET status = 'success'` | 403 Forbidden |
| 5.2.3 | `DELETE FROM promos` | 403 Forbidden |

---

## 6. Performance & Reliability

| Test | Langkah | Expected Result |
|------|---------|-----------------|
| 6.1 | Dashboard page load | < 2 detik (8 sequential count queries) |
| 6.2 | Vendor list with 100+ vendors | Search & filter responsif |
| 6.3 | Orders list with 1000+ orders | Pagination atau lazy loading (saat ini semua data) |
| 6.4 | Auto-refresh fraud (30s) | Tidak ada memory leak atau duplicate requests |

---

## 7. Test Log

| Tanggal | Tester | Skenario | Status | Catatan |
|---------|--------|----------|--------|---------|
| 18/05/2026 | | | ☐ | |

