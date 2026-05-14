# REFINE UI/UX VENDOR — GEMA App

Companion to `REFINE_STITCH_UI_UX_ROADMAP.md` — fokus pada **enhancement luxury & premium** untuk modul vendor.

---

## 1. Design Direction

### 1.1 Luxury Style Keyword ✅
**Liquid Glass** — flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur
- Status: ✅ IMPLEMENTED — Used in VendorBottomNav, cards with backdrop-blur, gradient active states

### 1.2 Color Palette Upgrade ✅
| Token | Current | Target | Status | Notes |
|-------|---------|--------|--------|-------|
| `--primary` | `#10b981` | `#059669` (emerald-600) | ✅ | More refined emerald |
| `--primary-foreground` | `#ffffff` | `#ffffff` | ✅ | Keep |
| `--background` | `#f3f4f6` (gray-100) | `#fafaf9` (stone-50) | ✅ | Warmer, luxury feel |
| `--card` | `#ffffff` | `#ffffff` with `shadow-elegant` | ✅ | Subtle depth |
| `--accent` | — | `#ca8a04` (amber-500/gold-600) | ✅ | Added gold color palette to tailwind.config.ts |
| `--text-primary` | `#111827` | `#0c0a09` (stone-950) | ✅ | Rich black |
| `--text-muted` | `#6b7280` | `#78716c` (stone-500) | ✅ | Softer muted |

### 1.3 Typography Upgrade ✅
| Role | Current | Target | Status |
|------|---------|--------|--------|
| Heading | Inter 600/700 | **Plus Jakarta Sans** 600/700 | ✅ IMPLEMENTED in layout.tsx |
| Body | Inter 400/500 | Inter 400/500 | ✅ |
| Accent/Labels | — | Plus Jakarta Sans 500 (uppercase tracking-wider) | ✅ |

### 1.4 Radius & Shadow Refinement ✅
| Token | Value | Usage | Status |
|-------|-------|-------|--------|
| `--radius` | `1rem` (16px) | Base shadcn | ✅ |
| `rounded-3xl` | `1.5rem` (24px) | All vendor cards | ✅ |
| `shadow-elegant` | `0 4px 20px rgba(0,0,0,0.06)` | Cards with subtle depth | ✅ in tailwind.config.ts |
| `shadow-lifted` | `0 8px 30px rgba(0,0,0,0.08)` | Elevated elements | ✅ in tailwind.config.ts |

---

## 1.5 Additional Enhancements (NEW) ✅
*Added from UI/UX Pro Max design system analysis*

### 1.5.1 Gold Accent System ✅
For premium CTAs and luxury indicators:
- Added `gold` color palette to `tailwind.config.ts` (gold-50 to gold-900)
- Verified badge can now use `bg-gold-100 text-gold-700`
- Status: ✅ IMPLEMENTED

### 1.5.2 Liquid Glass Card Overlays ✅
Add subtle gradient overlays for premium feel:
- Earnings balance card already has: `absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent`
- Dashboard earnings card has: `bg-gradient-to-r from-white/10 to-transparent`
- Status: ✅ IMPLEMENTED (already in codebase)

### 1.5.3 Micro-interactions ✅
Add subtle hover scale for all clickable elements:
- Added `active:scale-[0.98]` to Button component (`components/ui/button.tsx`)
- Cards already have `hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300`
- Status: ✅ IMPLEMENTED

### 1.5.4 Premium Typography Upgrade ✅
Added luxury fonts to typography system:
- Added **Bodoni Moda** (`--font-display`) for premium display headings
- Added **Jost** (`--font-body`) for body text alternative
- Updated `tailwind.config.ts` with `fontFamily.display` and `fontFamily.body`
- Updated `app/layout.tsx` with font imports and CSS variables
- Status: ✅ IMPLEMENTED

---

## 2. Component Refinement

### 2.1 VendorBottomNav
**Current**: Basic white bg, icon + label, active = emerald pill bg
**Target**: 
- Glass morphism effect: `backdrop-blur-xl bg-white/80`
- Shadow: `shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`
- Active indicator: emerald gradient pill with subtle glow
- Transition: `transition-all duration-300 ease-out`
- Border: `border-t border-gray-100`

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
  <div className="flex h-16 items-center justify-around px-4 pb-safe">
    {/* Active: bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full px-5 py-1.5 shadow-lg */}
    {/* Inactive: text-stone-500 hover:text-emerald-600 px-5 py-1.5 */}
  </div>
