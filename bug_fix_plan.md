# Bug-Fix & Improvement Plan — GEMA

> Compiled: 2026-05-20 | Total: 32 items (3 Critical ✅, 7 High ✅, 12 Medium ✅, 10 Low ✅)

---

## 🔴 Critical (3) ✅

### C1 ✅ — Authenticated users see login/onboarding flash before redirect

**Fix applied:** `app/page.tsx:49-62`. Session check now runs first. Authenticated users redirected directly to role-based home (/customer/home, /vendor/dashboard, /admin/dashboard). localStorage fallback only if no session. Try/catch added.

**Issue:** `app/page.tsx:50-57` reads `localStorage` before checking Supabase session. Returning users with valid sessions are sent to `/login` or `/onboarding` first, then AuthGuard corrects them to their role-based home. Visible flash every app open.

**Fix:** Prioritize Supabase session check. If session exists → redirect directly to role-based home (`/customer/home`, `/vendor/dashboard`, `/admin/dashboard`). Fallback to localStorage/onboarding only if no session.

---

### C2 ✅ — Dual `users` table insert race condition

**Fix applied:** `app/(auth)/register/page.tsx:69-80`. Removed redundant `users` insert from register page. AuthProvider's `ensureProfileExists` now single source of truth for profile creation.

**Issue:** `app/(auth)/register/page.tsx:69-74` inserts into `users` table on registration success. Simultaneously, `auth-provider.tsx:14-19` (`ensureProfileExists`) also inserts into `users` when AuthProvider detects the new user. Two concurrent inserts risk duplicate key error or corrupted data.

**Fix:** Make AuthProvider the single source of truth for profile creation. Remove the redundant `insert` from register page — or register page sets profile in Zustand store directly and suppresses AuthProvider's insert.

---

### C3 ✅ — Forgot-password link leads to non-existent route

**Fix applied:** Created `app/(auth)/forgot-password/page.tsx` with email input → `supabase.auth.resetPasswordForEmail()`. Added `/forgot-password` to AuthGuard's unprotected routes (`AuthGuard.tsx:16`). Link in login page now works.

**Issue:** `app/(auth)/login/page.tsx:146` links to `/forgot-password` which does not exist (no file at `app/(auth)/forgot-password/`). Additionally, `AuthGuard.tsx:16` does not include `/forgot-password` in unprotected routes, creating a redirect loop if the route existed.

**Fix:** Either create a `/forgot-password` page and add it to AuthGuard's unprotected routes, or remove the link from login page.

---

## 🟠 High (7) ✅

### H1 ✅ — Admin splash redirect goes to `/login` instead of `/admin/dashboard`

**Fix applied:** `app/page.tsx:55-56` integrated into C1 fix. Admin now redirected directly to `/admin/dashboard` from splash.

### H2 ✅ — No try/catch around Supabase `getSession()` on splash

**Fix applied:** `app/page.tsx:49-62` integrated into C1 fix. Try/catch added with fallback redirect to `/login`.

### H3 ✅ — `gema_has_onboarded` not set before email-confirmation redirect

**Fix applied:** `app/(auth)/register/page.tsx:64-66`. Added `localStorage.setItem('gema_has_onboarded', 'true')` before redirect to `/login?registered=success`.

### H4 ✅ — `registered=success` query param written but never read

**Fix applied:** `app/(auth)/login/page.tsx`. Restructured with `<Suspense>` + `useSearchParams`. Reads `?registered=success` and shows green success banner with `CheckCircle2` icon.

### H5 ✅ — `router.refresh()` is no-op in static export mode

**Fix applied:** `app/(auth)/login/page.tsx:60`. Removed dead `router.refresh()` call.

### H6 ✅ — Google OAuth `redirectTo` broken in Capacitor

**Fix applied:** `app/(auth)/login/page.tsx:76`. Added `!window.location.protocol.startsWith('file')` detection. Skips `redirectTo` in Capacitor WebView (`file://` protocol), falls back to Supabase PKCE default.

### H7 ✅ — AuthGuard role-based redirect doesn't respect return URLs

**Fix applied:** `components/auth/AuthGuard.tsx:22`. Changed vendor redirect from `/vendor/verification` to `/vendor/profile/edit` (correct first destination after registration). AuthGuard now only redirects vendors on auth pages — non-auth pages unaffected.

---

## 🟡 Medium (12) ✅

### M1 ✅ — Error toast inconsistent patterns 

**Fix applied:** 5 files (chat, reviews, earnings, verification) — added `useEffect`-based `toast.error()` alongside inline error display where missing.

### M2 ✅ — Missing `toast.error()` on query failure

**Fix applied:** 9 files — no duplicates found; existing dashboard/orders already used correct `useEffect` pattern. All verified.

### M3 ✅ — Rupiah formatting without `'id-ID'` locale

**Fix applied:** 24 occurrences across 11 files (vendor pages + wallet pages + admin pages) — all `.toLocaleString()` calls updated to `.toLocaleString('id-ID')`.

### M4 ✅ — Unused imports

**Fix applied:** Removed from 7 files — `ArrowUpRight`/`PlusCircle` (customer/home), `Camera` (reviews), `createClient` (portfolio), `Clock` (portfolio pages), `PlusCircle` (vendor/profile), `TrendingUp` (earnings).

### M5 ✅ — Error state uses wrong icon

**Fix applied:** `app/customer/vendor/page.tsx` — `Search` → `AlertCircle`; `app/customer/orders/page.tsx` — `XCircle` → `AlertCircle`; `app/customer/home/page.tsx` — plain div → `AlertCircle` pattern.

### M6 ✅ — Missing Suspense fallback

