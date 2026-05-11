# Folder Structure — Stitch Gema App UI/UX Roadmap

> Base path: `stitch_gema_app_ui_ux_roadmap/stitch_gema_app_ui_ux_roadmap/`

## Struktur Final (Setelah Pengelompokan)

```
stitch_gema_app_ui_ux_roadmap/stitch_gema_app_ui_ux_roadmap/
│
├── 01-splash/                              # → app/page.tsx
│   └── refined_splash_screen/
│       ├── code.html
│       └── screen.png
│
├── 02-auth/                                # → app/(auth)/
│   ├── sign_in_with_google_social_login/   #   → login/
│   │   ├── code.html
│   │   └── screen.png
│   ├── sign_up_form_with_google_social_login/ # → register/
│   │   ├── code.html
│   │   └── screen.png
│   └── sign_up_role_selection/             #   → register/role/
│       ├── code.html
│       └── screen.png
│
├── 03-onboarding/                          # → app/onboarding/
│   └── onboarding_discovery/
│       ├── code.html
│       └── screen.png
│
├── 04-customer/                            # → app/customer/*
│   ├── customer_home_map_view/             #   → home/
│   │   ├── code.html
│   │   └── screen.png
│   ├── booking_detail/                     #   → booking/
│   │   ├── code.html
│   │   └── screen.png
│   ├── booking_summary_refined/            #   → booking/
│   │   ├── code.html
│   │   └── screen.png
│   ├── orders_history_list/                #   → orders/
│   │   ├── code.html
│   │   └── screen.png
│   ├── chat_vendor_communication/          #   → chat/ (juga vendor/chat/)
│   │   ├── code.html
│   │   └── screen.png
│   ├── customer_profile/                   #   → profile/
│   │   ├── code.html
│   │   └── screen.png
│   ├── edit_profile/                       #   → profile/edit/
│   │   ├── code.html
│   │   └── screen.png
│   ├── customer_reviews_feedback/          #   → review/
│   │   ├── code.html
│   │   └── screen.png
│   ├── payment_methods/                    #   → payment/methods/
│   │   ├── code.html
│   │   └── screen.png
│   ├── payment_success/                    #   → payment/success/
│   │   ├── code.html
│   │   └── screen.png
│   ├── help_center/                        #   → help/
│   │   ├── code.html
│   │   └── screen.png
│   ├── faq_detail/                         #   → help/faq/
│   │   ├── code.html
│   │   └── screen.png
│   ├── notification_settings/              #   → settings/notifications/
│   │   ├── code.html
│   │   └── screen.png
│   └── account_security_settings/          #   → settings/security/
│       ├── code.html
│       └── screen.png
│
├── 05-vendor/                              # → app/vendor/*
│   ├── vendor_dashboard_overview/          #   → dashboard/
│   │   ├── code.html
│   │   └── screen.png
│   ├── vendor_profile_details/             #   → profile/
│   │   ├── code.html
│   │   └── screen.png
│   ├── vendor_profile_with_service_address/ #  → profile/address/
│   │   ├── code.html
│   │   └── screen.png
│   ├── edit_vendor_profile_map_picker/     #   → profile/edit/
│   │   ├── code.html
│   │   └── screen.png
│   ├── portfolio_management/               #   → portfolio/
│   │   ├── code.html
│   │   └── screen.png
│   ├── add_portfolio_form/                 #   → portfolio/add/
│   │   ├── code.html
│   │   └── screen.png
│   ├── vendor_verification_intro/          #   → verification/
│   │   ├── code.html
│   │   └── screen.png
│   ├── identity_verification_ktp/          #   → verification/ktp/
│   │   ├── code.html
│   │   └── screen.png
│   ├── professional_certification/         #   → verification/certification/
│   │   ├── code.html
│   │   └── screen.png
│   └── verification_under_review/          #   → verification/review/
│       ├── code.html
│       └── screen.png
│
├── 06-wallet/                              # → app/wallet/*
│   ├── gemapay_digital_wallet/             #   → (root)/
│   │   ├── code.html
│   │   └── screen.png
│   ├── promo_voucher_detail/               #   → promo/
│   │   ├── code.html
│   │   └── screen.png
│   └── promo_voucher_history/              #   → vouchers/
│       ├── code.html
│       └── screen.png
│
├── 07-shared/                              # → components/shared/
│   └── premium_featured_deal_banner/
│       ├── code.html
│       └── screen.png
│
└── 08-design-system/                       # → Design tokens & system
    └── gema_design_system/
        └── DESIGN.md
```

---

## Ringkasan

| Grup | Isi | Mapping Route |
|------|-----|---------------|
| `01-splash/` | 1 folder | `app/page.tsx` |
| `02-auth/` | 3 folder | `app/(auth)/` |
| `03-onboarding/` | 1 folder | `app/onboarding/` |
| `04-customer/` | 14 folder | `app/customer/*` |
| `05-vendor/` | 10 folder | `app/vendor/*` |
| `06-wallet/` | 3 folder | `app/wallet/*` |
| `07-shared/` | 1 folder | `components/shared/` |
| `08-design-system/` | 1 folder | Design system |
| **Total** | **34 folder** | |