</nav>
```

### 2.2 Cards (Vendor Context)
**Current**: `rounded-3xl shadow-sm border border-gray-100`
**Target**:
- `rounded-3xl shadow-elegant`
- Hover: `hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300`
- No border (cleaner luxury look) OR `border border-gray-100/50`
- Optional: subtle gradient on header `bg-gradient-to-br from-emerald-50 to-white`

### 2.3 Buttons
**Current**: `h-12 rounded-full bg-emerald-600`
**Target**:
- Primary: `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-md`
- Secondary: `h-12 rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50`
- Glass effect on some CTAs: `bg-emerald-500/10 backdrop-blur-sm`

### 2.4 Status Badges
**Target**:
- Pill style with subtle background gradient
- `rounded-full px-3 py-1 text-xs font-semibold`
- Shadow: `shadow-sm`

| Status | Current | Target |
|--------|---------|--------|
| pending | `bg-yellow-50 text-yellow-700` | `bg-amber-50/80 text-amber-700 border border-amber-200/50` |
| accepted | `bg-blue-50 text-blue-700` | `bg-blue-50/80 text-blue-700 border border-blue-200/50` |
| in_progress | `bg-emerald-50 text-emerald-700` | `bg-emerald-50/80 text-emerald-700 border border-emerald-200/50` |
| completed | `bg-gray-50 text-gray-700` | `bg-stone-100/80 text-stone-600 border border-stone-200/50` |
| cancelled | `bg-red-50 text-red-700` | `bg-red-50/80 text-red-600 border border-red-200/50` |

### 2.5 Form Inputs
**Target**:
- `h-12 rounded-xl bg-stone-50 border border-stone-200`
- Focus: `focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10`
- Placeholder: `text-stone-400`
- Transition: `transition-all duration-200`

### 2.6 Avatar/Badges
- `rounded-full` (not squared)
- Shadow: `shadow-sm`
- Verified badge: gold accent `bg-amber-100 text-amber-700`

---

## 3. Screen-by-Screen Refinements

### ═══════════════════════════════════════════
### 3.1 Vendor Dashboard (`/vendor/dashboard`)
### ═══════════════════════════════════════════

| Element | Current | Target |
|---------|---------|--------|
| Header BG | `bg-emerald-600` | `bg-gradient-to-br from-emerald-600 to-emerald-800` |
| Header Shape | `rounded-b-3xl` | `rounded-b-[2rem] shadow-lg` |
| Greeting | `text-xl font-bold` | `font-heading text-2xl font-bold` |
| Earnings Card | `bg-emerald-600 gradient` | `bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg` |
| Stat Cards | `rounded-3xl border-gray-100 shadow-sm` | `rounded-3xl shadow-elegant hover:shadow-lifted` |
| Stat Icons | `w-10 h-10 bg-blue-100 rounded-full` | `w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm` |
| Pending Orders Card | `bg-orange-50/50 border-orange-100` | `bg-amber-50/30 border border-amber-100/50 rounded-3xl shadow-elegant` |
| Accept Button | `h-12 rounded-xl` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` |
| Empty State | Basic icon | Icon + subtle animation + muted text |

**Specific Changes:**
```tsx
// Header
<div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 pt-10 pb-14 rounded-b-[2rem] shadow-lg">

// Earnings Card
<Card className="rounded-3xl shadow-lg overflow-hidden">
  <CardHeader className="bg-gradient-to-br from-emerald-500 to-emerald-700">
    {/* glass effect inner */}
  </CardHeader>

// Stat Cards - hover effect
<Card className="rounded-3xl shadow-elegant hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
```

### ═══════════════════════════════════════════
### 3.2 Vendor Profile (`/vendor/profile`)
### ═══════════════════════════════════════════

| Element | Current | Target |
|---------|---------|--------|
| Container BG | `bg-gray-50` | `bg-stone-50` |
| Profile Card | `bg-white rounded-3xl p-5 shadow-sm border` | `bg-white rounded-3xl p-6 shadow-elegant` |
| Avatar | `w-20 h-20 rounded-full bg-emerald-100` | `w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md` |
| Name | `text-lg font-bold` | `font-heading text-xl font-bold` |
| Verified Badge | `bg-emerald-50 text-emerald-600` | `bg-amber-100/80 text-amber-700 border border-amber-200/50 rounded-full` |
| Wallet Card | `bg-gradient-to-br from-emerald-600 to-emerald-800` | `bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 shadow-lg` |
| Menu Items | `bg-white rounded-3xl shadow-sm border divide-y` | `bg-white/80 backdrop-blur-sm rounded-3xl shadow-elegant divide-y divide-stone-100` |
| Menu Item Row | `px-4 py-4 hover:bg-gray-50` | `px-5 py-4.5 hover:bg-stone-50/80 transition-colors duration-200` |
| Menu Icon | `w-10 h-10 rounded-full bg-gray-100` | `w-11 h-11 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-sm` |
| Logout Button | `border-red-200 text-red-600` | `border-2 border-red-200/50 text-red-600 hover:bg-red-50/50 rounded-xl` |