**Fix applied:** `app/vendor/portfolio/edit/page.tsx` — added `<Loader2 className="animate-spin" />` fallback to `<Suspense>` wrapping `EditForm`.

### M7 ✅ — AuthProvider stale closure on `profile`

**Fix applied:** Removed dead `if (profile?.id === userId)` guard in `auth-provider.tsx` — `profile` was always null in closure.

### M8 ✅ — No `clearAuth()` / `reset()` action in auth store

**Fix applied:** Added `reset: () => set({ profile: null, isLoading: false })` to `store/auth.ts`; replaced `setProfile(null); setLoading(false)` with single `reset()` in `auth-provider.tsx`.

### M9 ✅ — Verification pages don't destructure `error` from query

**Fix applied:** `app/vendor/verification/review/page.tsx` — added `error` destructuring, `useEffect` toast, inline error state. Other files already handled in M1.

### M10 ✅ — No error fallback for video load failure

**Fix applied:** `app/onboarding/page.tsx` — added `videoError` state + `onError` handler on `<video>`; shows `AlertCircle` + "Video gagal dimuat" fallback.

### M11 ✅ — No field-level form validation on register page

**Fix applied:** Added `fieldErrors` state + `validateField`/`handleBlur`/`handleFocus` functions with per-field red error text. Pre-submit validation loop prevents submission with errors.

### M12 ✅ — Missing `cursor-pointer` on order cards

**Fix applied:** `app/customer/orders/page.tsx` — added `cursor-pointer hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md` to order card.

---

## 🟢 Low (10) ✅

### L1 ✅ — English labels in Indonesian UI

**Fix applied:** 9 replacements across 6 files — all labels now in Bahasa Indonesia (Pendapatan, Umpan Balik, Peninjauan, Unggah, Ditinjau, Status Verifikasi, Pengembalian Dana, Ketuk).

### L2 ✅ — 27 `<img>` vs `<Image>` lint warnings

**Fix applied:** 22 `<img>` → `<Image>` replacements across 17 files. Added `images: { unoptimized: true }` + Supabase Storage `remotePatterns` in `next.config.ts`.

### L3 ✅ — Missing dependency array in LocationPicker

**Fix applied:** `components/shared/LocationPicker.tsx` — added `useRef` for stable `onChangeRef`; map effect deps changed from `[]` to `[lat, lng]`.

### L4 ✅ — `eslint-config-next` version mismatch

**Fix applied:** `package.json` — bumped `eslint-config-next` from `15.0.0` to `^15.5.18`.

### L5 ✅ — Unused `@types/*` packages + `shadcn` in wrong dep category

**Fix applied:** `package.json` — removed 4 unused `@types/*` devDependencies; moved `shadcn` from `dependencies` → `devDependencies`.

### L6 ✅ — `motion` in `transpilePackages` but not in `dependencies`

**Fix applied:** `next.config.ts` — removed `'motion'` from `transpilePackages` (not used anywhere in codebase).

### L7 ✅ — `console.error` in production code

**Fix applied:** 4 `console.error` calls — 3 wrapped with `NODE_ENV !== 'production'`, 1 replaced with `toast.error('Gagal memuat profil pengguna')`.

### L8 ✅ — No chat list page (architecture gap — not a bug)

**Fix applied:** Created `app/customer/chat/page.tsx` (list) + moved detail to `app/customer/chat/detail/page.tsx`. Customer now has full chat inbox with search, last message preview, vendor name, service name. Updated `useCustomerChats` to include order+vendor details. Updated all links. BottomNav Chat icon now points to list. Routes match vendor pattern (`/customer/chat` = list, `/customer/chat/detail?order_id=` = detail).

### L9 ✅ — Settings page uses `href: '#'` placeholder links

**Fix applied:** `app/vendor/settings/page.tsx` — `#` links now show `toast.info('Segera hadir')` on click instead of navigating nowhere.

### L10 ✅ — README.md is placeholder template (documentation)

**Fix applied:** Replaced generic AI Studio template with GEMA-specific README covering stack, setup, scripts, project structure, auth flow, deployment, and related docs.

---

## Priority Execution Order

```
Phase 1 — Critical (C1-C3) ✅
  ✅ Fix auth redirect logic
  ✅ Fix dual users insert race condition
  ✅ Fix forgot-password route

Phase 2 — High (H1-H7) ✅
  ✅ Fix splash redirects (admin + normal users)
  ✅ Fix email confirmation UX gap
  ✅ Fix login page issues (refresh, OAuth, success message)
  ✅ Fix AuthGuard redirect logic

Phase 3 — Medium (M1-M12) ✅
  ✅ Fix error toast inconsistencies + duplicate toasts
  ✅ Fix Rupiah formatting across 11 files (24 occurrences)
  ✅ Clean up unused imports (7 files)
  ✅ Fix error icons in 3 files
  ✅ Add Suspense fallback
  ✅ Fix AuthProvider stale closure
  ✅ Add store reset action
  ✅ Fix verification error handling
  ✅ Add video error fallback
  ✅ Add register form validation
  ✅ Add cursor-pointer to order cards

Phase 4 — Low (L1-L10) ✅
  ✅ Indonesian labels (9 instances)
  ✅ Fix <img> → <Image> (22 replacements, 17 files)
  ✅ Fix LocationPicker deps
  ✅ Fix eslint-config-next version
  ✅ Clean up package.json (unused types, shadcn dep)
  ✅ Fix motion transpilePackages
  ✅ Fix console.error in production
  ✅ Fix placeholder links (toast "Segera hadir")
  ✅ Chat list page (L8 — customer inbox)
  ✅ README (L10 — replaced placeholder template)

✅ All 32 items resolved
```
