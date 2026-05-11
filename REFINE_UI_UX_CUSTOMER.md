# Refine UI/UX Customer — Roadmap

## Design Principles

Adopsi selektif dari Stitch GEMA App (04-customer), dengan warna tetap emerald.

### Stitch Patterns to Adopt

| Pattern | Adoption |
|---------|----------|
| Card style | `rounded-[24px] bg-white shadow-sm border border-gray-100` + `hover:border-emerald-500 transition-colors` |
| Filter pills | Active: `bg-emerald-600 text-white rounded-full px-4 py-1.5`. Inactive: `bg-white text-gray-600 border border-gray-200 rounded-full px-4 py-1.5` |
| Bottom nav active tab | `bg-emerald-100` background + filled icon (existing pattern, refine) |
| Order cards | Inset info box `bg-gray-50 rounded-xl p-3` untuk order ID & timestamp |
| Chat bubbles | Asymmetric corner: user `rounded-xl rounded-br-none`, vendor `rounded-xl rounded-bl-none` |
| Status badges | Positive: `bg-emerald-50 text-emerald-700`. Pending: `bg-orange-50 text-orange-700`. Inactive: `bg-gray-100 text-gray-600` |
| Profile menu | Two-tone icon containers, bordered list items `divide-y divide-gray-100` |
| Fixed bottom bars | Gradient fade `from-white via-white to-transparent h-6` di atas CTA bar |
| Loading skeleton | Ganti `Loader2` spinner dengan shadcn `Skeleton` component |
| Review cards | Star rating bars (horizontal progress), vendor response indented with `border-l-4 border-emerald-500` |
| Toggle switches | Custom `w-12 h-6` with `peer-checked:translate-x-6` + `peer-checked:bg-emerald-500` |
| Safe area | `pb-safe` via `env(safe-area-inset-bottom)` di fixed bottom bars |

### Stitch Patterns NOT to Adopt

- Map-centric home (tetap list-based)
- Surface hijau-putih (tetap `bg-gray-50`)
- Bottom nav tetap existing (4 tab, posisi, styling)
- Header tetap emerald gradient `rounded-b-[24px]` — bukan top app bar putih
- Material Symbols Outlined (tetap Lucide icons)
- Per-page TopAppBar 3-section pattern

---

## Cross-Page Consistency Fixes

- [ ] **Double padding bottom** — Hapus `pb-20`/`pb-24`/`pb-safe` dari page individual (layout `pb-16` sudah cukup). Affected: search, booking, vendor, chat
- [ ] **Header uniformity** — Semua page pakai `bg-emerald-600` (home masih `bg-emerald-500`, fix)
- [ ] **Chat header** — Konsisten dengan page lain (emerald gradient + `rounded-b-[24px]`)
- [ ] **Loading states** — Ganti `Loader2` spinner dengan shadcn `Skeleton` component
- [ ] **Bahasa placeholder** — Ganti placeholder Inggris ke Indonesia (search: "Cari layanan...")
- [ ] **Dead page** — Cleanup `payment/methods` (duplikat/WIP)
- [ ] **Hardcoded data** — Hapus placeholder data (home address, booking address, chat avatar)
- [ ] **`font-heading`** — Apply konsisten di semua halaman

---

## Per-Page Refinement Plan

### 1. `home/page.tsx` — Home

**Refinements:**
- [ ] Header: `bg-emerald-600` (fix dari `bg-emerald-500`)
- [ ] Search bar: floating card style dengan shadow + icon + filter icon
- [ ] Kategori cards: `rounded-[24px]` + `hover:border-emerald-500 transition-colors border border-gray-100` + cursor-pointer
- [ ] GemaPay card: polish dengan subtle shadow, "Top Up" button styling
- [ ] Vendor cards: rating badge (star icon + number), "Pesan" CTA pill button, shadow-sm + hover border-emerald
- [ ] Loading: Skeleton untuk cards instead of spinner
- [ ] Bottom nav: active tab `bg-emerald-100` polish

### 2. `search/page.tsx` — Search

**Refinements:**
- [ ] Fix double padding bottom
- [ ] Filter chips: Stitch pill styling (active emerald filled, inactive white border)
- [ ] Result cards: `rounded-[24px]` konsisten, rating + price + "Pesan" CTA
- [ ] Loading: Skeleton grid
- [ ] Placeholder: "Cari layanan..." (Indonesia)
- [ ] Empty state: better illustration + CTA

### 3. `orders/page.tsx` — Orders List

**Refinements:**
- [ ] Segmented tab: `bg-gray-100 rounded-lg p-1` container, active tab `bg-white shadow-sm`, inactive transparent
- [ ] Order cards: `rounded-[24px]` dengan inset info box `bg-gray-50 rounded-xl p-3` untuk order ID + waktu
- [ ] Status badges: konsisten (emerald/orange/gray/blue/red)
- [ ] Loading: Skeleton cards

### 4. `orders/detail/page.tsx` — Order Detail

**Refinements:**
- [ ] Status card: icon + "Menunggu Vendor" / status text, emerald accent
- [ ] Timeline: milestone steps with icon + status
- [ ] Vendor preview card: avatar + nama + rating + "Pro" badge
- [ ] Service details: icon rows with labels
- [ ] Payment summary: breakdown + total
- [ ] Bottom actions: chat vendor button

### 5. `booking/page.tsx` — Booking

**Refinements:**
- [ ] Service details card: vendor info + service name + price
- [ ] Date/time picker: Stitch styling
- [ ] Cost breakdown: line items, promo row highlight `bg-emerald-50`, divider, total
- [ ] Payment method selection: radio card with border highlight
- [ ] Sticky bottom bar: total on left + "Konfirmasi Pesanan" CTA on right
- [ ] Gradient overlay above bottom bar

