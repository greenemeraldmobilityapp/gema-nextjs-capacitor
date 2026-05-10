# Setup Google OAuth untuk GEMA

## 1. Buat Project di Google Cloud Console

1. Buka https://console.cloud.google.com/
2. Buat project baru (atau pilih project yang sudah ada)
3. Navigasi ke **APIs & Services → OAuth consent screen**
4. Pilih **External** → **Create**
5. Isi:
   - **App name:** `GEMA`
   - **User support email:** (email Anda)
   - **Developer contact information:** (email Anda)
6. Skip **Scopes** (klik Save and Continue)
7. Skip **Test users** (klik Save and Continue)
8. Kembali ke **Dashboard** → **Credentials**

## 2. Buat OAuth Client ID

Pilih **Web application** — ini sudah cukup untuk semua platform (Web, Android, iOS).

**Kenapa pakai "Web application"?** Karena Supabase yang menangani OAuth flow di sisi server. Flow-nya:

```
App → buka browser → login di Google → redirect ke Supabase callback → Supabase redirect balik ke app
```

Device Android/iOS hanya perlu membuka browser — tidak perlu OAuth client khusus platform. Tidak perlu tambahan Android atau iOS OAuth client ID selama Anda menggunakan Supabase Auth.

> **Native Google Sign-In (Opsional):** Jika nanti ingin pakai plugin Capacitor khusus seperti `@codetrix-studio/capacitor-google-auth` untuk pengalaman login native (tanpa redirect browser), maka Anda perlu tambahan **Android** dan **iOS** client ID. Tapi untuk approach Supabase Auth, **Web application saja sudah cukup**.

1. Klik **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. **Name:** `GEMA Web Client`

### Authorized JavaScript origins

Isi untuk development saat ini:

```
https://improved-fiesta-97vr4wqqqxx7fp4p4-3000.app.github.dev
```

Untuk production nanti, tambahkan sesuai platform:

| Platform | URL |
|----------|-----|
| **Web production** | `https://domain-anda.com` |
| **Android (development)** | `http://localhost` |
| **Android + iOS (Capacitor)** | Tidak perlu diisi — karena auth via Supabase callback URL, bukan JavaScript origin |

### Authorized redirect URIs

Google Cloud Console **tidak menerima wildcard** (`/**`). Gunakan URL exact.

Isi untuk development saat ini:

```
https://improved-fiesta-97vr4wqqqxx7fp4p4-3000.app.github.dev
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

> **Yang paling penting adalah URL callback Supabase.** Karena setelah user login di Google, Google akan redirect ke `https://<PROJECT_REF>.supabase.co/auth/v1/callback` — BUKAN langsung ke app Anda.
>
> URL app Anda di redirect URIs hanya berguna jika Anda ingin Google mengizinkan redirect ke domain app (untuk opsi redirect manual). Praktik standarnya: cukup masukkan **keduanya**.

Untuk production:

| Platform | Redirect URI |
|----------|-------------|
| **Web** | `https://domain-anda.com` |
| **Android / iOS** | `https://<PROJECT_REF>.supabase.co/auth/v1/callback` (sama) |

4. Klik **Create**
5. Akan muncul popup **Client ID** dan **Client Secret** — simpan keduanya

## 3. Setting di Supabase Dashboard

1. Buka Supabase Dashboard → **Authentication → Providers**
2. Klik **Google**
3. **Enable** Google provider (toggle ON)
4. Isi:
   - **Client ID:** (dari langkah 2.5)
   - **Client Secret:** (dari langkah 2.5)
5. Di bagian **Callback URLs (OAuth Redirect URLs)** — copy URL ini, nanti ditambahkan ke Google Cloud Console
6. Klik **Save**

## 4. Update Google Cloud Console dengan Callback URL

1. Buka lagi Google Cloud Console → **APIs & Services → Credentials**
2. Edit OAuth client ID yang dibuat tadi (`GEMA Web Client`)
3. Tambahkan ke **Authorized redirect URIs**:
   ```
   https://<PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   *(URL callback dari Supabase step 3.5)*
4. Klik **Save**

## 5. Testing

1. Buka halaman Login GEMA: `/login`
2. Klik **Masuk dengan Google**
3. Harusnya muncul popup login Google
4. Pilih akun Google → authorize → redirect balik ke GEMA

### Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| **redirect_uri_mismatch** | URL callback tidak cocok | Pastikan URL di Google Cloud sama persis dengan di Supabase |
| **403: Access Not Configured** | Google+ API tidak aktif | Enable People API di Google Cloud Console |
| **Halaman putih setelah login** | Site URL di Supabase tidak sesuai | Set Site URL di Supabase Auth Settings ke URL aplikasi |
| **Error: 400** | Client ID/Secret salah | Copas ulang Client ID dan Secret dari Google Cloud |

## 6. Catatan untuk Android / iOS (Capacitor)

### Approach: Supabase Auth + Web Application OAuth

Tidak perlu OAuth client khusus Android/iOS. Cukup satu **Web application** client ID. Flow di mobile:

1. Aplikasi buka `https://<PROJECT_REF>.supabase.co/auth/v1/authorize?provider=google` di browser
2. Chrome Custom Tabs (Android) / ASWebAuthenticationSession (iOS) terbuka
3. User login Google
4. Google redirect ke `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
5. Supabase dapat token → set session → redirect balik ke app

### Setting Deep Link untuk Production

Agar redirect balik ke aplikasi (bukan browser), set **Site URL** di **Supabase Auth Settings**:

```
https://<PROJECT_REF>.supabase.co
```

**Android:** Tambahkan intent filter di `android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="<PROJECT_REF>.supabase.co" />
</intent-filter>
```

**iOS:** Tambahkan di `ios/App/App/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>https</string>
    </array>
  </dict>
</array>
```

### Custom URL Scheme (Alternatif untuk Production)

Gunakan scheme custom sesuai `appId` di `capacitor.config.ts`:

```
com.greenemerald.gema://
```

Setting:
1. **Supabase Auth Settings → Site URL:** `com.greenemerald.gema://`
2. **Google Cloud → Authorized redirect URIs:** `com.greenemerald.gema://`
3. **Android Intent Filter:**
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="com.greenemerald.gema" />
   </intent-filter>
   ```
4. **iOS URL Scheme:** tambahkan `com.greenemerald.gema` ke `CFBundleURLSchemes`
