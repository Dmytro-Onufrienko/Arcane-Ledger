---
name: Arcane Ledger
colors:
  surface: '#fff9ee'
  surface-dim: '#e1dac6'
  surface-bright: '#fff9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf3df'
  surface-container: '#f5edd9'
  surface-container-high: '#f0e8d4'
  surface-container-highest: '#eae2ce'
  on-surface: '#1f1c0f'
  on-surface-variant: '#464741'
  inverse-surface: '#343023'
  inverse-on-surface: '#f8f0dc'
  outline: '#777771'
  outline-variant: '#c7c7bf'
  surface-tint: '#5f5e5c'
  primary: '#040404'
  on-primary: '#ffffff'
  primary-container: '#1e1e1c'
  on-primary-container: '#878683'
  inverse-primary: '#c8c6c3'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#0c0200'
  on-tertiary: '#ffffff'
  tertiary-container: '#361400'
  on-tertiary-container: '#c3713c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2de'
  primary-fixed-dim: '#c8c6c3'
  on-primary-fixed: '#1c1c1a'
  on-primary-fixed-variant: '#474744'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#753401'
  background: '#fff9ee'
  on-background: '#1f1c0f'
  surface-variant: '#eae2ce'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-page: 24px
  card-padding: 12px
  hex-gap: 8px
---

## Brand & Style

This design system is built for immersive tabletop gaming experiences, evoking the tactile sensation of a physical adventurer’s journal. The personality is scholarly, ancient, and reliable, blending historical manuscript aesthetics with modern digital precision.

The style is a hybrid of **Minimalist/Functional** layout and **Tactile/Skeuomorphic** accents. It utilizes high-quality serif typography, delicate line work, and geometric "honeycomb" patterns that suggest magical diagrams or alchemical seals. The interface remains clean to ensure data density and readability, but uses material textures and subtle glows to ground the user in a fantasy world.

**Emotional Response:** Preparedness, mystery, intellectual mastery, and heritage.

## Colors

The palette is derived from natural parchment and archival ink.
- **Background (#F4ECD8):** A warm, desaturated cream that reduces eye strain while providing a paper-like canvas.
- **Primary Ink (#1E1E1C):** A deep, near-black brown used for the majority of text, borders, and functional icons to maintain high legibility.
- **Golden Accents (#D4AF37):** Used sparingly for interactive highlights, magical modifiers, and critical status indicators.
- **Leather Secondary (#8B4513):** A mid-tone brown for semantic groupings and secondary structural elements.

Use low-opacity versions of the primary ink for grid lines and subtle dividers to maintain an "etched" look rather than a digital "rendered" look.

## Typography

The typography system pairs authoritative serifs with modern sans-serifs for a "manuscript-meets-modern-app" feel.

- **Headlines:** Use **Noto Serif** for character names, section headers, and major stats. It provides the necessary literary weight.
- **Body & Data:** Use **Be Vietnam Pro**. It is highly legible at small sizes, which is essential for long lists of skills, inventory, and spell descriptions.
- **Technical Metadata:** Use **JetBrains Mono** for secondary labels like "sv +6" or "14 AC." The monospaced nature evokes a sense of calculated precision and alchemical notation.

All labels should utilize `label-caps` for a professional, categorized appearance. Large display sizes for mobile should be capped at `headline-md` to preserve screen real estate.

## Layout & Spacing

The design system utilizes a **Fixed Grid** approach for the central dashboard and **Fluid Sidebars** for attribute lists.

- **Central Hex-Grid:** A specialized layout component where primary stats are arranged in a interlocking honeycomb pattern. This should remain centered and scaled proportionally.
- **Sidebar Columns:** Skill lists are grouped in cards that stack vertically on mobile and flank the central hex-grid on desktop.
- **Rhythm:** A 4px baseline grid ensures tight, information-dense layouts. Use 16px gutters between cards and 24px margins at the edge of the viewport to allow the parchment background to "breathe."

On mobile, the hex-grid should shrink to fit the width of the screen, while the sidebars reflow into a scrollable vertical list below the main stats.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Bold Outlines** rather than traditional shadows.

1.  **Base Layer:** The parchment background (#F4ECD8).
2.  **Container Layer:** Darker, slightly desaturated brown boxes (#E8DFCC) for card backgrounds, outlined with a crisp 1px primary ink border.
3.  **Active Layer:** Elements that are being hovered or edited receive a subtle internal glow (Inner Shadow) in gold (#D4AF37) to suggest magical activation.
4.  **The "Well":** The central stat area uses a darker, vignette-style background to draw the eye toward the most important numerical data.

Avoid blurred drop shadows; instead, use double-line borders to suggest depth and physical thickness of the "paper" components.

## Shapes

The shape language is defined by two distinct modes:
- **Structural Containers:** Use a `Soft` (4px) corner radius. This prevents the UI from feeling too sharp/aggressive while maintaining a formal, rectangular structure for data lists.
- **Symbolic Shapes:** The Hexagon is the primary geometric motif for high-level attributes (Strength, Dexterity, etc.). All hexagons should feature a consistent 1px stroke.

Interactive elements like tabs or buttons use a slightly higher roundedness (6px) to distinguish them from static data containers.

## Components

### Stat Hexagons
The signature component. Each hexagon features a central large number (Modifier), a label at the top, and base score at the bottom. Use a subtle gradient fill for the primary stat and a gold border for the active/focused stat.

### Skill Sidebars
Cards containing lists of skills. Use a "dotted leader" (e.g., Skill Name . . . . +2) to guide the eye across the row. Proficiency is indicated by a solid circle (primary color), while lack of proficiency is an empty circle.

### Navigation Tabs
Top-aligned tabs with a sharp, rectangular look. The active state is indicated by a solid primary color fill with inverted (parchment-colored) text.

### Buttons & Toggles
Buttons should resemble physical stamps or wax seals. Use high-contrast borders and the `JetBrains Mono` font for button labels to denote "actions."

### Input Fields
Inputs should look like empty underlines on a page. When focused, the line transitions from a subtle grey to a solid primary ink color.