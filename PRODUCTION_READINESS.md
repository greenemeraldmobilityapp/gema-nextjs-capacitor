# PRODUCTION_READINESS.md — GEMA

Version 1.0.0

---

## 1. Overview

Dokumen ini berisi checklist dan roadmap untuk mempersiapkan GEMA menuju Live Production. Semua items wajib dipenuhi sebelum deployment.

**Target Platform**: Android (iOS dicatat untuk future jika Apple ID tersedia)

---

## 2. Build Artifacts

| Artifact | Purpose | Trigger |
|----------|---------|---------|
| **APK** (debug) | Internal testing / QA | Manual trigger atau branch `develop` |
| **AAB** (release) | Google Play Store submission | Tag release (v1.0.0+) |

---

## 3. Pre-Production Checklist

### 3.1 Code & Configuration

- [ ] **Versi codebase**: 1.0.0
- [ ] **Branch strategy**: `main` = production ready
- [ ] **Changelog**: Dibuat untuk setiap release
- [ ] **Build test**: `npm run build` = 0 errors
- [ ] **Lint test**: `npm run lint` = passes (no new errors)
- [ ] **TypeScript**: Strict mode, 0 errors

### 3.2 Database & Schema

- [ ] **Migrations**: Semua migrations sudah di-apply ke production DB
- [ ] **RLS Policies**: Aktif dan tested untuk semua tabel
- [ ] **Indexing**:cek performance untuk query besar
- [ ] **Seed data**: Promo awal, admin user sudah ada

### 3.3 Supabase Project

- [ ] **Project URL**: Production URL dikonfigurasi
- [ ] **Anon Key**:Production key di-set
- [ ] **Service Role Key**: Hanya di server-side (jangan di frontend)
- [ ] **Edge Functions**: Semua functions deployed ke production
  - [ ] `create-invoice`
  - [ ] `xendit-webhook`
  - [ ] `release-payment`
- [ ] **Storage Buckets**: Portfolios, KYC documents
- [ ] **Auth Settings**: Konfigurasi redirect URLs untuk production domain

### 3.4 Payment (Xendit)

- [ ] **API Keys**: Production Xendit keys di Edge Functions env
- [ ] **Webhook URL**: Production Edge Function URL sudah di-register
- [ ] **Webhook Token**: Compatible dengan Xendit dashboard
- [ ] **Test Payment**: Done dengan sandbox, dokumentasikan
- [ ] **Production Mode**: Switch dari sandbox ke production

### 3.5 Security

- [ ] **Environment Variables**: Semua secrets di-set dengan benar
- [ ] **CORS**: Konfigurasi untuk production domain
- [ ] **Rate Limiting**: Edge Functions sudah ada limits
- [ ] **RLS Verified**: Semua tabel sudah di-test

### 3.6 Assets

- [ ] **App Icon**: 1024x1024 untuk Android Adaptive Icon
- [ ] **Splash Screen**: Logo GEMA, background #10B981
- [ ] **App Name**: "GEMA" atau "GEMA - Layanan Profesional"

### 3.7 Capacitor Configuration

- [ ] **App ID**: `com.greenemerald.gema`
- [ ] **App Name**: `GEMA`
- [ ] **Version**: `1.0.0`
- [ ] **Build Number**: `1` (increment setiap build)
- [ ] **Android Permissions**:
  - [ ] `ACCESS_FINE_LOCATION`
  - [ ] `ACCESS_COARSE_LOCATION`
  - [ ] `INTERNET`
  - [ ] `ACCESS_NETWORK_STATE`

---

## 4. Secrets Configuration

### 4.1 Required Environment Variables

#### Frontend (NEXT_PUBLIC_*)

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) | Supabase Dashboard → Settings → API |

#### Backend (Supabase Edge Functions)

| Variable | Description | Source |
|----------|-------------|--------|
| `SUPABASE_URL` | Supabase project URL | Automatic in Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Supabase Dashboard → Settings → API |
| `XENDIT_API_KEY` | Xendit secret key | Xendit Dashboard → Settings → API Keys |
| `XENDIT_WEBHOOK_TOKEN` | Webhook verification token | Xendit Dashboard → Webhooks |

#### GitHub Actions Secrets