**Specific Changes:**
```tsx
// Wallet Card - add subtle shine effect
<div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 rounded-3xl p-5 shadow-lg overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
  {/* content */}
</div>

// Verified badge - gold luxury
{vendor?.is_verified && (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100/80 text-amber-700 border border-amber-200/50">
    <Shield className="w-3.5 h-3.5" />
    Terverifikasi
  </span>
)}
```

### ═══════════════════════════════════════════
### 3.3 Vendor Edit Profile (`/vendor/profile/edit`)
### ═══════════════════════════════════════════

| Element | Current | Target |
|---------|---------|--------|
| Header | `border-b sticky` | `border-b backdrop-blur-lg bg-white/80` |
| Photo Upload | `w-20 h-20 rounded-full` | `w-24 h-24 rounded-full shadow-lg` |
| Camera Button | `w-10 h-10 bg-emerald-600 rounded-full` | `w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-md` |
| Form Card | `bg-white rounded-3xl p-5 shadow-sm border` | `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant` |
| Labels | `text-sm font-semibold text-gray-700` | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |
| Inputs | `h-12 bg-gray-50 border-gray-200 rounded-xl` | `h-12 bg-stone-50 border-stone-200 rounded-xl focus:border-emerald-400` |
| Location Card | `bg-white rounded-xl shadow-sm border` | `bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm` |
| Submit Button | `h-12 rounded-full` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` |

### ═══════════════════════════════════════════
### 3.4 Vendor Orders (`/vendor/orders`)
### ═══════════════════════════════════════════

| Element | Current | Target | Status |
|---------|---------|--------|--------|
| Container BG | `bg-gray-50` | `bg-stone-50` | ✅ |
| Header | `bg-white border-b` | `bg-white/90 backdrop-blur-lg border-b border-stone-100` | ✅ |
| Add Button | `h-12 rounded-xl bg-emerald-600` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` | ✅ |
| Service Card | `bg-white rounded-3xl p-4 shadow-sm border` | `bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-elegant hover:shadow-lifted transition-all` | ✅ |
| Category Icon | `w-12 h-12 rounded-2xl bg-emerald-100` | `w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm` | ✅ |
| Service Title | `font-semibold text-gray-900` | `font-semibold text-stone-800` | ✅ |
| Category | `text-xs text-gray-400` | `text-xs text-stone-400` | ✅ |
| Description | `text-xs text-gray-500` | `text-xs text-stone-500` | ✅ |
| Price | `font-bold text-emerald-700` | `font-bold text-emerald-600` | ✅ |
| Empty State | Basic icon centered | Icon + subtle animation + refined text styling | ✅ |

### ═══════════════════════════════════════════
### 3.10 Vendor Add Portfolio (`/vendor/portfolio/add`) ✅
### ═══════════════════════════════════════════

| Element | Current | Target | Status |
|---------|---------|--------|--------|
| Form Card | `bg-white rounded-3xl p-5 shadow-sm border` | `bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-elegant` | ✅ |
| Labels | `text-sm font-semibold text-gray-700` | `text-xs font-semibold text-stone-500 uppercase tracking-wider` | ✅ |
| Inputs | `h-12 bg-gray-50 border-gray-200 rounded-xl` | `h-12 bg-stone-50 border-stone-200 rounded-xl` | ✅ |
| Category Select | Standard select | Custom styled with rounded-xl, shadow-sm | ✅ |
| Textarea | Raw `<textarea>` | Use shadcn `Textarea` component | ✅ |
| Submit Button | `h-12 rounded-xl` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` | ✅ |

### ═══════════════════════════════════════════
### 3.11 Vendor Verification Flow
### ═══════════════════════════════════════════

#### Verification Intro (`/vendor/verification`)
| Element | Current | Target |
|---------|---------|--------|
| Icon Container | `w-24 h-24 bg-emerald-100 rounded-full` | `w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full shadow-lg` |
| Icon | `ShieldCheck size={48}` | `ShieldCheck size={56}` |
| Steps | `bg-emerald-50 rounded-full` icon wrapper | `bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-sm` icon wrapper |
| CTA Button | `variant="pill"` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg` |

#### KTP Verification (`/vendor/verification/ktp`)
#### Certification (`/vendor/verification/certification`)
#### Review (`/vendor/verification/review`)
- Same glass morphism / luxury treatment as other forms
- Consistent input styling
- Refined upload area with dashed border

