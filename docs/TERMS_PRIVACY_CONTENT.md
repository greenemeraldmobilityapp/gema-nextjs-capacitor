# Syarat & Ketentuan & Kebijakan Privasi — Rencana Konten

## Routing

| Halaman | Path | File |
|---------|------|------|
| Syarat & Ketentuan | `/terms` | `app/terms/page.tsx` |
| Kebijakan Privasi | `/privacy` | `app/privacy/page.tsx` |

## Auth

Kedua halaman harus **public** (dapat diakses tanpa login) karena link muncul di
halaman register dan login. AuthGuard (`components/auth/AuthGuard.tsx`) perlu
ditambahi:

```ts
const AUTH_PAGES = [
  '/login', '/register', '/onboarding', '/forgot-password',
  '/update-password', '/terms', '/privacy',
];
```

## Link Placement

| Halaman | Link | Posisi |
|---------|------|--------|
| **Register** | ✅ Sudah ada | Di bawah tombol Daftar, sebelah checkbox S&K |
| **Login** | ✅ Akan ditambah | Di bawah tombol Masuk, teks kecil |

---

## 1. Syarat & Ketentuan (`/terms`)

### Layout
- Back link ke halaman sebelumnya (router.back)
- Judul halaman
- Daftar pasal dalam Card + CardContent (scrollable)

### Konten (16 pasal)

| # | Pasal | Isi |
|---|-------|-----|
| 1 | **Definisi** | GEMA, Pelanggan, Mitra, Layanan, Pesanan, GemaPay, Saldo GemaPay, Sistem Escrow, Biaya Layanan, Xendit |
| 2 | **Akun Pengguna** | Registrasi + verifikasi email, kerahasiaan kredensial, larangan akun ganda, penonaktifan akun oleh GEMA |
| 3 | **Verifikasi Mitra** | Proses verifikasi KTP & sertifikasi, hak GEMA menolak/menunda, kewajiban update data |
| 4 | **Layanan** | Mekanisme pemesanan, kewajiban Mitra menyelesaikan, kewajiban Pelanggan membayar, perubahan/penambahan pesanan |
| 5 | **Biaya & Pembayaran** | Struktur biaya, Sistem Escrow (dana ditahan sampai konfirmasi), GemaPay (topup, withdraw, promo), gateway Xendit |
| 6 | **Pembatalan** | Sebelum Mitra berangkat vs setelah; konsekuensi biaya pembatalan; pembatalan sepihak oleh Mitra (denda) |
| 7 | **Pengembalian Dana** | Syarat refund penuh/sebagian, escrow release process, refund ke GemaPay, biaya administrasi, timeline |
| 8 | **Penyelesaian Pekerjaan** | Konfirmasi selesai oleh Pelanggan, auto-release escrow jika tidak ada konfirmasi dalam X jam |
| 9 | **Sengketa** | Mediasi via GEMA, batas waktu pengajuan sengketa (max 3 hari), bukti (foto/chat), keputusan final GEMA, fraud detection |
| 10 | **Ulasan & Rating** | Ulasan jujur, larangan manipulasi, konsekuensi pelanggaran |
| 11 | **Dompet GemaPay** | Cara topup, withdraw ke bank, promo/voucher, batas saldo, kadaluwarsa saldo |
| 12 | **Larangan** | Kekerasan, penipuan, spam, pelecehan, penyalahgunaan promo, transaksi di luar platform (TOPI) |
| 13 | **Kekayaan Intelektual** | Logo & konten GEMA, lisensi konten user |
| 14 | **Batasan Tanggung Jawab** | GEMA sebagai platform penghubung (tidak bertanggung jawab atas kualitas/keterlambatan), force majeure |
| 15 | **Perubahan Ketentuan** | Pemberitahuan via in-app notification & email, 14 hari sebelum berlaku |
| 16 | **Kontak** | Email, WhatsApp, alamat kantor |

---

## 2. Kebijakan Privasi (`/privacy`)

### Layout
- Sama dengan Syarat & Ketentuan (konsisten)
- Back link ke halaman sebelumnya
- Daftar pasal dalam Card + CardContent

### Konten (11 pasal)

| # | Pasal | Isi |
|---|-------|-----|
| 1 | **Pendahuluan** | Komitmen GEMA, dasar hukum (UU PDP No. 27/2022, UU ITE) |
| 2 | **Data yang Dikumpulkan** | Nama, email, no telepon, alamat, lokasi real-time (saat order), foto KTP (Mitra), selfie verifikasi, device info, IP address, riwayat transaksi GemaPay |
| 3 | **Cara Pengumpulan** | Form daftar, upload dokumen, lokasi latar belakang, cookie/analytics, komunikasi chat |
| 4 | **Dasar Pemrosesan** | Consent (persetujuan), kontrak (pemenuhan pesanan), kewajiban hukum (pajak, anti pencucian uang) |
| 5 | **Tujuan Penggunaan** | Registrasi, pemrosesan pesanan, verifikasi Mitra, pembayaran via Xendit, notifikasi, pencegahan fraud, analitik peningkatan layanan |
| 6 | **Pembagian Data** | Mitra (nama, lokasi ke Pelanggan), Xendit (data pembayaran), pihak berwajib (jika hukum wajibkan), tidak ada penjualan data ke pihak ketiga |
| 7 | **Penyimpanan & Keamanan** | Enkripsi TLS, Supabase hosting (AWS), retention 5 tahun (UU PDP), akses terbatas staf |
| 8 | **Hak Pengguna** | Akses data, koreksi, hapus akun (lenyap), cabut consent, portabilitas data — via Pengaturan Akun atau email |
| 9 | **Cookie & Tracking** | Session cookie (wajib), analytics (opsional), cara nonaktifkan |
| 10 | **Perubahan Kebijakan** | Pemberitahuan di aplikasi, 14 hari sebelum berlaku |
| 11 | **Kontak & DPO** | Data Protection Officer, email, WA, alamat |

---

## Files yang akan dibuat

| File | Tindakan |
|------|----------|
| `app/terms/page.tsx` | Buat baru |
| `app/privacy/page.tsx` | Buat baru |

## Files yang akan diubah

| File | Perubahan |
|------|-----------|
| `components/auth/AuthGuard.tsx` | Tambah `/terms` dan `/privacy` ke `AUTH_PAGES` |
| `app/(auth)/login/page.tsx` | Tambah link S&K dan Privasi di bawah tombol login |

## Catatan

- Tidak ada file baru di `lib/db` — murni halaman statis
- Tidak perlu migrasi database
- Tidak perlu update roadmap/testing checklist (konten legal, bukan fitur teknis)
- Halaman menggunakan 'use client' konsisten dengan seluruh app
- Design: Card + CardContent per pasal, frosted-glass header, decorative blur circles
