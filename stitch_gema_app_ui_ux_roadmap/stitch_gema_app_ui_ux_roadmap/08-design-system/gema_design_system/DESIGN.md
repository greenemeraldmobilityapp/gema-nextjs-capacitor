---
name: GEMA Design System
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#376850'
  on-secondary: '#ffffff'
  secondary-container: '#b7ebce'
  on-secondary-container: '#3c6c54'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#baeed1'
  secondary-fixed-dim: '#9ed2b5'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#1e4f3a'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-padding: 16px
  gutter: 12px
---

## Brand & Style

The design system is anchored in a "Modern-Premium" aesthetic that balances high-end service delivery with intuitive functionality. Inspired by leading Asian super-apps, it utilizes a "Clean-Simple" philosophy to reduce cognitive load in a complex marketplace environment.

The brand personality is **Trustworthy, Efficient, and Sophisticated**. It avoids the clutter of traditional marketplaces in favor of a curated, editorial feel. The mobile-first approach ensures that interactions feel tactile and responsive, evoking an emotional response of reliability and ease. 

Key visual drivers include:
*   **Ample Whitespace:** To emphasize content and service quality.
*   **Precision:** Alignment and spacing that suggest high attention to detail.
*   **Premium Materiality:** Using soft elevations and emerald accents to denote value.

## Colors

The color palette is restricted to maintain a premium feel. **Emerald Green (#10B981)** serves as the primary action color, symbolizing growth and reliability. 

*   **Primary:** Used for key calls-to-action, success states, and brand touchpoints.
*   **Background:** Gray-50 (#F9FAFB) provides a soft, non-clinical canvas that makes white surface cards "pop" with subtle depth.
*   **Surface:** Pure White (#FFFFFF) is reserved for interactive cards, sheets, and navigational elements.
*   **Neutrals:** High-contrast slate for typography to ensure accessibility, with light cool-grays for borders and secondary icons.

## Typography

This design system employs a dual-font strategy. **Plus Jakarta Sans** is used for headings to provide a modern, slightly rounded, and premium feel. **Inter** is used for body copy and UI labels to ensure maximum legibility at small scales.

The hierarchy is strictly enforced:
*   **Headlines:** Large and bold to anchor the user's focus.
*   **Body:** Generous line-height (1.5x - 1.6x) to facilitate reading service descriptions.
*   **Labels:** Used for micro-copy and tags, often in semi-bold to distinguish from body text.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile screens. It uses an 8px rhythmic system (with a 4px sub-step) to maintain vertical harmony.

*   **Margins:** A standard 16px (md) or 24px (lg) lateral margin is used for all screen content to prevent edge-crowding.
*   **Stacking:** Elements are grouped with 12px or 16px gaps, while major sections are separated by 32px or 48px to create "breathable" transitions.
*   **Safe Areas:** Strict adherence to mobile safe areas, with floating action buttons positioned 24px from the bottom-right.

## Elevation & Depth

Depth is created through **Ambient Shadows** and **Tonal Layering** rather than heavy borders.

*   **Level 0 (Background):** Gray-50.
*   **Level 1 (Cards/Surface):** White with a very soft `shadow-sm` (4px blur, 2% opacity black).
*   **Level 2 (Active/Floating):** White with `shadow-md` (12px blur, 5% opacity black).
*   **Sheet Depth:** Bottom sheets use a 16px blur backdrop with a subtle 20% opacity black overlay on the background to focus the user’s attention on the interaction.

## Shapes

The shape language is defined by **High Roundedness**, communicating friendliness and safety.

*   **Standard Cards:** Use 16px (rounded-2xl) to 24px (rounded-3xl) corners.
*   **Buttons & Tags:** Generally follow a **Pill-shaped** (full radius) convention to emphasize the "Modern-Premium" look.
*   **Inputs:** Use a 12px or 16px radius to match card containers.
*   **Visual Consistency:** When elements are nested, the inner element radius should be 4-8px smaller than the outer container to maintain concentric visual alignment.

## Components

### Buttons
*   **Primary:** Pill-shaped, Emerald Green background, White text. High-contrast, no border.
*   **Secondary:** Pill-shaped, Emerald Green tint (10% opacity) background with Emerald Green text.
*   **Ghost:** No background, Emerald Green or Dark Gray text, used for low-priority actions.

### Cards
*   **Service Card:** White surface, 24px radius, `shadow-sm`. Content should have 16px internal padding.
*   **Promo Card:** Uses a subtle gradient of Emerald to Deep Emerald with white typography.

### Input Fields
*   **Text Inputs:** 16px radius, Gray-100 background (not white) to blend into the surface or White background with a 1px Gray-200 border. Focused state uses a 2px Emerald Green border.

### Chips & Tags
*   **Status Tags:** Pill-shaped, small (12px font), using "Tonal" coloring (e.g., Light Green background for "Completed" status).

### Selection Controls
*   **Checkboxes/Radios:** Large tap targets (44x44px minimum). Emerald Green fill when active.
*   **Switch:** Smooth animation, Emerald Green toggle for "On" state, Gray-200 for "Off".

### Navigation
*   **Bottom Bar:** White surface, `shadow-md` (top-aligned shadow), active icons in Emerald Green with a subtle dot indicator underneath.