### 6. `vendor/page.tsx` — Vendor Detail

**Refinements:**
- [ ] Vendor header: avatar, name, rating, location, "Pro" badge
- [ ] Services list: cards with price + "Pesan" button
- [ ] Reviews section: aggregate rating bar + review cards
- [ ] Sticky CTA: "Pesan Sekarang" floating button
- [ ] Back button: fix navigasi ke `/customer/search` (contextual)

### 7. `chat/page.tsx` — Chat

**Refinements:**
- [ ] Header: emerald gradient `bg-emerald-600` + `rounded-b-[24px]` (konsisten)
- [ ] Fix `h-screen` → `min-h-screen` + flex layout untuk keyboard safety
- [ ] Chat bubbles: asymmetric corner, user `bg-emerald-500 text-white rounded-xl rounded-br-none`, vendor `bg-gray-100 rounded-xl rounded-bl-none`
- [ ] Date separator: centered pill `bg-gray-100 text-gray-500 rounded-full px-3 py-1`
- [ ] Input bar: rounded-full input field + emerald send button
- [ ] Online indicator: green dot on vendor avatar

### 8. `payment/page.tsx` — Payment Selection

**Refinements:**
- [ ] Total prominently displayed at top in large text
- [ ] Payment option cards: radio selection with `border-2`, selected `border-emerald-500 bg-emerald-50`, unselected `border-gray-200 bg-white`
- [ ] Custom radio indicator: outer ring + inner dot with scale transition
- [ ] Voucher/promo row
- [ ] Sticky bottom CTA: "Konfirmasi Pembayaran"

### 9. `payment/success/page.tsx` — Payment Success

**Refinements:**
- [ ] Celebration glow: blurred circles (`blur-[100px]`) in emerald
- [ ] Success icon: large circle `w-24 h-24 bg-emerald-500` with check
- [ ] Summary card: service, date, time, payment method, total
- [ ] Action buttons: "Lihat Detail Pesanan" (primary) + "Kembali ke Beranda" (outline)
- [ ] No nav shell (no top bar or bottom nav)

### 10. `profile/page.tsx` — Profile

**Refinements:**
- [ ] Profile header: avatar `w-24 h-24` with edit overlay (camera icon)
- [ ] GemaPay balance card: gradient `from-emerald-600 to-emerald-500` with white text, "Top Up" + "Riwayat" buttons
- [ ] Primary menu: 4 items (Informasi Akun, Alamat, Pembayaran, Keamanan) with emerald-tinted icon containers
- [ ] Secondary menu: 3 items (Pusat Bantuan, Syarat, Keluar) with gray icon containers, Keluar in red
- [ ] List items: icon circle + title + subtitle + chevron right, `divide-y divide-gray-100`

### 11. `profile/edit/page.tsx` — Edit Profile

**Refinements:**
- [ ] Photo with camera overlay button
- [ ] Form inputs: leading icon inside input, focus ring `focus-visible:ring-2 focus-visible:ring-emerald-500/30`
- [ ] Address section: map preview + "Pilih dari Peta" button
- [ ] Save button: full-width emerald gradient pill

### 12. `settings/notifications/page.tsx` — Notification Settings

**Refinements:**
- [ ] Section cards: `rounded-xl bg-white shadow-sm border border-gray-100`
- [ ] Custom toggle switches: `w-12 h-6` track, `h-5 w-5` thumb, `peer-checked:bg-emerald-500` + `peer-checked:translate-x-6`
- [ ] 3 sections: Transaksi & Pesanan, Promosi, Pesan dari Vendor, Info Akun
- [ ] Immediate save (no submit button)

### 13. `settings/security/page.tsx` — Security Settings

**Refinements:**
- [ ] Security status card: green-tinted, verified_user icon, "Akun Terlindungi"
- [ ] List items: Ubah Kata Sandi, Keamanan Biometrik (toggle), Autentikasi 2 Faktor (status)
- [ ] Activity section: Perangkat Terdaftar, Aktivitas Login
- [ ] Custom toggle for biometric

### 14. `help/page.tsx` — Help Center

**Refinements:**
- [ ] Hero section: search input with icon, "Hai, ada yang bisa kami bantu?" heading
- [ ] Category grid: 2-column bento grid, 4 small cards (icon + label) + 1 full-width
- [ ] Popular topics: list with `divide-y divide-gray-100`, chevron right, hover bg-gray-50
- [ ] No bottom nav (help sub-page)

### 15. `help/faq/page.tsx` — FAQ Detail

**Refinements:**
- [ ] Category badge: small pill `bg-gray-100 rounded-full`
- [ ] Article body: numbered list, bold highlights, generous spacing
- [ ] Tip box: `bg-emerald-50 rounded-xl p-4` with lightbulb icon
- [ ] Feedback section: "Apakah artikel ini membantu?" with thumbs up/down
- [ ] Bottom bar: "Masih butuh bantuan?" + "Hubungi Customer Service" CTA

---

## Order Pengerjaan

User akan menentukan halaman per halaman. Setelah selesai 1 halaman, lanjut ke halaman berikutnya sesuai pilihan user.

## Done Checklist

- [ ] Lint pass (`npm run lint`)
- [ ] Build pass (`npm run build`)
- [ ] Update `docs/TESTING_CHECKLIST.md` jika ada skenario baru
- [ ] Update `roadmap.md` jika ada perubahan progress
