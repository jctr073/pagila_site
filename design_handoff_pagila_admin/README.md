# Pagila Catalog Admin — Design Handoff

A hi-fi interactive design for an admin site that lets a **catalog admin** curate films, manage inventory, and oversee stores & staff against the [Pagila](https://github.com/devrimgunduz/pagila) PostgreSQL sample database.

This bundle ships **into the existing Next.js 16 / TypeScript / Postgres scaffold** at the root of this repo (`src/app/`, `src/lib/db.ts`, etc.). Implement the screens described below as new App-Router routes that read from Pagila via the already-configured `pg` pool.

---

## 1. About the design files

`designs/Pagila Admin.html` is an HTML+React+Babel prototype rendered in the browser. **It is a design reference, not production code to copy verbatim.** You are recreating the same look, layout, and behavior natively in the Next 16 codebase using:

- React Server Components for data-loading screens
- Client Components only for interactive bits (selection state, sort/filter, modal/drawer open state, inline edit, theme toggle)
- Tailwind CSS v4 for styling (already configured)
- The `pg` pool from `src/lib/db.ts` for queries
- No new dependencies needed for the MVP — the design uses pure CSS and inline SVG icons. If you want a polished icon set or chart library, add `lucide-react` and `recharts`, but it is optional.

> ⚠️ **Next.js 16 has breaking changes from earlier versions.** This repo's `AGENTS.md` says: read the relevant guide in `node_modules/next/dist/docs/` before writing any code. In particular: server actions, dynamic route params, cookies/headers, and route handlers have new shapes. Trust the local docs over your training data.

## 2. Fidelity

**High-fidelity.** Final colors, typography, spacing, copy, and interactions are all locked. Recreate pixel-perfectly. Where the prototype uses placeholder mock data, swap in real Pagila rows from Postgres.

## 3. Files in this bundle

```
design_handoff_pagila_admin/
├── README.md               ← this file (start here)
├── IMPLEMENTATION_PLAN.md  ← concrete Next 16 file map + order of work
├── DATA_MODEL.md           ← SQL queries for every screen, mapped to Pagila tables
└── designs/
    ├── Pagila Admin.html   ← open this in a browser to see all artboards
    ├── tokens.jsx          ← design tokens (CSS variables, palette, fonts)
    ├── primitives.jsx      ← Btn, Input, Chip, Rating, Check, Sparkline, Avatar, Icon
    ├── shell.jsx           ← Sidebar + Topbar + page layout
    ├── dashboard.jsx       ← Dashboard screen
    ├── films-list.jsx      ← Films list table + toolbar + bulk-bar
    ├── film-detail.jsx     ← Film detail drawer + edit modal
    ├── stores-staff.jsx    ← Stores cards + staff table
    ├── app.jsx             ← Mounts everything in the design canvas
    ├── design-canvas.jsx   ← Canvas wrapper (NOT to be ported)
    └── tweaks-panel.jsx    ← Tweaks UI (NOT to be ported as-is — see §10)
```

To view the design: `cd designs && python3 -m http.server 8000`, then open `http://localhost:8000/Pagila Admin.html`.

---

## 4. Screens

Five artboards in the prototype, three of which are full pages and two of which are overlays on the films list.

### 4.1 Dashboard — `/` (or `/dashboard`)
**Purpose:** At-a-glance health of the catalog and stores.

**Layout** (1280×820 prototype frame; in production it's fluid):

- Page header: greeting + last-sync timestamp + "Last 30 days" filter button + "New film" primary button.
- **KPI row** — 4-column grid, 14px gap. Each tile (`pa-card db-kpi`):
  - Icon + uppercase label (top)
  - Big number (`26px / 700 / -.02em`) + sparkline aligned right
  - Delta chip below: green-up arrow + percentage + "vs. last 30d" muted text
  - KPIs: **Total films**, **Active rentals**, **Low-stock films**, **MTD revenue**
- **Two-column block** (1.6fr / 1fr, 14px gap):
  - **Left card — Rentals last 14 days:** Section header (h3 + sub + "+18% WoW" success chip + "Daily" dropdown). Bar chart, 14 historical bars + 2 dashed future bars. Today's bar uses solid `--accent`; the rest use `--accent-soft` with `--accent-soft-border`. Axis labels in mono (May 3 → today). Divider, then a 2×2 grid of mini-tiles: per-store rental avgs, avg rental duration, overdue rentals.
  - **Right column** — stacked:
    - **Top films this month** card: numbered list of 5 films, each row shows rank · title · category chip · count.
    - **Recent activity** card: live feed with colored dots (accent, teal, success, warning) + body text + mono timestamp.

### 4.2 Films list — `/films`
**Purpose:** Browse, filter, sort, bulk-edit films. Primary work surface for the catalog admin.

**Layout:**

- Page header: "Films" / "1,000 titles across 2 stores · 4,581 inventory units" / Import CSV ghost button + grid/list toggle.
- **Toolbar row** (`fl-toolbar`): Search input (240px wide) + filter pills (Category, Rating, Length) + "More filters" ghost + sort button + Export ghost + "New film" primary, right-aligned.
- **Bulk bar** (shown only when selection > 0): full-width persimmon-accent bar with check + count + bulk actions (Set category, Move to store, Archive, Duplicate, Delete-danger).
- **Table card** (`pa-card`, rounded, subtle shadow):
  - Sticky header row with surface-2 bg, uppercase 11px labels with hover-active sort icons.
  - Columns: Checkbox (36px), ID (54px, mono `#001`), Title (poster thumb 28×38px + title + meta), Category (chip), Rating (colored pill), Length (mono "86 min"), Rate (mono "$0.99"), Inventory (stock bar 40px + count), Demand (56×20 sparkline), Last updated (mono "04/18"), kebab (32px).
  - Row height controlled by `--row-h` (32 / 40 / 48px for compact/regular/comfy).
  - Three table styles toggleable: `lined` (default — single bottom border), `zebra` (alternating surface-2 rows), `cards` (each row floats as own rounded card with shadow, separated by 6px).
- **Footer**: "1–25 of 1,000 films" + rows-per-page dropdown + pagination buttons (active = accent fill).

**Interactions:**
- Click row → opens detail drawer.
- Double-click Category or Rate cell → inline edit (border + accent ring); blur or Enter to commit.
- Header click → toggle sort (asc/desc/none cycle).
- Checkbox in header is tri-state (mixed when partial).

### 4.3 Film detail drawer — `/films/[id]` (opens as overlay on `/films`)
**Purpose:** Read-only deep dive on a single film + entry points to edit/duplicate/archive.

A 460px-wide drawer slides in from the right over a 42% black scrim with light blur. The films list behind is dimmed but readable.

**Sections** (top → bottom inside the drawer):
- **Header bar**: `#001` mono id + "Active" success chip · prev/next arrows · eye · more · close X.
- **Hero**: 88×120 poster placeholder (persimmon-gradient + stripe overlay, mono "POSTER" label) + title (`20px / 700 / -.02em`) + sub-meta line "2006 · PG · 86 min · English" + tag row (category chip + special feature chips).
- **Synopsis** section (uppercase 11px h4 + body 13px pretty-wrapped).
- **Catalog details** — 2-column key/value grid: rental rate, replacement cost, rental duration, original language, last updated, updated-by (avatar + name).
- **Inventory** — table-grid with 1 header + 1 row per store: store avatar + name, units (mono), out (mono muted).
- **Cast** — pill row: each pill = small avatar + actor name on surface-2 with border.
- **Rental performance** card: "47" big number / "rentals · last 30d" sub / vertical divider / 120×36 sparkline / "+22%" success chip right-aligned.
- **Footer bar**: Duplicate ghost + Archive ghost · spacer · Close ghost + "Edit film" primary.

### 4.4 Film edit modal — `/films/[id]/edit` (or in-place modal)
**Purpose:** Full edit form for a single film.

640px-wide centered modal over a 55% black scrim with stronger blur.

**Sections:**
- **Header**: "Edit film" h3 + sub `#009 · Alabama Devil · last saved 2 min ago` + close X.
- **Body** scrollable, 18px-gap sections:
  - **Basics**: Title (required) input + Synopsis textarea (80px min) + 3-column row (Category select, Rating select with pill preview, Language select).
  - **Pricing & duration**: 4-column row (Release year, Length, Rental rate, Replacement) + 2-column row (Rental duration, Original language).
  - **Special features**: 2-column checkbox grid (Trailers, Commentaries, Deleted Scenes, Behind the Scenes).
  - **Cast**: multi-pill input — each cast member shown as removable pill (avatar + name + × button) + "Add actor" small button.
- **Footer**: "Auto-saved 2s ago" subtle muted-success indicator · spacer · Cancel ghost + "Save changes" primary.

### 4.5 Stores & Staff — `/stores`
**Purpose:** See both stores at a glance + manage staff.

**Layout:**
- Page header: "Stores & Staff" / "2 stores · 7 staff members · synced live across both locations" / Export staff ghost + Add staff member primary.
- **Two store cards** in 2-column grid. Each card (`pa-card st-card`):
  - 8px-tall colored ribbon along top-left (store accent: store #1 persimmon, store #2 teal).
  - Header row: 48px square avatar in accent-soft tone · store ID label + city/country h3 + address muted · "Open" success chip right.
  - **Stat strip**: 3-column bordered group (Inventory / Active rentals / Staff) with big numbers.
  - **Detail rows**: Hours (mono, with edit pencil), Time zone, Phone (mono), Last sync (success dot + relative time).
  - **Manager card**: dashed border on surface-2, 36px avatar + name + role/email + "View" ghost-arrow button.
- **Staff section card** below: tabs (Staff / Shifts / Permissions — segmented surface-2 pill control with white active thumb + shadow) · search · "Store: All" filter · "Role: All" filter.
- **Staff table**: Check, Member (avatar + name + meta `@username · email`), Store (colored chip), Role (chip — Manager = violet), Status (success/danger chip), Started (mono date), Rentals MTD (mono number), Last active (relative), kebab.

---

## 5. Design tokens

All tokens live in `designs/tokens.jsx` (the `TOKENS_CSS` constant). Port them verbatim to `src/app/globals.css`. They use OKLCH for a unified warm palette; both themes are exposed via a `.theme-dark` body class.

### 5.1 Palette (light)

| Token | OKLCH | Approx hex | Used for |
|---|---|---|---|
| `--bg` | `oklch(0.985 0.005 70)` | `#fafaf7` | page background |
| `--surface` | `#ffffff` | white | cards |
| `--surface-2` | `oklch(0.965 0.008 70)` | `#f5f3ee` | table header, hover row, sidebar items |
| `--surface-3` | `oklch(0.945 0.012 70)` | `#ece9e2` | poster placeholders, deeper surfaces |
| `--border` | `oklch(0.91 0.012 70)` | `#e3dfd6` | dividers, table lines |
| `--border-strong` | `oklch(0.84 0.015 70)` | `#cfc9bd` | hover borders |
| `--text` | `oklch(0.22 0.018 60)` | `#1f1a14` | body |
| `--text-muted` | `oklch(0.48 0.015 60)` | `#665e51` | labels |
| `--text-soft` | `oklch(0.62 0.012 60)` | `#928a7b` | placeholders, metadata |
| `--accent` | `oklch(0.66 0.16 38)` | `#d36540` | **primary persimmon** |
| `--accent-hover` | `oklch(0.6 0.17 38)` | `#c45631` | primary button hover |
| `--accent-soft` | `oklch(0.95 0.035 38)` | `#fae8dd` | selected row, accent chip bg |
| `--accent-soft-border` | `oklch(0.88 0.06 38)` | `#f0c7b0` | accent chip border |
| `--teal` | `oklch(0.62 0.085 200)` | `#4f9aa6` | **secondary teal** (store #2, info) |
| `--teal-soft` | `oklch(0.95 0.022 200)` | `#e3eff2` | teal chips |
| `--success` | `oklch(0.62 0.13 150)` | `#4ea16a` | active/healthy stock |
| `--success-soft` | `oklch(0.95 0.045 150)` | `#dcefdf` | success chips |
| `--warning` | `oklch(0.74 0.13 75)` | `#d2a040` | low stock, PG-13 |
| `--warning-soft` | `oklch(0.96 0.05 75)` | `#f7e9c8` | warning chips |
| `--danger` | `oklch(0.6 0.18 25)` | `#cf4836` | delete, critical stock |
| `--danger-soft` | `oklch(0.96 0.035 25)` | `#fae0d8` | danger chips |
| `--violet` | `oklch(0.6 0.12 290)` | `#7e7bbf` | actor avatars, animation/foreign |
| `--violet-soft` | `oklch(0.95 0.03 290)` | `#e9e6f4` | violet chips |

Dark mode shifts to `oklch(0.17 / 0.21 / 0.24 / 0.28 60)` for bg/surfaces and lightens accent to `oklch(0.74 0.16 40)`. See `tokens.jsx` for the complete `.theme-dark` block.

### 5.2 Type

- **UI sans**: Manrope (400/500/600/700/800) — Google Fonts
- **Mono**: IBM Plex Mono (400/500/600) — for IDs, prices, dates, numeric metrics

Sizes used:
- Page h1: `22px / 700 / -.018em`
- Card h3: `13-16px / 600-700`
- Body: `13px / 1.45`
- Table cells: `12.5px`
- Labels/uppercase: `11px / 600-700 / .04em-.08em letter-spacing / uppercase`
- KPI numbers: `26px / 700 / -.02em`
- Mono prices: `12.5px` with `font-feature-settings: "zero"` and `tabular-nums`

### 5.3 Geometry

- Radii: `--radius-sm: 6px` · `--radius-md: 8px` · `--radius-lg: 12px` · `--radius-xl: 16px`
- Pills: `999px`
- Shadows:
  - `--shadow-sm`: cards
  - `--shadow-md`: bulk-action bar, raised tabs
  - `--shadow-lg`: modal, drawer
- Row height: `--row-h` (32 compact / 40 regular / 48 comfy)
- Cell horizontal padding: `--cell-px` (10 / 12 / 16)
- Header bar: `--header-h: 56px`
- Sidebar: `--sidebar-w: 224px`

---

## 6. Component inventory

Every component lives in `designs/primitives.jsx` or `designs/shell.jsx`. Recreate each as a typed React component in `src/components/`:

| Component | Source | Props |
|---|---|---|
| `<Icon name size>` | `primitives.jsx` | Inline SVG icon set — port the path map or swap for `lucide-react` |
| `<Btn variant size iconOnly leftIcon rightIcon>` | `primitives.jsx` | variants: `default` / `primary` / `ghost` / `danger-ghost`; sizes: `sm` / default / `lg` |
| `<Input leftIcon kbd placeholder size>` | `primitives.jsx` | with optional kbd-hint chip on right |
| `<Chip tone dot>` | `primitives.jsx` | tones: default / `solid` / `teal` / `success` / `warning` / `danger` / `violet` |
| `<Rating value>` | `primitives.jsx` | G/PG/PG-13/R/NC-17 — each mapped to a colored pill |
| `<CategoryChip value>` | `primitives.jsx` | Maps each of the 16 Pagila categories to a tone |
| `<Avatar initials tone size>` | `primitives.jsx` | tones: default / `accent` / `teal` / `violet` / `success` |
| `<Check checked mixed onChange>` | `primitives.jsx` | Tri-state checkbox |
| `<Sparkline data color width height>` | `primitives.jsx` | SVG line+area chart with end-dot |
| `<MiniBars data color>` | `primitives.jsx` | SVG bar chart |
| `<StockBar count max>` | `films-list.jsx` | progress bar that recolors at ≤5 (warning) and ≤3 (danger) |
| `<Sidebar active store badges>` | `shell.jsx` | nav with store picker + grouped sections |
| `<Topbar crumb>` | `shell.jsx` | breadcrumb + search + bell + avatar |
| `<Shell active crumb children>` | `shell.jsx` | full layout |

---

## 7. Interactions & behavior

### Inline cell edit (films table)
- Double-click a Category chip or Rate value → cell turns into an `<input class="fl-edit-cell">` (autofocus, accent border, accent-soft 3px ring).
- On blur or Enter → commit via a server action; on Escape → revert.
- Optimistic update + toast on success.

### Bulk select
- Tri-state header checkbox: unchecked / mixed / all.
- When `selected.size > 0` → render the `fl-bulkbar` above the table (persimmon bg, white text + buttons).
- Bulk actions: Set category (opens a small picker), Move to store, Archive, Duplicate, Delete (danger).

### Drawer
- Click any non-checkbox/non-kebab cell on a row → push `/films/[id]` via Next router. Use a `parallel route` + `intercepted route` so the films list stays mounted underneath. Fallback to a normal page if accessed directly.
- Esc closes; prev/next arrows in header step through the current filtered list order.

### Modal
- "Edit film" button in drawer → open modal in place. Or `/films/[id]/edit` as an intercepted route.
- Auto-save indicator: debounce text inputs 600ms; on save, show "Auto-saved 2s ago" (count up).

### Sort & filter
- Sort: cycle asc → desc → none on header click. State in URL search params (`?sort=title&dir=asc`) so it survives reload.
- Filters: each filter pill opens a popover with multi-select; selected count shows as a small chip overlay on the pill. State in URL.

### Theme & density
- Light/dark toggle in user menu (top-right avatar dropdown). Persists in `localStorage` + cookie so SSR can hydrate correctly without flash.
- Density toggle in settings or user menu. Same persistence pattern.

### Sidebar store picker
- Click → small dropdown listing both stores + "Manage stores…" → `/stores`. Selected store filters dashboard, films inventory column, etc.

---

## 8. State & data flow

- **Server Components** load all initial data (films list, dashboard KPIs, store stats). Pass plain objects as props to client islands.
- **Client Components** for:
  - Selection set in films table
  - Sort/filter UI (URL-state, `useRouter` to push searchParams)
  - Drawer open state (route-driven)
  - Modal form (`useFormState`/`useActionState` for server action results)
  - Theme + density toggles (`useLocalStorage` + cookie sync)
  - Tweaks panel removal — see §10
- **Server Actions** for mutations (update film, bulk update, add staff). Always `revalidatePath('/films')` etc. after.

See `DATA_MODEL.md` for the SQL.

---

## 9. Accessibility checklist

- All buttons reach 32×32 hit targets (size=sm rounds to 26 but still has 26 hit + 4 padding around).
- Color contrast: text on accent-soft passes AA at 13px+; text-muted on surface passes AA.
- Focus visible: 3px accent-soft ring on inputs is already there; add equivalent on buttons (currently relies on hover only — add a `:focus-visible` ruleset before shipping).
- Checkboxes: add `aria-checked` (the prototype's `<Check>` already does); make them keyboard-toggleable.
- Drawer: trap focus, return focus to invoking row on close.
- Tables: `<th scope="col">`, `aria-sort` on sortable headers.

## 10. What NOT to port

- `designs/design-canvas.jsx` — that's the multi-artboard preview wrapper for the design tool. The real site is single-flow.
- `designs/tweaks-panel.jsx` and the `TWEAK_DEFAULTS` block in `app.jsx` — that's a design-time control surface. In production, ship just the theme toggle (light/dark) and the density toggle as part of the user menu. Drop the "table style" tweak entirely; pick **`lined`** for production (it's the default in the design).
- The mocked `FILMS`, `ACTORS`, `STORES`, `STAFF` arrays in `tokens.jsx` — pull from Postgres instead. Real Pagila has 1,000 films, 200 actors, 599 customers, 2 stores. Some mock film records use 4-store inventory tuples but real data only has 2 stores; keep it to 2.
- `window.PA.sparkFor(id)` — replace with a real 30-day rental count query (see `DATA_MODEL.md` §6).

---

## 11. Where to start

Open `IMPLEMENTATION_PLAN.md` next — it's a stepwise plan with concrete file paths and the order you should land things in.

Then `DATA_MODEL.md` for the SQL.
