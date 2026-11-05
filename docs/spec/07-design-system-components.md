The spec has been written to `/Users/manu/_CODE/ENERGICA/_CODE/energica_payments/docs/ai-specs/specs/07-design-system-components.md`.

Here is a summary of everything covered:

**Section 1 — Non-Negotiable Constraints**
Tailwind CSS 3 only, no MUI, `dark:` variants required on every colour class, always use `Button` not raw `<button>`, always use `twMerge`.

**Section 2 — Color Palette**
Primary `#4DBFD9` mapped to `primary` / `theme.1` / `theme.2`. Full semantic token table (secondary, success, info, warning, pending, danger, light, dark). Complete `darkmode-50` through `darkmode-900` RGB values. Body background hardcoded to `#4DBFD9` in `_global.css`. `.box` CSS class documented.

**Section 3 — Typography**
Public Sans is the active body font (`font-public-sans`). Base: `text-sm`, `letter-spacing-wide`, `text-slate-600`, `line-height-5`. Full type scale reference table.

**Section 4 — Spacing**
4 px base unit, card padding `p-8`, grid gaps `gap-y-10 gap-x-6`, standard column layout (`col-span-10 col-start-2 max-w-3xl`).

**Section 5 — Dark Mode**
Class-based (`.dark` on `<html>`). Redux `darkModeSlice` seeded from localStorage. `ThemeSwitcher` applies the class. Rules for every dark variant pattern.

**Section 6 — Component Catalog (exhaustive)**

- **Button** — all 28 variants (primary/secondary/success/warning/pending/danger/dark, outline-*, soft-*, social), `size`, `elevated`, `rounded`, polymorphic `as`.
- **FormInput** — `formInputSize`, `rounded`, context-aware (FormInline, InputGroup).
- **FormSelect** — `formSelectSize`, chevron background, context-aware.
- **FormTextarea** — matches FormInput API.
- **FormCheck** — compound (`FormCheck.Input` type radio|checkbox, `FormCheck.Label`). Checked state classes documented.
- **FormSwitch** — wraps FormCheck, toggle visual (`w-[38px] h-[24px]`, thumb translate).
- **FormLabel** — `inline-block mb-2`, auto right-aligns inside FormInline.
- **FormHelp** — `text-xs text-slate-500 mt-2`.
- **FormInline** — context provider, `block sm:flex items-center`.
- **InputGroup** — flex row joining inputs with text prefixes/suffixes.
- **LoadingIcon** — all 12 icon variants documented, color prop, sizing via className.
- **Lucide** — wrapper, default `stroke-[1] w-5 h-5`, named `icons` export.
- **Dialog** — sizes sm/md/lg/xl, staticBackdrop, Panel/Title/Description/Footer sub-components, backdrop gradient.
- **Disclosure** — Group (selectedIndex, variant default|boxed), Button, Panel. Transition timing.
- **Menu** — 12 placement options, Button/Items/Item/Header/Footer/Divider sub-components.
- **Popover** — same 12 placements, Button/Panel.
- **Slideover** — right-edge drawer, same sizes as Dialog, scrollable Description.
- **Tab** — 4 variants (tabs/pills/boxed-tabs/link-tabs), Group/List/Tab/Button/Panels/Panel.
- **Pagination** — Link with active state.
- **Progress** — track + Bar (width set via style or className).
- **Table** — dark/bordered/hover/striped/sm props, Thead variant (default/light/dark), Tbody/Tr/Th/Td.
- **Tippy** — tippy.js wrapper, content prop, options passthrough.
- **Splash / Logo_animate** — full-page primary bg + animated wordmark (2.2s fill cycle #4AE7FD→#FFFFFF→#FF136A). Named export.
- **ScrollToTop** — null-render route utility, scrolls on pathname change.

**Section 7 — SVG Assets**
- `Logo` (white, 189×70) — coloured backgrounds
- `LogoColor` — light backgrounds
- `LogoMercadoPago` (140×48) — MercadoPago payment option
- `Swimmer` (352×500) — decorative illustration

**Section 8 — CSS File Organization**
Full directory tree, import order in `app.css`, all custom class names (`.box`, `.box--stacked`, `.image-fit`, `.scrollbar-hidden`, `.typing-dots`).

**Section 9 — Page Layout Pattern**
Standard 12-column grid, `col-span-10 col-start-2 max-w-3xl` content column.

**Section 10 — Do's and Don'ts**
Consolidated rules from DESIGN.md constraints plus codebase-derived patterns.

**Section 11 — Tailwind Config Summary**
`darkMode: "class"`, container max-widths, font aliases, registered background images, CSS custom property injection mechanism.
