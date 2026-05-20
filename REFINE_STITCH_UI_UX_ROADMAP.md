# REFINE STITCH UI/UX ROADMAP — GEMA App

Companion to `roadmap.md` — fokus pada **layer design UI/UX** yang tidak tercakup di `roadmap.md`.
Dokumen ini adalah hasil analisis 3 arah: `UI_UX_ROADMAP.md` × `Stitch Design` × `Existing Frontend`.

---

## BAGIAN 1: DESIGN SYSTEM LOCK

Semua keputusan di bagian ini **TIDAK BOLEH BERUBAH LAGI**. Dikerjakan PERTAMA sebagai prasyarat semua halaman.

---

### 1.1 Color Tokens

Update `app/globals.css` — mapping Material 3 palette dari Stitch DESIGN.md ke CSS variables shadcn.

| Token | Stitch Color | Target HSL | Notes |
|-------|-------------|------------|-------|
| `--primary` | `#006c49` | `hsl(160 100% 21%)` | Dark green — align Stitch |
| `--primary-foreground` | `#ffffff` | `hsl(0 0% 100%)` | |
| `--primary-container` | `#10b981` | `hsl(152 89% 39%)` | Emerald existing |
| `--background` | `#f4fbf4` | `hsl(140 40% 97%)` | Light green tint |
| `--surface` | `#f4fbf4` | `hsl(140 40% 97%)` | Sama dengan background |
| `--surface-container-low` | `#eef6ee` | `hsl(140 30% 95%)` | Untuk input bg |
| `--surface-container` | `#e8f0e9` | `hsl(140 25% 93%)` | |
| `--surface-container-high` | `#e3eae3` | `hsl(140 20% 90%)` | |
| `--surface-container-highest` | `#dde4dd` | `hsl(140 15% 88%)` | |
| `--surface-container-lowest` | `#ffffff` | `hsl(0 0% 100%)` | Putih |
| `--outline` | `#6c7a71` | `hsl(150 6% 45%)` | |
| `--outline-variant` | `#bbcabf` | `hsl(150 15% 76%)` | |
| `--on-surface` | `#161d19` | `hsl(160 15% 10%)` | |
| `--on-surface-variant` | `#3c4a42` | `hsl(155 10% 26%)` | |
| `--error` | `#ba1a1a` | `hsl(0 76% 42%)` | |
| `--error-container` | `#ffdad6` | `hsl(6 100% 92%)` | |
| `--secondary` | `#376850` | `hsl(150 30% 31%)` | |
| `--tertiary` | `#a43a3a` | `hsl(0 48% 44%)` | |
| `--success` | — | `hsl(160 100% 21%)` | **BARU** — tambah untuk status positif |

Properti baru yang perlu ditambah di `globals.css`:
```css
:root {
  --surface-container-low: 140 30% 95%;
  --surface-container: 140 25% 93%;
  --surface-container-high: 140 20% 90%;
  --surface-container-highest: 140 15% 88%;
  --surface-container-lowest: 0 0% 100%;
  --outline: 150 6% 45%;
  --outline-variant: 150 15% 76%;
  --on-surface: 160 15% 10%;
  --on-surface-variant: 155 10% 26%;
  --success: 160 100% 21%;
  --success-foreground: 0 0% 100%;
}
```

---

### 1.2 Typography — Final Lock

| Role | Font | Weight | Implementasi |
|------|------|--------|-------------|
| Heading (display, headline, title) | **Plus Jakarta Sans** | 600/700 | `next/font/google` → `--font-heading` |
| Body, label, UI text | **Inter** | 400/500/600 | **Existing** — `--font-sans` |

**Lock rule**: Jangan tambah font lain. Hanya 2 ini.

**Implementasi `app/layout.tsx`:**
```tsx
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700"],
});

// Apply: className={cn("font-sans", inter.variable, plusJakartaSans.variable)}
```

**Implementasi `tailwind.config.ts`:**
```ts
fontFamily: {
  sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
  heading: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
},
```

**Cara pakai di halaman:**
```tsx
<h1 className="font-heading text-2xl font-bold">Judul</h1>
<p className="font-sans text-base">Body text</p>
```

---

### 1.3 Radius System — Final Lock