### ═══════════════════════════════════════════
### 3.12 Vendor Address (`/vendor/profile/address`)
### ═══════════════════════════════════════════

| Element | Current | Target |
|---------|---------|--------|
| Section Card | `bg-white rounded-3xl p-5 shadow-sm border` | `bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-elegant` |
| Section Icon | `w-10 h-10 rounded-full bg-emerald-100` | `w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-sm` |
| Labels | `text-sm font-semibold text-gray-700` | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |
| Map Container | `h-48 bg-gray-100 rounded-2xl` | `h-52 bg-stone-100 rounded-2xl shadow-inner` |
| Time Picker Inputs | Raw `<input type="time">` | Styled with rounded-lg, shadow-sm |
| Range Slider | `accent-emerald-600` | Custom styled with emerald gradient thumb |
| Save Button | `variant="pill"` | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` |

---

## 4. Layout Refinements

### 4.1 Page Container
```tsx
// Current
<div className="flex flex-col min-h-screen pb-16 bg-gray-50">
  <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm min-h-screen relative">

// Target (luxury)
<div className="flex flex-col min-h-screen pb-20 bg-stone-50">
  <main className="flex-1 w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen relative shadow-elegant">
```

### 4.2 Sticky Headers
```tsx
// Target
<header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-stone-100">
```

### 4.3 Action Bars (Bottom Fixed)
```tsx
// Target
<footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
  <div className="max-w-md mx-auto p-4">
    {/* Action buttons */}
  </div>
</footer>
```

---

## 5. Implementation Order

### Session 1: Core Infrastructure ✅ COMPLETE
- [x] 1. Update `globals.css` with luxury color tokens + `--shadow-elegant` + `--shadow-lifted`
- [x] 2. Refine `VendorBottomNav` with glass morphism + luxury styling
- [x] 3. Update `app/vendor/layout.tsx` container styling

> ⚠️ **PENDING**: Add `--accent` (gold) CSS variable for premium CTAs (see §1.5.1)

### Session 2: Dashboard & Profile
4. Refine `/vendor/dashboard` — gradient header, luxury stat cards, hover effects
5. Refine `/vendor/profile` — glass morphism cards, gold verified badge, luxury wallet card

### Session 3: Orders & Detail
6. Refine `/vendor/orders` — glass cards, pill tabs, hover effects
7. Refine `/vendor/orders/detail` — luxury stepper, glass action bar, gradient buttons

### Session 4: Earnings & Chat
8. Refine `/vendor/earnings` — shine effect on balance, gradient boxes, glass transactions
9. Refine `/vendor/chat` — luxury avatar, glass list items
10. Refine `/vendor/chat/detail` — gradient bubbles, luxury header, glass input bar

### Session 5: Portfolio & Verification
- [x] 11. Refine `/vendor/portfolio` — glass cards, luxury category icons
- [x] 12. Refine `/vendor/portfolio/add` — luxury form styling
- [ ] 13. Refine verification pages — consistent luxury treatment

### Session 6: Address & Final Polish
14. Refine `/vendor/profile/address` — luxury section cards, refined inputs
15. Final pass — consistency check across all pages
16. Run lint + build verification

---

## 6. Consistency Rules (Non-Negotiable)

| Rule | Implementation |
|------|----------------|
| Background | `bg-stone-50` (warm luxury) or `bg-white/80 backdrop-blur-sm` |
| Cards | `rounded-3xl shadow-elegant bg-white/90 backdrop-blur-sm` |
| Buttons Primary | `h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md` |
| Buttons Secondary | `h-12 rounded-xl border-2 border-stone-200` |
| Headers | `backdrop-blur-lg bg-white/80 border-b border-stone-100` |
| Bottom Nav | `backdrop-blur-xl bg-white/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]` |
| Status Badges | `rounded-full px-3 py-1 text-xs font-semibold border` |
| Icons Container | `rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 shadow-sm` |
| Text Primary | `text-stone-800` |
| Text Muted | `text-stone-400` |
| Labels | `text-xs font-semibold text-stone-500 uppercase tracking-wider` |

---

## 7. Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| `bg-gray-50` | `bg-stone-50` or glass morphism |
| `rounded-xl` for cards | `rounded-3xl` |
| Hard shadows | `shadow-elegant` with soft blur |
| Flat colors | Subtle gradients |
| Gray badges | Colored with subtle borders |
| Basic white backgrounds | `bg-white/80 backdrop-blur-sm` |
| `text-gray-500` | `text-stone-400` |
| Simple borders | Soft borders with `border-stone-100/50` |