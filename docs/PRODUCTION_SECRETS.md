# Production Secrets Checklist

> Complete setup guide untuk environment variables di production.

---

## 1. GitHub Repository Secrets

Setup di: **GitHub → Repo → Settings → Secrets and variables → Actions**

### Required Secrets

| Secret Name | Required | Description | How to Get |
|-------------|----------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Production Supabase URL | Supabase → Settings → General → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key | Supabase → Settings → API → Project API keys → `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (secret) | Supabase → Settings → API → `service_role` key |
| `XENDIT_API_KEY` | ✅ | Xendit production API key | Xendit Dashboard → Settings → API Keys |
| `ANDROID_SIGNING_KEY` | ✅ | Base64 encoded keystore | Create keystore, then `base64 keystore.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | ✅ | Keystore password | Password used when creating keystore |
| `ANDROID_KEY_ALIAS` | ✅ | Key alias name | Alias used in keytool |
| `ANDROID_KEY_PASSWORD` | ✅ | Key password | Password for key alias |
| `FIREBASE_TOKEN` | Optional | Firebase CLI token | Run `firebase login:ci` locally |
| `SLACK_WEBHOOK_URL` | Optional | Slack webhook for notifications | Slack → Apps → Incoming Webhooks |

### GitHub Variables (Non-sensitive)

| Variable Name | Required | Description | Example |
|---------------|----------|-------------|---------|
| `FIREBASE_APP_ID` | Optional | Firebase App ID (1:xxxxxxx) | Firebase Console → Project Settings |

---

## 2. Create Android Keystore

Jika belum punya keystore, buat dengan:

```bash
# Create keystore (one-time only)
keytool -genkeypair -v -storetype PKCS12 -keystore gema-release.keystore -alias gema -keyalg RSA -keysize 2048 -validity 10000 -storepass YOUR_STORE_PASSWORD -keypass YOUR_KEY_PASSWORD -dname "CN=GEMA, OU=Development, O=GEMA, L=Jakarta, ST= DKI Jakarta, C=ID"

# Encode to Base64 (for GitHub secrets)
base64 -w0 gema-release.keystore
```

**SIMPAN** - Password dan keystore di tempat aman!

---

## 3. Supabase Edge Functions Secrets

Setup di: **Supabase Dashboard → Settings → Edge Functions**

```bash
# Via Supabase CLI
npx supabase secrets set XENDIT_API_KEY="xnd_live_..."
npx supabase secrets set XENDIT_WEBHOOK_TOKEN="your_webhook_token"

# List current secrets
npx supabase secrets list
```

### Required Edge Function Env Vars

| Variable | Source | Description |
|----------|--------|-------------|
| `XENDIT_API_KEY` | Xendit Dashboard | Production API key (prefix: `xnd_live_`) |
| `XENDIT_WEBHOOK_TOKEN` | Xendit Dashboard | Generated when creating webhook |
| `SUPABASE_URL` | Auto | Available in Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Available in Edge Functions |

---

## 4. Xendit Configuration

### 4.1 Get Production API Key

1. Login ke https://dashboard.xendit.co
2. Settings → API Keys
3. Copy **Secret Key** (prefix: `xnd_live_`)
4. Set di Supabase secrets

### 4.2 Setup Webhook

1. Settings → Webhooks
2. Add Webhook URL:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/functions/v1/xendit-webhook
   ```
3. Select Events: `invoice.paid`, `invoice.expired`
4. Save → Copy callback token → Set di Supabase secrets

### 4.3 Switch to Production

Pastikan API key yang digunakan prefix `xnd_live_` (bukan `xnd_=` untuk sandbox)

---

## 5. Firebase Setup (Optional)

### 5.1 Firebase Project

1. Create project di https://console.firebase.google.com
2. Add Android app: `com.greenemerald.gema`
3. Download `google-services.json` → place di `android/app/`

### 5.2 Firebase App Distribution

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login:ci

# Get token (use this for GitHub secret)
```

### 5.3 Setup App Distribution

1. Firebase Console → App Distribution
2. Add testers (email list)
3. Get App ID from Settings

---

## 6. Verify Setup

### Check GitHub Secrets

```bash
# Test workflow locally or check run logs
# All secrets should be accessible in workflow
```

### Check Supabase Secrets

```bash
npx supabase secrets list
# Expected: XENDIT_API_KEY, XENDIT_WEBHOOK_TOKEN visible (masked)
```

### Check Build

```bash
# Run test build locally
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## 7. Security Notes

### NEVER DO

- ❌ Commit secrets to git
- ❌ Put production keys in frontend code
- ❌ Share keystore via email
- ❌ Use sandbox keys in production

### ALWAYS DO

- ✅ Use GitHub secrets for CI/CD
- ✅ Use Supabase secrets for Edge Functions
- ✅ Rotate keys periodically
- ✅ Use different keys for dev/prod

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails: signing key invalid | Verify base64 encoding is correct |
| Webhook fails: 401 | Check XENDIT_WEBHOOK_TOKEN matches |
| Edge Function fails: no API key | Ensure secrets set in Supabase dashboard |
| Firebase: app not found | Check FIREBASE_APP_ID format is `1:xxxxx:android:...` |

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-13