| Token | Value | Digunakan Untuk |
|-------|-------|----------------|
| `--radius` | `1rem` (16px) | Base shadcn |
| `--radius-md` | `0.75rem` (12px) | **FIX BUG** — button xs/sm |
| `rounded-lg` | `0.5rem` (8px) | Non-primary button |
| `rounded-xl` | `0.75rem` (12px) | Input fields |
| `rounded-2xl` | `1rem` (16px) | Secondary cards |
| `rounded-3xl` | `1.5rem` (24px) | **Card utama** (Stitch) |
| `rounded-full` | `9999px` | Button pill, badge, chip, avatar |

**Aturan:**
- Primary CTA button → `rounded-full` (pill)
- Non-primary button → `rounded-lg` (tetap shadcn default)
- Card → `rounded-3xl`
- Input → `rounded-xl`
- Badge/Chip → `rounded-full`
- Avatar → `rounded-full`

**Fix bug:** `--radius-md` selama ini tidak didefinisikan di CSS. Button `xs`/`sm` pakai `min(var(--radius-md), 10px)` yang resolve ke `0`. Tambahkan:
```css
--radius-md: 0.75rem;
```

---

### 1.4 Touch Target Standard — MOBILE ONLY

**Lock rule**: Jangan pernah pakai ukuran < 40px untuk touch target.

| Komponen | Minimum | Ideal | Catatan |
|----------|---------|-------|---------|
| Primary button | `h-12` (48px) | `h-14` (56px) | `px-6` |
| Secondary button | `h-12` (48px) | `h-12` (48px) | `px-4` |
| Input fields | `h-12` (48px) | `h-12` (48px) | |
| Back button | `w-10 h-10` (40px) | `w-10 h-10` (40px) | Minimal |
| Bottom nav item | `min-h-14` (56px) | `min-h-14` (56px) | |
| Toggle/Switch | `min-h-10` (40px) | `min-h-10` (40px) | |
| Icon button | `min-w-10 min-h-10` | `min-w-12 min-h-12` | |
| Star rating (clickable) | 44px | 44px | |
| Menu item row | `py-3` (12px) | `py-4` (16px) | Padding vertikal |

**Hapus dari shadcn Button.tsx**: size `xs` (h-6), `sm` (h-7), `icon-xs` (24px), `icon-sm` (28px) — tidak untuk mobile.

---

### 1.5 Shadow & Elevation

Dari Stitch DESIGN.md:

| Level | CSS | Digunakan Untuk |
|-------|-----|----------------|
| Level 0 | — | Background surface |
| Level 1 | `shadow-sm` (4px blur) | Cards, containers |
| Level 2 | `shadow-md` (12px blur) | Floating elements, bottom sheet, navbar |

---

### 1.6 Spacing System — 8px Rhythm

| Token | Value | Digunakan Untuk |
|-------|-------|----------------|
| `container-padding` | 16px | Padding kiri/kanan semua halaman |
| `gutter` | 12px | Gap antar item dalam row |
| Gap section | 24px / 32px | Antar card section |
| Gap card internal | 12px / 16px | Antar item dalam satu card |
| Base unit | 4px | Sub-step untuk fine tuning |

---

## BAGIAN 2: COMPONENT REFINEMENT

Dikerjakan KEDUA — setelah design system lock. Setiap komponen di-update untuk konsistensi.

---

### 2.1 Button.tsx

```tsx
// Sebelum (existing):
// default: h-8 rounded-lg px-2.5
// sm: h-7, xs: h-6, icon-xs: 24px

// Sesudah (target):
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all select-none border border-transparent ... h-12 px-6 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground ...",
        pill: "rounded-full bg-primary text-primary-foreground h-12 px-8 ...", // BARU
        outline: "border-border bg-background ...",
        secondary: "bg-secondary text-secondary-foreground ...",
        ghost: "hover:bg-muted ...",
        destructive: "bg-destructive/10 text-destructive ...",
        link: "text-primary underline-offset-4 ...",
      },
      size: {
        default: "h-12 px-6 [&_svg]:size-4",
        lg: "h-14 px-8 [&_svg]:size-5",
        icon: "size-12 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
// HAPUS: xs, sm, icon-xs, icon-sm
```

---

### 2.2 Card.tsx

```tsx
// Sebelum:
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);

// Sesudah:
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
// HAPUS: border (ganti ke shadow-sm sesuai Stitch)
```

---

### 2.3 Input.tsx

```tsx
// Sebelum:
// h-8 rounded-lg px-2.5 py-1 bg-transparent

// Sesudah:
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-surface-container-low px-4 py-1 text-base transition-colors file:... placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:... aria-invalid:...",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
// HAPUS: md:text-sm (mobile-only, tidak perlu responsive breakpoint)
```

---

