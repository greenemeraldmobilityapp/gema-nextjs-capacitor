# Deployment Guide — GEMA

## Overview

Panduan distribusi APK untuk testing dan production secara gratis.

---

## Web — Cloudflare Pages

Production URL: **https://gema-app.pages.dev**

GEMA di-deploy sebagai **static export** (`output: 'export'`) ke Cloudflare Pages. Build otomatis tiap push ke `main`.

| Item | Detail |
|------|--------|
| **Platform** | Cloudflare Pages (Free plan) |
| **URL** | `https://gema-app.pages.dev` |
| **Build command** | `npm run build` |
| **Output dir** | `out/` |
| **SSL** | Otomatis (Cloudflare) |
| **CDN** | 330+ lokasi, unlimited bandwidth |
| **Auto deploy** | Push ke `main` |
| **Setup guide** | `docs/setup-cloudflare.md` |

### Env Vars di Cloudflare Dashboard

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |

> `XENDIT_SECRET_KEY` dan `XENDIT_WEBHOOK_TOKEN` dikelola via **Supabase Dashboard** (Edge Functions), bukan Cloudflare.

### Rollback

Dashboard → Pages → **gema-app** → **View build history** → klik timestamp → **Rollback to this build**

---

## CI/CD Pipeline (GitHub Actions)

Dua workflow sudah tersedia di `.github/workflows/`:

| Workflow | Trigger | Output |
|----------|---------|--------|
| `capacitor-android-apk.yml` | Push ke `develop`/`main` + manual `workflow_dispatch` | APK debug + Firebase Distribution |
| `capacitor-android-aab.yml` | Push tag `v*` (e.g. `v1.0.0`) + manual `workflow_dispatch` | AAB release + GitHub Release |

### Persiapan Sebelum Push Pertama

1. **Generate `android/`** — `npx cap add android` (sekali saja, commit hasilnya)
2. **Keystore** — Buat dan encode base64 (lihat `PRODUCTION_SECRETS.md`)
3. **GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `ANDROID_SIGNING_KEY`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
4. **GitHub Variables** (Settings → Variables → Actions):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `FIREBASE_APP_ID` (opsional, untuk Firebase Distribution)
5. **Firebase Token** (opsional):
   - `FIREBASE_TOKEN` via `firebase login:ci` → simpan di secrets

### Cara Memicu Build

```bash
# Debug APK — push ke main
git push origin main

# Release AAB — buat tag
git tag v1.0.0
git push origin v1.0.0

# Manual via GitHub UI
# Actions → pilih workflow → Run workflow
```

---

## Option 1: Firebase App Distribution (Recommended)

### Prerequisites
- Google Account
- Firebase project (free tier)

### Setup Steps

#### 1. Create Firebase Project
```
1. Buka https://console.firebase.google.com
2. Click "Add project"
3. Project name: "gema-app"
4. Disable Google Analytics (optional)
5. Create project
```

#### 2. Add Android App
```
1. Click Android icon (add app)
2. Package name: com.greenemerald.gema
3. App nickname: GEMA
4. Register app
5. Download google-services.json
6. Place at: android/app/google-services.json
```

#### 3. Setup App Distribution
```
1. In Firebase Console → App Distribution
2. Click "Get Started"
3. Invite testers (email addresses)
```

#### 4. Setup GitHub Integration

```bash
# Get Firebase token (run locally)
firebase login:ci

# Output: 1/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Add to GitHub secrets:
- `FIREBASE_TOKEN` = token from above
- `FIREBASE_APP_ID` = from Firebase Console → App Settings

### How to Distribute

1. **Automatic**: Push to `main` branch → GitHub Actions builds & distributes
2. **Manual**: Go to Firebase Console → App Distribution → Upload APK manually

### Test on Device

1. Tester receive email invitation
2. Download "Firebase App Testing" app from Play Store
3. Accept invitation → Install GEMA

---

## Option 2: GitHub Releases (Direct Download)

### Setup Steps

1. **Enable Releases**:
   - GitHub repo → Settings → Actions → General
   - Allow "Read and Write" permissions

2. **Build**:
   - Push to main or create tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Download**:
   - Go to GitHub → Releases → Download APK
   - Share directly or host on website

---

## Option 3: Google Play Console (Internal Testing)

### Setup Steps

1. **Create Developer Account**:
   - Go to https://play.google.com/console
   - Pay one-time $25 fee
   - Verify identity

2. **Upload AAB**:
   - Create app → Internal testing
   - Upload AAB from GitHub release
   - Add tester emails
   - Publish to internal testing track

3. **Invite Testers**:
   - Copy internal testing link
   - Send to testers
   - They join via Play Store

### Notes

- $25 one-time fee (no annual)
- Internal testing: up to 100 testers
- Can upgrade to Closed/Open testing later
- AAB preferred over APK for Play Store

---

## Option 4: Private Server / Website

### Simple Distribution

1. Host APK on any web server:
   ```
   https://yourdomain.com/apk/GEMA-v1.0.0.apk
   ```

2. Create download page with:
   ```html
   <a href="GEMA-v1.0.0.apk">Download GEMA</a>
   ```

3. Enable direct install:
   ```html
   <a href="GEMA-v1.0.0.apk">
     <img src="download-button.png">
   </a>
   ```

### Security Note

- APK from unknown sources → Users need to enable "Install unknown apps"
- Consider adding SHA-256 checksum for verification

---

## Comparison

| Method | Cost | Max Testers | Setup Complexity | Best For |
|--------|------|-------------|------------------|----------|
| Firebase App Distribution | Free | 500 | Medium | Internal testing |
| GitHub Releases | Free | Unlimited | Low | Quick distribution |
| Google Play Internal | $25 (one-time) | 100 | High | Play Store prep |
| Private Server | Depends | Unlimited | Low | Custom distribution |

---

## Recommended Flow

### Phase 1: Testing (Week 1-2)
- Use **Firebase App Distribution**
- Get feedback from internal team

### Phase 2: Beta (Week 3-4)
- Use **GitHub Releases** for wider testing
- Or **Google Play Internal Testing** ($25)

### Phase 3: Production (Week 5+)
- Upload **AAB** to Google Play Console
- Switch to production Supabase keys

---

## Post-Distribution Checklist

- [ ] All testers can download and install
- [ ] App opens without crash
- [ ] Login works with production credentials
- [ ] Database connections work
- [ ] Payment flow functional (test with sandbox)

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-13