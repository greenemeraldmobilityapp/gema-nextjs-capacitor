# Setup Cloudflare Pages — GEMA

## Prasyarat

- Akun Cloudflare (gratis): https://dash.cloudflare.com/sign-up
- Repo GitHub `gema-nextjs-capacitor` sudah ter-push

## Setup Dashboard

**1.** Login ke https://dash.cloudflare.com

**2.** Sidebar kiri → **Workers & Pages**

**3. Pastikan tab Pages (bukan Workers):**
- Klik **Create application**
- Pilih tab **Pages** (bukan Workers)
- Klik **Connect to Git**
- Authorize GitHub jika belum
- Pilih repo `gema-nextjs-capacitor`
- Pilih branch `main`

> ⚠️ **PENTING:** Jangan pilih tab Workers. Halaman Pages punya field **Build output directory**, Workers tidak.

**4. Build settings (isi persis):**

| Field | Value |
|-------|-------|
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `out/` |
| Root directory | (biarkan kosong) |
| Node.js version | `20` (auto dari `.nvmrc`) |

**5. Environment Variables (tambah ini — hanya 2):**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ajteskgdggxwefcrncuu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGVza2dkZ2d4d2VmY3JuY3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDc4NjksImV4cCI6MjA5Mzk4Mzg2OX0.rg7KBUZaUcfnPhRvfYXch0CPvLgomH8xWTIYurGOgmQ` |

> `XENDIT_SECRET_KEY` / `XENDIT_WEBHOOK_TOKEN` — dikelola via Supabase Dashboard (Edge Functions), bukan Cloudflare.
> `NEXT_PUBLIC_XENDIT_PUBLIC_KEY` — tidak dipakai di kode frontend, skip saja.

**6.** Klik **Save and Deploy**

Tunggu ~1-2 menit hingga build & deploy selesai.

## Setelah Deploy

URL: `https://gema-app.pages.dev`

Update yang sudah dilakukan:
- ✅ `site_url` di Supabase Auth → `https://gema-app.pages.dev`
- ✅ `uri_allow_list` → ditambahkan `https://gema-app.pages.dev/**`
- ✅ `.env.local` → `APP_URL=https://gema-app.pages.dev`

## Info Domain

| Item | Value |
|------|-------|
| **Production URL** | `https://gema-app.pages.dev` |
| **Plan** | Cloudflare Pages Free |
| **SSL** | Otomatis (Cloudflare) |
| **CDN** | 330+ lokasi |
| **Bandwidth** | Unlimited |

## Auto Deploy

- Trigger: push ke branch `main`
- Build time: ~1-2 menit
- Rollback: Dashboard → Pages → project → **View build history** → klik timestamp → **Rollback to this build**

## Catatan

- `public/_headers` dan `public/_redirects` sudah disiapkan untuk security & caching
- Output `out/` — Next.js static export (66 halaman)
- Environment variables dikelola via Dashboard → Pages → project → **Settings** → **Environment variables**