### 2.4 Bottom Navigation

Redesign sesuai Stitch: active tab = pill background.

```tsx
// Setiap tab item:
// Inactive: icon + label, text-on-surface-variant
// Active: bg-secondary-container, text-on-secondary-container, rounded-full, px-4

// Container: h-14 (56px) minimum, shadow-md (top)
// Wrapper: fixed bottom-0, left-0, w-full, z-50
```

Contoh struktur:
```tsx
<nav className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
  <div className="flex justify-around items-center h-14 px-4 pb-safe">
    <a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
      <span className="material-symbols-outlined">home</span>
      <span className="text-[10px] font-semibold">Home</span>
    </a>
    {/* ... tabs lainnya ... */}
  </div>
</nav>
```

**Catatan**: Tetap pakai Lucide icons (bukan Material Symbols). Sesuaikan class icon.

---

### 2.5 Status Badge System

Mapping `order_status` → warna + icon:

| Status | Background | Text | Icon | Class |
|--------|-----------|------|------|-------|
| `pending` | `bg-amber-100` | `text-amber-700` | `clock` | `rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1` |
| `accepted` | `bg-blue-100` | `text-blue-700` | `check` | Sama |
| `in_progress` | `bg-blue-100` | `text-blue-700` | `sync` | Sama |
| `completed` | `bg-emerald-100` | `text-emerald-700` | `check-circle` | Sama |
| `cancelled` | `bg-red-100` | `text-red-700` | `x-circle` | Sama |

Mapping `payment_status`:

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| `unpaid` | `bg-yellow-100` | `text-yellow-700` | `alert-circle` |
| `escrow` | `bg-blue-100` | `text-blue-700` | `shield` |
| `released` | `bg-emerald-100` | `text-emerald-700` | `check-circle` |
| `refunded` | `bg-red-100` | `text-red-700` | `rotate-ccw` |

---

### 2.6 Payment Status Badge

Sama pattern dengan status badge di atas, untuk digunakan di halaman order detail dan earnings.

---

### 2.7 Skeleton / Loading Standarisasi

```tsx
// Card skeleton:
<div className="rounded-3xl bg-surface-container-lowest shadow-sm p-4 space-y-3">
  <Skeleton className="h-12 w-12 rounded-full" />
  <Skeleton className="h-4 w-3/4 rounded-xl" />
  <Skeleton className="h-4 w-1/2 rounded-xl" />
</div>

// List skeleton:
<div className="space-y-3">
  {[1,2,3].map(i => (
    <Skeleton key={i} className="h-16 w-full rounded-3xl" />
  ))}
</div>
```

---

### 2.8 Tab Component

Pill style untuk active tab:
```tsx
// Container:
<div className="flex bg-surface-container-low rounded-full p-1">

// Active tab:
<button className="rounded-full bg-white shadow-sm px-4 py-2 text-sm font-semibold text-on-surface">

// Inactive tab:
<button className="rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant">
```

---

## BAGIAN 3: SCREEN REFINEMENT — Per Phase roadmap.md

Dikerjakan KETIGA — setelah component refinement.

---

### ═══════════════════════════════════════════
### PHASE 3 — AUTH FLOW (4 halaman)
### ═══════════════════════════════════════════

#### 3.1 Splash (`/`)
| Aspek | Perubahan |
|-------|-----------|
| Background | `bg-emerald-600` → `bg-[#10B981]` (Stitch: primary-container) |
| Logo | Wordmark "GEMA" besar: `font-heading text-6xl font-black text-white tracking-[0.1em]` |
| Subtitle | "Green Emerald Mobility" `text-emerald-100` |
| Animasi | Hanya `transform` (scale) + `opacity` — GPU-accelerated |
| Durasi | Auto-redirect 2 detik ke `/onboarding` |

#### 3.2 Onboarding (`/onboarding`)
| Aspek | Perubahan |
|-------|-----------|
| Layout | Single page statis → **Multi-page carousel (3 slide)** |
| State | `const [currentSlide, setCurrentSlide] = useState(0)` |
| Slide 1 | Ilustrasi besar + "Temukan Jasa Profesional Terpercaya" |
| Slide 2 | Ilustrasi + "Penyedia Tervalidasi & Berkualitas" |
| Slide 3 | Ilustrasi + "Pembayaran Aman lewat GemaPay" |
| Navigation | Pagination dots (3, active = `bg-primary`), "Skip" ghost top-right |
| CTA | "Next" → `pill` button full-width. Slide 3: "Mulai" |
| Animasi | `transform translate-x` slide transition |

