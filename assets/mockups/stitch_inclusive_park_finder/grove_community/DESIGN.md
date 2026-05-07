# Design System Specification: The Organic Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Glade."** 

Unlike traditional "utility" apps that feel clinical or purely transactional, this system treats the mobile interface as a natural extension of the park experience itself. We move away from the rigid, boxed-in layouts of standard Material Design, favoring **Organic Layering** and **Asymmetric Breathing Room**. 

By utilizing soft, overlapping surfaces and generous whitespace, we evoke a sense of calm and accessibility. The goal is to guide the user through the interface as if they were walking a well-maintained path—intentional, safe, and welcoming.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
This system relies on color-blocking and tonal shifts rather than structural lines to define space.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
- *Example:* A `surface-container-low` card sitting on a `surface` background provides all the definition needed.

### Color Tokens
- **Primary (The Forest):** `#1b6d24` (Primary) / `#5dac5b` (Primary Container). Use for main brand moments and grounding elements.
- **Secondary (The Sky):** `#005faf` (Secondary) / `#54a0fe` (Secondary Container). Use sparingly for interactive "waypoints" and secondary actions.
- **Surface Hierarchy:** 
    - `surface-container-lowest` (#ffffff): The "hero" card level.
    - `surface` (#f9f9f9): The base canvas.
    - `surface-container-high` (#e8e8e8): Inset elements or search bars.

### The "Glass & Gradient" Rule
To add professional polish, utilize **Glassmorphism** for floating elements (e.g., a bottom nav or a persistent "Filter" button). 
- **Backdrop Blur:** 12px–20px.
- **Fill:** `surface` at 80% opacity.
- **Signature Textures:** Use a subtle linear gradient from `primary` to `primary-container` for large CTAs to provide a "living" feel rather than a flat, plastic look.

---

## 3. Typography: Editorial Clarity
We use a dual-font approach to balance personality with extreme readability.

- **Display & Headlines:** *Plus Jakarta Sans*. This typeface offers a wide "aperture" and modern feel. Use `headline-lg` (2rem) for screen titles to establish an authoritative yet friendly voice.
- **Body & Labels:** *Be Vietnam Pro*. This font is optimized for legibility at smaller scales.
- **The Hierarchy Strategy:** Use `title-lg` (1.375rem) for park names in card components. Never go below `body-md` (0.875rem) for functional text to ensure inclusivity for users with visual impairments.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often too "heavy" for a friendly community app. Instead, we use **Tonal Layering**.

- **The Layering Principle:** Stack `surface-container-lowest` cards on top of a `surface-container-low` background. This creates a natural "lift" based on color value rather than simulated light.
- **Ambient Shadows:** If a floating action button (FAB) requires a shadow, use:
    - `Blur: 24px` / `Spread: -4px` / `Color: on-surface @ 6% opacity`.
- **The "Ghost Border" Fallback:** If a container lacks contrast (e.g., an image on a light background), use a "Ghost Border": `outline-variant` at **15% opacity**. Never use 100% opaque outlines.

---

## 5. Components: Tactile & Accessible

### Buttons (The "Touch-First" Philosophy)
- **Primary:** High-pill shape (`rounded-full`), `primary` background, `on-primary` text. Minimum height: **56px** to ensure a massive tap target.
- **Secondary:** `secondary-container` background with `on-secondary-container` text. Use for "Get Directions" or "Call Park."

### Accessible Card Components
- **Rules:** Forbid divider lines within cards. 
- **Structure:** Use `sm` (0.5rem) spacing between labels and `md` (1.5rem) padding for the container. 
- **Style:** `rounded-lg` (2rem) corners. The large radius feels "softer" and more approachable.

### Friendly Form Fields
- **Background:** `surface-container-highest`.
- **Shape:** `rounded-md` (1.5rem).
- **Interaction:** On focus, the background shifts to `primary-fixed-dim` with a 2px `primary` ghost-border. This provides a "glow" effect that feels supportive, not clinical.

### Bottom Navigation Bar
- **Style:** A floating island (`rounded-xl`) positioned 16px from the screen bottom. 
- **Visuals:** Use Glassmorphism (80% `surface` + blur). Active states use a `primary-container` pill behind the icon.

### Additional Component: "The Accessibility Quick-Toggle"
A specialized chip component using `tertiary-container` (#cd8f00) that allows users to quickly filter for specific needs (e.g., "Wheelchair Friendly," "Tactile Paths") directly from the header.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetric margins (e.g., 24px on the left, 16px on the right) for title headers to create an editorial, premium feel.
- **Do** use icons with text labels. Never rely on an icon alone for navigation.
- **Do** favor vertical whitespace. If you think there is enough space, add 8px more.

### Don’t
- **Don’t** use pure black (#000000). Always use `on-surface` (#1a1c1c) for high-contrast text to reduce eye strain.
- **Don’t** use sharp 90-degree corners. Everything in this system must feel "held" and safe.
- **Don’t** use "Alert Red" for non-critical errors. Use `error-container` to keep the tone supportive and calm even when something goes wrong.