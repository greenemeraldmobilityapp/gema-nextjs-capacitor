# Auth Flow Diagram — GEMA

## 1. Register (Email/Password)

```
[Splash] → [/onboarding] → [/register?role=customer|vendor]
                                  │
                          ┌───────┴───────┐
                          │               │
                    [customer]        [vendor]
                          │               │
                    signUp()          signUp()
                    email+password    email+password
                          │               │
                    ┌─────┴──────┐   ┌────┴──────┐
                    │            │   │           │
              [no session]  [session]  [no session]
              (confirm      auto-      (confirm    [session]
               email)       login)     email)      auto-login
                    │            │        │           │
              /login?      /customer  /login?    vendor_profiles
              registered=  /home      registered insert
              success                =success    + setVendorStatus
                                               + setMode('vendor')
                                               + setVendorStatus(true)
                                                    │
                                              /vendor/profile/
                                              edit?from=register
```

## 2. Login (Email/Password)

```
[/login]
    │
    ├──────────────────┐
    │                  │
 [email/password]  [Lupa Sandi?]
    │                  │
 signInWithPassword  /forgot-password
    │                  │
 ┌──┴──┐          resetPasswordForEmail
 │     │               │
[ok] [error]        email sent
 │     │               │
 │  ┌──┴──┐          user clicks link
 │  │     │               │
 │ [email  [other]   ┌────┴─────┐
 │  not               │         │
 │  confirmed]      [web]    [capacitor]
 │     │               │         │
 │  resend email    /update-  appUrlOpen
 │  button          password  exchangeCode
 │     │           #access_   ForSession
 │     │           token=xxx     │
 │     │           &type=    PASSWORD_
 │     │           recovery  RECOVERY
 │     │               │         │
 │     │           PASSWORD_  onAuthState
 │     │           RECOVERY   Change
 │     │               │         │
 │     │           form: new     │
 │     │           password      │
 │     │           + confirm     │
 │     │               │         │
 │     │           updateUser    │
 │     │           ({password})  │
 │     │               │         │
 │     │           signOut()     │
 │     │               │         │
 │     │           /login +      │
 │     │           toast sukses  │
 │     │               │         │
 │     └───────────────┘         │
 │                               │
 └───────────────────────────────┘
          │
    [redirect to dashboard]
          │
    ┌─────┴──────┐
    │            │
  AuthGuard  SplashScreen
    │            │
    │      getSession() + profile.role
    │            │
    │      ┌─────┴──────┐
    │      │     │      │
    │    admin vendor customer
    │      │     │      │
    │ /admin   /vendor  /customer
    │ /dashboard /dashboard /home
    │
    │  if not profile → /login
    │  if on auth page → redirect to dashboard
```

## 3. Login (Google OAuth)

```
[/login]
    │
 ["Masuk dengan Google"]
    │
 ├─────────────────────┐
 │                     │
 [web]              [capacitor]
 │                     │
 signInWithOAuth     signInWithOAuth
 ({google})           ({google})
 │                     │
 redirect to          Browser.open
 Google consent       (CCT)
 │                     │
 Google redirect      user logs in
 → callback URL       → redirect to
                       custom scheme
 │                     │
 │                appUrlOpen listener
 │                exchangeCodeForSession
 │                     │
 ├─────────────────────┘
 │
 onAuthStateChange → SIGNED_IN
 │
 ├── fetchProfile (users table)
 │   ┌── PGRST116 (not found)
 │   │   → ensureProfileExists
 │   │   → role = 'customer' (default)
 │   │   → retry fetch
 │   └── found → setProfile
 │
 ├── checkVendorStatus (vendor_profiles table)
 │   └── set isVendor
 │
 ├── initMode
 │   ├── localStorage gema_mode
 │   └── fallback ke profile.role
 │
 └── redirect to dashboard
     (via AuthGuard)
```

## 4. Dual-Role (1 Email, 2 Role)