#### 3.3 Register (`/(auth)/register`)
| Aspek | Perubahan |
|-------|-----------|
| Heading | `font-bold` → `font-heading` |
| Submit button | `h-14 rounded-xl` → `h-12 rounded-full` (pill variant) |
| Google button | Redesign alignment (icon + text center, border) |
| Input | Tetap `h-12 rounded-xl bg-white` — sudah sesuai |

#### 3.4 Login (`/(auth)/login`)
| Aspek | Perubahan |
|-------|-----------|
| Heading | `font-bold` → `font-heading` |
| Submit button | `h-14 rounded-xl` → `h-12 rounded-full` (pill) |
| Google button | Redesign alignment |
| Input | Tetap `h-12 rounded-xl bg-white` |

---

### ═══════════════════════════════════════════
### PHASE 4 — CUSTOMER MARKETPLACE (8 halaman + 3 baru)
### ═══════════════════════════════════════════

#### 3.5 Customer Home (`/customer/home`)
| Aspek | Perubahan |
|-------|-----------|
| Search bar | `h-12 rounded-xl` → `rounded-full` (pill shape) |
| Category icons | `w-14 h-14 rounded-2xl` — tetap |
| Vendor cards | `rounded-xl` → `rounded-3xl` |
| Promo banner | `rounded-2xl` → `rounded-3xl` |
| **BARU** | Floating GemaPay widget (Stitch: pojok kanan atas, shadow-md, bg-white, rounded-lg) |
| "Lihat Semua" | → pill button |
| Vendor avatar | `w-20 h-20 rounded-lg` → `rounded-xl` |

GemaPay widget component:
```tsx
<div className="self-end bg-surface-container-lowest shadow-md rounded-lg p-sm flex items-center gap-sm border">
  <div className="bg-secondary-container rounded-full p-xs">
    <Wallet className="text-on-secondary-container" />
  </div>
  <div>
    <span className="text-[10px] text-outline">GemaPay</span>
    <span className="font-heading text-sm text-on-surface">Rp 250.000</span>
  </div>
  <button className="text-primary"><PlusCircle /></button>
</div>
```

#### 3.6 Search (`/customer/search`)
| Aspek | Perubahan |
|-------|-----------|
| Filter chips | Pill shape (`rounded-full bg-surface-container-lowest`) |
| Result cards | `rounded-xl` → `rounded-3xl` |
| Vendor avatar | `rounded-lg` → `rounded-xl` |

#### 3.7 Booking Summary (`/customer/booking/...` — cek route existing)
Refine layout align Stitch `booking_summary_refined/code.html`:
| Section | Elemen |
|---------|--------|
| Service card | Avatar, nama, kategori, rating, `rounded-3xl` |
| Date/Time | Ikon kalender + jam, grid 2 kolom |
| Payment method | Pilih metode: GEMA Pay (saldo display), Transfer |
| Cost breakdown | Biaya layanan, platform fee, promo discount |
| Total | Total + "Konfirmasi Pesanan" pill button |
| Bottom bar | Sticky: total + pill button |

#### 3.8 Order Tracking (`/customer/orders/detail`)
| Aspek | Perubahan |
|-------|-----------|
| Status card | `rounded-2xl border-2` → `rounded-3xl` |
| Status badge | Pill style |
| Progress stepper | Update warna milestone (completed = emerald, current = blue) |
| Chat button | → `h-12 rounded-full pill` (primary action) |
| Cancel/Review | → `h-12 rounded-xl` (secondary) |
| Milestone icons | `w-6 h-6 rounded-full` → tembakau |

#### 3.9 Order History (`/customer/orders`)
| Aspek | Perubahan |
|-------|-----------|
| Cards | `rounded-xl` → `rounded-3xl` |
| Tab bar | → pill style (`rounded-full bg-surface-container-low p-1`, active = bg-white) |
| **BARU** | Vendor avatar/logo di setiap card (`w-12 h-12 rounded-full`) |
| **BARU** | Order ID display |
| Status badge | Pill style |
| "Lihat Detail" | → `h-10 rounded-full pill` (variant="pill") |
| Chat icon | Icon button (`w-10 h-10 rounded-full`) |

#### 3.10 Review (`/customer/review`)
| Aspek | Perubahan |
|-------|-----------|
| Star rating | 36px → 44px (touch target WCAG) |
| Star hover | `scale-110` tetap — `transform` only |
| Submit | `h-14 rounded-xl` → `h-12 rounded-full pill` |
| Textarea | `rounded-2xl` → `rounded-xl` (konsisten input) |

