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

- [x] **Double padding bottom** — Hapus `pb-20`/`pb-24`/`pb-safe` dari page individual (layout `pb-16` sudah cukup)
- [x] **Header uniformity** — Semua page pakai `bg-emerald-600` + `rounded-b-[24px]`
- [x] **Chat header** — Konsisten emerald gradient + `rounded-b-[24px]`
- [x] **Loading states** — Ganti `Loader2` spinner dengan shadcn `Skeleton` component
- [x] **Bahasa placeholder** — Ganti placeholder Inggris ke Indonesia
- [x] **Dead page** — Cleanup `payment/methods` (duplikat/WIP)
- [x] **Hardcoded data** — Hapus placeholder data (home address, booking address, chat avatar)
- [x] **`font-heading`** — Apply konsisten di semua halaman

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
- [x] Profile header: avatar `w-24 h-24` with edit overlay (camera icon)
- [x] GemaPay balance card: gradient `from-emerald-600 to-emerald-500` with white text, "Top Up" + "Riwayat" buttons
- [x] Primary menu: 4 items (Informasi Akun, Alamat, Pembayaran, Keamanan) with emerald-tinted icon containers
- [x] Secondary menu: 2 items (Pusat Bantuan, Pengaturan) with gray icon containers, Keluar in red
- [x] List items: icon circle + title + subtitle + chevron right, gradient divider
- [x] Dynamic wallet balance via `useWallet` hook (was hardcoded)
- [x] Camera upload: file picker + Supabase Storage + local preview
- [x] Logout confirmation dialog (`window.confirm`)
- [x] Phone number display from profile
- [x] SVG wave decoration at header bottom
- [x] Avatar: gradient ring `ring-4 ring-white/30`
- [x] GemaPay card: glass overlay `via-white/5`
- [x] Menu micro-interactions: `group-hover:scale-110` icon, `group-hover:translate-x-0.5` chevron
- [x] Logout card: red gradient icon `from-red-500 to-red-600`

### 11. `profile/edit/page.tsx` — Edit Profile

**Refinements:**
- [x] Photo with camera overlay button (upload ke Supabase Storage)
- [x] Form inputs: focus ring `focus-visible:ring-2 focus-visible:ring-emerald-500/30`
- [x] Address section: link ke `/customer/profile/address`
- [x] Save button: full-width emerald gradient pill
- [x] Avatar preview after upload

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

### 16. `profile/address/page.tsx` — Address (NEW)

**Refinements:**
- [x] Address form with lat/lng coordinate inputs
- [x] "Gunakan lokasi saat ini" button (geolocation API)
- [x] Info card explaining coordinate purpose
- [x] Save to `users` table (lat, lng)
- [x] Skeleton loading state

---

## Order Pengerjaan

User akan menentukan halaman per halaman. Setelah selesai 1 halaman, lanjut ke halaman berikutnya sesuai pilihan user.

## Done Checklist

- [x] Lint pass (`npm run lint`) — 0 errors (pre-existing warnings only)
- [x] Build pass (`npm run build`) — 55 pages, 0 errors
- [x] Infrastructure: Storage RLS policies applied for `avatars` bucket
- [x] Infrastructure: `avatar_url` column added to `users` table
- [x] Infrastructure: Drizzle schema updated, migrations created (0005, 0006)
- [x] Auth: `auth-provider.tsx` updated to select/pass `avatar_url`
- [x] Profile: Avatar upload now persists URL to Supabase Storage + `users` table
- [ ] Update `docs/TESTING_CHECKLIST.md` jika ada skenario baru
- [ ] Update `roadmap.md` jika ada perubahan progress