| Secret | Description | Where to Set |
|--------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL | GitHub Repo → Settings → Secrets |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key | GitHub Repo → Settings → Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | GitHub Repo → Settings → Secrets |
| `XENDIT_API_KEY` | Production Xendit key | GitHub Repo → Settings → Secrets |
| `ANDROID_SIGNING_KEY` | Keystore untuk signing APK | Base64 encoded |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | GitHub Secrets |
| `ANDROID_KEY_ALIAS` | Key alias | GitHub Secrets |
| `ANDROID_KEY_PASSWORD` | Key password | GitHub Secrets |

---

## 5. GitHub Actions Workflows

### 5.1 Workflow Files

```
.github/
├── workflows/
│   ├── capacitor-android-apk.yml      # Debug APK build
│   ├── capacitor-android-aab.yml      # Release AAB build
│   └── capacitor-android-release.yml   # Full release pipeline
```

### 5.2 Build Triggers

| Workflow | Trigger | Output |
|----------|---------|--------|
| `capacitor-android-apk.yml` | Push ke `develop` atau manual dispatch | Debug APK |
| `capacitor-android-aab.yml` | Tag `v*` (release) | Release AAB |
| `capacitor-android-release.yml` | Manual dispatch dengan version | Signed APK + AAB |

---

## 6. Distribution (Gratis)

### 6.1 Options

| Method | Cost | Max Testers | Notes |
|--------|------|--------------|-------|
| **Firebase App Distribution** | Free | 500 | Google account required |
| **Google Play Internal Testing** | Free (one-time $25) | 100 | Setelah paid, unlimited internal |
| **Direct APK Download** | Free | Unlimited | Manual hosting (misal: GitHub Releases) |
| **Firebase App Distribution** recommended untuk early testing

### 6.2 Firebase App Distribution Setup

1. **Buat project di Firebase Console**
2. **Integrasi dengan Android project**:
   ```bash
   firebase init appdistribution
   ```
3. **Setup CI**:
   - Create Firebase token: `firebase login:ci`
   - Add to GitHub Secrets: `FIREBASE_TOKEN`
4. **Configure testers**:
   - Add email list di Firebase Console
   - Atau use open beta link

---

## 7. Post-Launch Monitoring

### 7.1 Metrics yang Dimonitor

- **Crashlytics**: Automatic via Firebase
- **Performance**: Firebase Performance
- **Analytics**: Mixpanel atau Firebase Analytics

### 7.2 Alerting

- **Payment failures**: Xendit webhook failures
- **Auth errors**: Rate limiting triggers
- **Database**: Connection pool exhaustion

---

## 8. Rollback Plan

Jika production bermasalah:

1. **Revert Git tag**: Hapus tag dan revert commit
2. **Database**: Point-in-time recovery tersedia (Supabase)
3. **Hotfix flow**: `hotfix/*` branch → rapid merge → tag baru

---

## 9. iOS Notes (Future)

Ketika Apple Developer Account tersedia:

1. **Apple Developer Program**: $99/year
2. **Certificates**: Distribution certificate + provisioning profile
3. **Workflow**: `.github/workflows/capacitor-ios.yml`
4. **TestFlight**: Untuk beta testing

---

## 10. Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Pre-flight checks | 1-2 days | Verifikasi semua items |
| Secrets setup | 1 day | Konfigurasi semua env |
| GitHub Actions | 1 day | Workflow setup + testing |
| QA Testing | 3-5 days | Full regression test |
| Build AAB | 1 day | Production build |
| Play Store submission | 1-3 days | Review time varies |
| **Total** | **~1-2 weeks** | From start to live |

---

## 11. Appendix

### A. Useful Commands

```bash
# Build APK locally
npm run build
npx capacitor add android
npx capacitor build android

# Create release build
npx capacitor build android --release

# Sync to device
npx capacitor run android
```

### B. Key Files Reference

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration |
| `next.config.ts` | Next.js static export config |
| `drizzle.config.ts` | Database ORM config |
| `supabase/config.toml` | Edge Functions config |
| `.env.example` | Template untuk env variables |

### C. Important URLs

- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Xendit Dashboard**: `https://dashboard.xendit.co`
- **Firebase Console**: `https://console.firebase.google.com`
- **Google Play Console**: `https://play.google.com/console`

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-13  
**Author**: Development Team