#### 3.11 Chat (`/customer/chat`)
| Aspek | Perubahan |
|-------|-----------|
| Header | **BARU** call button (icon button `w-10 h-10 rounded-full`) |
| Avatar | **BARU** online dot indicator (`w-3 h-3 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5`) |
| Messages | **BARU** `done_all` read receipts di user bubble |
| Attachment | **BARU** `add_circle` / `paperclip` button di input bar |
| Send button | `h-12 w-12 rounded-full` — tetap |
| Input | `rounded-full h-12 bg-gray-50` — tetap |

#### 3.12 [BARU] Customer Reviews Listing
**Route**: `/customer/reviews?vendor_id=X`

| Elemen | Detail |
|--------|--------|
| Header | Back button + "Ulasan & Feedback" |
| Aggregate | Rating besar (4.8) + bintang + total review ("128 Ulasan") |
| Distribution | Bar chart 1-5 star distribution |
| Filter chips | Pill: "Semua", "Dengan Foto", "5★", "4★" |
| Review cards | Avatar, nama (partial/hidden), waktu, badge kategori, rating, teks, foto thumbnail |
| Vendor response | Kotak dengan left border + `storefront` icon |
| **Data** | `SELECT ... FROM reviews WHERE vendor_id = X ORDER BY created_at DESC` |
| **Data** | `reviews.review_image` → foto thumbnail support |

#### 3.13 [BARU] Payment Methods
**Route**: `/customer/payment/methods`

| Elemen | Detail |
|--------|--------|
| Header | Back + "Pilih Metode Pembayaran" |
| GEMA Pay | Icon G-PAY, saldo display, radio/chevron |
| Transfer Bank | Icon bank, deskripsi "1-2 hari kerja" |
| Kartu Kredit | Icon kartu, form字段 sederhana |
| Cost breakdown | Total amount display |
| Confirm button | Pill "Konfirmasi Pembayaran" |

#### 3.14 [BARU] Payment Success
**Route**: `/customer/payment/success?order_id=X`

| Elemen | Detail |
|--------|--------|
| Animasi | Centang hijau (transform scale + opacity — GPU) |
| Amount | Total display besar, `font-heading` |
| Detail | Order ID, service name, date |
| Button | "Kembali ke Beranda" pill button |
| Data | Order data dari Supabase |

---

### ═══════════════════════════════════════════
### PHASE 5 — VENDOR OPERATIONS (8 halaman + 1 baru + 4 baru verifikasi)
### ═══════════════════════════════════════════

#### 3.15 Vendor Dashboard (`/vendor/dashboard`)
| Aspek | Perubahan |
|-------|-----------|
| Header | `rounded-b-[32px]` → `rounded-b-3xl` (konsisten) |
| Cards | `rounded-2xl` → `rounded-3xl` |
| "Terima" button | `h-10` → `h-12 rounded-full pill` |
| Stat cards | Redesign align Stitch `vendor_dashboard_overview` |
| Earnings card | Tambah gradient jika balance > 0 |
| "Lihat semua" | Pill button |

#### 3.16 Vendor Profile (`/vendor/profile`)
| Aspek | Perubahan |
|-------|-----------|
| Menu icon wrappers | `w-9 h-9` → `w-10 h-10` (touch target fix) |
| **BARU** | GemaPay balance card (jika wallet ada) |
| Layout | Align Stitch `vendor_profile_details` |
| Verified badge | Pill style |
| Menu items | `py-4` konsisten |

#### 3.17 Edit Vendor Profile (`/vendor/profile/edit`)
| Aspek | Perubahan |
|-------|-----------|
| Camera button | `w-7 h-7` → `w-10 h-10` (touch target fix) |
| Submit | `h-14 rounded-xl` → `h-12 rounded-full pill` |
| Textarea | Pakai shadcn `Textarea` (bukan raw `<textarea>`) |
| Input | `h-14` → `h-12` (konsisten) |

#### 3.18 Portfolio (`/vendor/portfolio`)
| Aspek | Perubahan |
|-------|-----------|
| "Tambah" button | `h-10` → `h-12` |
| Cards | `rounded-xl` → `rounded-3xl` |
| Align Stitch | `portfolio_management` layout |
| Category icons | `w-12 h-12 rounded-2xl` |