```
[Customer Home]
    │
    ├── isVendor? ───────────────┐
    │   │                        │
    │  [false]                  [true]
    │   │                        │
    │  banner:                  ─┴─
    │  "Daftar sebagai          │
    │   Mitra Kami"             │
    │   │                  [Profile] → card:
    │   ▼                  "Mode Mitra" →
    │  /customer/          toggle mode
    │  register-vendor
    │   │
    │  form: spesialisasi
    │  + nama toko + bio
    │   │
    │  INSERT vendor_profiles
    │  setVendorStatus(true)
    │  setMode('vendor')
    │  localStorage: gema_mode='vendor'
    │   │
    │  success screen
    │   │
    │  ┌─────┴──────┐
    │  │            │
    │  [Buka        [Nanti,
    │   Dashboard]  kembali]
    │  │            │
    │  setMode      /customer
    │  ('vendor')   /home
    │  │
    │  /vendor/dashboard
    │
    └────────────────────────────┘

[Switching Modes]
    │
    ├── Profile (customer)
    │   └── isVendor? → "Mode Mitra" → toggle
    │
    ├── Profile (vendor)
    │   └── isVendor && role ≠ vendor?
    │       → "Mode Pelanggan" → toggle
    │
    └── Toggle:
        setMode(newMode)
        localStorage.gema_mode = newMode
        router.push(
          newMode === 'vendor'
          ? '/vendor/dashboard'
          : '/customer/home'
        )

[Splash Redirect]
    │
    ├── session? → query users.role
    │   │
    │   ├── admin → /admin/dashboard
    │   │
    │   ├── vendor_profiles exists?
    │   │   ├── yes → localStorage gema_mode
    │   │   │   ├── 'customer' → /customer/home
    │   │   │   └── default → /vendor/dashboard
    │   │   └── no → role-based redirect
    │   │
    │   └── customer → /customer/home
    │
    └── no session → /login (or /onboarding)
```

## 5. Password Management

```
[Settings] → [Keamanan]
    │
    ├── supabase.auth.getUser()
    │   └── user.app_metadata.providers
    │       │
    │       ├── includes 'email'
    │       │   → user HAS password
    │       │   → form: Old + New + Confirm
    │       │
    │       └── doesn't include 'email'
    │           → user NO password (Google-only)
    │           → form: New + Confirm (no old)
    │
    └── submit → updateUser({password})
        │
        ├── success → toast + redirect back
        └── error → toast + inline error

[Forgot Password]
    │
    ├── /forgot-password → enter email
    │
    ├── resetPasswordForEmail({redirectTo})
    │   ├── web: /update-password
    │   └── capacitor: com.greenemerald.gema://callback
    │
    └── user clicks link → password recovery flow
```

## 6. Email Confirmation (mailer_autoconfirm=false)

```
[Register] → signUp()
    │
    ├── email confirmation REQUIRED
    │   ├── email sent (template ID)
    │   └── user clicks link
    │       ├── web → redirect to pages.dev
    │       │   #access_token=xxx
    │       │   → auto login
    │       └── native → custom scheme
    │           → appUrlOpen
    │           → exchangeCodeForSession
    │
    ├── login attempt (unconfirmed)
    │   └── error: "Email belum dikonfirmasi"
    │       + button "Kirim Ulang Email"
    │
    └── resend → supabase.auth.resend({type:'signup'})
```

## 7. Auth Guard Summary

```
┌─────────────────────────────────────────────────────┐
│                   AuthGuard                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Not Authenticated│    │   Authenticated       │   │
│  │                   │    │                       │   │
│  │  /login        → │    │  /login              │   │
│  │  /register     → │    │  /register           │   │
│  │  /onboarding   OK│    │  /onboarding  REDIRECT│   │
│  │  /forgot-pwd   → │    │  /forgot-pwd  based  │   │
│  │  /update-pwd   → │    │  /update-pwd  on     │   │
│  │                   │    │  isVendor + role     │   │
│  │  other routes →   │    │                       │   │
│  │  /login          │    │  /update-pwd → KEEP   │   │
│  └──────────────────┘    └──────────────────────┘   │
│                                                     │
│  Vendor layout: isVendor || role === 'vendor'       │
│  Customer layout: no guard (accessible to all)      │
│  Admin layout: role === 'admin'                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 8. Provider Flow

```
RootLayout
  │
  ├── QueryProvider (TanStack React Query)
  │
  ├── AuthProvider
  │   │
  │   ├── createClient() × 1 (module-level)
  │   │
  │   ├── useEffect → getSession()
  │   │   ├── session? → fetchProfile()
  │   │   └── no session → reset()
  │   │
  │   ├── onAuthStateChange
  │   │   ├── PASSWORD_RECOVERY → /update-password
  │   │   ├── SIGNED_IN → fetchProfile()
  │   │   ├── USER_UPDATED → fetchProfile()
  │   │   └── SIGNED_OUT → reset()
  │   │
  │   ├── fetchProfile(userId, email, metadata)
  │   │   ├── SELECT users WHERE id = userId
  │   │   ├── PGRST116? → ensureProfileExists()
  │   │   │   └── INSERT users (retry fetch)
  │   │   ├── setProfile(data)
  │   │   ├── checkVendorStatus(userId)
  │   │   │   └── SELECT vendor_profiles → isVendor
  │   │   └── initMode()
  │   │       ├── localStorage gema_mode? → use it
  │   │       └── else → fallback ke profile.role
  │   │
  │   └── Capacitor appUrlOpen
  │       └── exchangeCodeForSession
  │
  ├── AuthGuard → role-based redirect
  │
  ├── Toaster (sonner)
  ├── NotificationInit
  └── AndroidBackHandler
```