#### 3.19 Add Portfolio (`/vendor/portfolio/add`)
| Aspek | Perubahan |
|-------|-----------|
| Submit | `h-14 rounded-xl` → `h-12 rounded-full pill` |
| Category grid | Redesign align Stitch `add_portfolio_form` |
| Input | `h-12` konsisten |

#### 3.20 Vendor Orders (`/vendor/orders`)
| Aspek | Perubahan |
|-------|-----------|
| Cards | `rounded-xl` → `rounded-3xl` |
| Tab | Pill style |
| Status badges | Pill style |
| Touch target | Row `py-3` → `py-4` |

#### 3.21 Vendor Order Detail (`/vendor/orders/detail`)
| Aspek | Perubahan |
|-------|-----------|
| Bottom actions | Primary → `h-12 rounded-full pill`, Secondary → `h-12 rounded-xl` |
| Stepper | Update warna |
| **FIX BUG** | Chat link → `/vendor/chat?order_id=X` (bukan `/customer/chat?order_id=X`) |
| **FIX BUG** | Cek semua href vendor → customer misroute |

#### 3.22 Vendor Chat (`/vendor/chat`)
| Aspek | Perubahan |
|-------|-----------|
| Search bar | `h-10` → `h-12 rounded-xl bg-surface-container-low` |
| **FIX BUG** | `href="/customer/chat?order_id=..."` → `href="/vendor/chat/detail?order_id=..."` |
| Chat rows | `py-3` → `py-4` |
| Online dot | Tambah di avatar |

#### 3.22b [BARU] Vendor Chat Detail
**Route**: `/vendor/chat/detail?order_id=X`

| Elemen | Detail |
|--------|--------|
| Header | Customer name, avatar, online dot |
| Messages | Realtime via Supabase subscription (existing pattern) |
| Input | `rounded-full h-12`, send button `h-12 w-12 rounded-full` |
| Call button | Icon button di header |
| Attachment | `Paperclip` button |

#### 3.23 Earnings (`/vendor/earnings`)
| Aspek | Perubahan |
|-------|-----------|
| Icon wrappers | `w-9 h-9` → `w-10 h-10` |
| **BARU** | "Tarik Saldo" button (`h-12 rounded-full pill`) |
| Gradient card | Align Stitch |
| Filter pills | `rounded-lg` → `rounded-full` |
| Transaction list | Icons color-coded per type |

#### 3.24 [BARU] Vendor Profile with Service Address
**Route**: `/vendor/profile/address`

| Elemen | Detail |
|--------|--------|
| Header | Back + "Alamat & Area Layanan" |
| Service address | Alamat utama, peta (Leaflet) |
| Operating hours | Hari + jam buka |
| Coverage area | Radius/area layanan |
| Align Stitch | `vendor_profile_with_service_address` |

#### 3.25 [BARU] Vendor Verification Flow (4 halaman)

⚠️ **Halaman ini BELUM ADA** di codebase. Perlu dibuat dari awal.

##### 3.25a Verification Intro (`/vendor/verification`)
| Elemen | Detail |
|--------|--------|
| Ilustrasi | Icon verified + headline |
| Steps | 3 step: KTP → Sertifikat → Review |
| CTA | "Mulai Verifikasi" pill button |
| Align Stitch | `vendor_verification_intro` |

##### 3.25b KTP Verification (`/vendor/verification/ktp`)
| Elemen | Detail |
|--------|--------|
| Upload area | File input + preview image |
| Form | NIK, nama sesuai KTP |
| Submit | Pill button |
| Align Stitch | `identity_verification_ktp` |
| **Data** | Storage bucket Supabase untuk upload |

##### 3.25c Professional Certification (`/vendor/verification/certification`)
| Elemen | Detail |
|--------|--------|
| Upload | File input sertifikat (PDF/image) |
| Form | Nama sertifikat, penerbit, tahun |
| Submit | Pill button |
| Align Stitch | `professional_certification` |

##### 3.25d Verification Review (`/vendor/verification/review`)
| Elemen | Detail |
|--------|--------|
| Status | Pending / Success / Rejected |
| Ilustrasi | Per status (jam centang / centang hijau / silang merah) |
| Info | "Dokumen sedang direview 1-3 hari kerja" |
| Align Stitch | `verification_under_review` |
| **Data** | `UPDATE vendor_profiles.is_verified` |

---

### ═══════════════════════════════════════════
### PHASE 6-7 — WALLET + PAYMENT (2 halaman + 3 baru)
### ═══════════════════════════════════════════

#### 3.26 Wallet (`/wallet`)
| Aspek | Perubahan |
|-------|-----------|
| Gradient card | Redesign align Stitch `gemapay_digital_wallet` |
| Balance | `font-heading text-4xl font-bold` |
| "Top Up" | Pill button |
| Transaction history | Color-coded: `topup` = emerald, `withdraw` = red, `payment` = blue |
| Icon | `rounded-full w-10 h-10` per transaction |

#### 3.27 [BARU] Promo Voucher History
**Route**: `/wallet/vouchers`

| Elemen | Detail |
|--------|--------|
| Header | Back + "Riwayat Promo" |
| Voucher cards | Notch cutout design (Stitch: `premium_featured_deal_banner`) |
| Status | Active / Expired / Used |
| **Data** | `promos` table |
| Align Stitch | `promo_voucher_history` |

Voucher card notch CSS:
```css
.voucher-notch::before, .voucher-notch::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  background-color: theme('colors.surface');
  border-radius: 50%;
  transform: translateY(-50%);
}
```

#### 3.28 [BARU] Promo Voucher Detail
**Route**: `/wallet/promo/[id]`

| Elemen | Detail |
|--------|--------|
| Header | Back + "Detail Promo" |
| Hero | Discount amount besar, `font-heading` |
| Terms | Syarat & ketentuan |
| Countdown | Timer (jika expired) |
| CTA | "Gunakan Promo" pill button |
| Align Stitch | `promo_voucher_detail` |

#### 3.29 [BARU] Premium/Featured Deal Banner
**Component** — reusable di home & halaman vendor.

| Elemen | Detail |
|--------|--------|
| Background | Gradient `from-emerald-600 to-emerald-800` |
| Badge | "PREMIUM" pill badge |
| Content | Title, discount, CTA |
| Shape | Notch cutout di sisi kiri/kanan |
| Align Stitch | `premium_featured_deal_banner` |

---

## BAGIAN 4: IMPLEMENTATION ORDER

### 🥇 BATCH 1 — Design System Lock (1 sesi)

- [x] 1. globals.css — color tokens + `--surface-container-*` + `--success` + `--radius-md` fix
- [x] 2. layout.tsx — import Plus_Jakarta_Sans
- [x] 3. tailwind.config.ts — tambah fontFamily.heading
- [x] 4. Button.tsx — default h-12 + hapus xs/sm + variant pill
- [x] 5. Card.tsx — rounded-3xl + shadow-sm
- [x] 6. Input.tsx — h-12 + rounded-xl + bg-surface-container-low
- [x] 7. BottomNav — pill style active tab + h-14
- [x] 8. Badge system — reusable StatusBadge component

```
Urutan kerja:
 1. globals.css  → update color tokens + tambah --surface-container-* + --success + --radius-md fix
 2. layout.tsx   → import Plus_Jakarta_Sans
 3. tailwind.config.ts → tambah fontFamily.heading
 4. Button.tsx   → default h-12 + hapus xs/sm + variant pill
 5. Card.tsx     → rounded-3xl + shadow-sm
 6. Input.tsx    → h-12 + rounded-xl + bg-surface-container-low
 7. BottomNav    → pill style active tab + h-14
 8. Badge system → component reusable untuk status
```

### 🥈 BATCH 2 — Auth + Customer Screens (2-3 sesi)

- [x] 9. Splash — bg #10B981 + wordmark
- [x] 10. Onboarding — carousel multi-page
- [x] 11. Register — font heading + pill submit
- [x] 12. Login — font heading + pill submit
- [x] 13. Home — GemaPay widget + cards rounded-3xl + search pill
- [x] 14. Search — pill chips + rounded-3xl cards
- [x] 15. Booking Summary — refine layout
- [x] 16. Order Detail — status pill + bottom buttons
- [x] 17. Order History — rounded-3xl cards + pill tab + vendor avatar
- [x] 18. Review — star 44px + pill submit
- [x] 19. Chat — call button + attachment + online dot

```
Sesi 1:
 9. Splash       → bg #10B981 + wordmark
10. Onboarding   → carousel multi-page
11. Register     → font heading + pill submit
12. Login        → font heading + pill submit

Sesi 2:
13. Home         → GemaPay widget + cards rounded-3xl + search pill
14. Search       → pill chips + rounded-3xl cards
15. Booking Summary → refine layout

Sesi 3:
16. Order Detail → status pill + bottom buttons
17. Order History → rounded-3xl cards + pill tab + vendor avatar
18. Review       → star 44px + pill submit
19. Chat         → call button + attachment + online dot
```

### 🥉 BATCH 3 — Vendor Screens (2-3 sesi)

- [x] 20. Dashboard — rounded-b-3xl + pill "Terima" + rounded-3xl cards
- [x] 21. Profile — icon w-10 + GemaPay card
- [x] 22. Edit Profile — camera w-10 + pill submit
- [x] 23. Portfolio — h-12 button + rounded-3xl cards
- [x] 24. Add Portfolio — pill submit
- [x] 25. Orders — rounded-3xl + pill tab
- [x] 26. Order Detail — fix bug chat link + pill bottom actions
- [x] 27. Chat — fix bug href + h-12 search
- [x] 28. Chat Detail — HALAMAN BARU
- [x] 29. Earnings — icon w-10 + "Tarik Saldo" pill
- [x] 30. Verification Intro
- [x] 31. KTP Verification → enhanced: combined KTP + selfie pegang KTP upload with camera capture (`capture="user"`/`"environment"`)
- [x] 32. Certification
- [x] 33. Review Status

```
Sesi 1:
20. Dashboard    → rounded-b-3xl + pill "Terima" + rounded-3xl cards
21. Profile      → icon w-10 + GemaPay card
22. Edit Profile → camera w-10 + pill submit
23. Portfolio    → h-12 button + rounded-3xl cards
24. Add Portfolio → pill submit

Sesi 2:
25. Orders       → rounded-3xl + pill tab
26. Order Detail → fix bug chat link + pill bottom actions
27. Chat         → fix bug href + h-12 search
28. Chat Detail  → HALAMAN BARU
29. Earnings     → icon w-10 + "Tarik Saldo" pill

Sesi 3 (Verification — HALAMAN BARU):
30. Verification Intro
31. KTP Verification
32. Certification
33. Review Status
```

### 🏅 BATCH 4 — New Screens (2-3 sesi)

- [x] 34. Customer Reviews Listing
- [x] 35. Payment Methods
- [x] 36. Payment Success
- [x] 37. Wallet — gradient redesign
- [x] 38. Promo Voucher History
- [x] 39. Promo Voucher Detail
- [x] 40. Premium Deal Banner component
- [x] 41. Vendor Profile with Service Address

```
Sesi 1:
34. Customer Reviews Listing
35. Payment Methods
36. Payment Success

Sesi 2:
37. Wallet       → gradient redesign
38. Promo Voucher History
39. Promo Voucher Detail
40. Premium Deal Banner component

Sesi 3:
41. Vendor Profile with Service Address
```

---

## BAGIAN 5: CONSISTENCY RULES — TIDAK BOLEH DILANGGAR

| Rule | Detail |
|------|--------|
| ✅ Font | HANYA Inter + Plus Jakarta Sans |
| ✅ Icons | HANYA Lucide (jangan ganti Material Symbols) |
| ✅ Touch | Minimum 44px, ideal 48px — tidak ada komponen < 40px |
| ✅ Button pill | HANYA untuk primary action — sisanya `rounded-lg` |
| ✅ Mobile-only | Tidak ada responsive breakpoints — satu layout |
| ✅ Static export | Tidak boleh ada server code, API routes, atau SSR |
| ✅ Data | Semua dari Supabase — tidak ada mock data |
| ✅ Animasi | HANYA `transform` + `opacity` — GPU-accelerated |
| ✅ Radius card | Semua card `rounded-3xl` — konsisten |
| ✅ Container padding | Semua halaman `px-4` (16px) |
| ✅ Bottom sticky | Action bar: `bg-white border-t` dengan `pb-safe` |
| ✅ Header | All headers: sticky top-0 z-40, `bg-emerald-600 text-white` atau `bg-white border-b` |

---

## BAGIAN 6: RISK & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font change → layout shift | Perubahan line-height | Test semua viewport, gunakan `display:swap` |
| Radius change → komponen pecah | Visual mismatch | Update `--radius` di globals.css dulu, baru komponen |
| Touch target h-8 → h-12 | Layout perlu space lebih | Container harus `min-h-12`, cek padding di form |
| Batch 3 terlalu besar | Burnout | Kerjakan per sesi, prioritaskan bug fix dulu |
| Verification flow perlu storage | Tidak bisa upload | Setup Supabase storage bucket untuk KTP/sertifikat/selfie |
| Selfie + KTP di 1 halaman | Form terlalu panjang | Gunakan 2 upload area terpisah (KTP + selfie) dengan preview inline + camera capture native |
