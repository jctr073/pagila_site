# Implementation Plan — Pagila Catalog Admin

This is the order of work, with concrete file paths in the existing scaffold. Each phase ends in a runnable state.

> **Read first**: `node_modules/next/dist/docs/` for Next 16 conventions (params, route handlers, server actions, layouts). Do not assume Next 13/14/15 behavior carries over — the `AGENTS.md` warning is real.

---

## Phase 0 — Confirm the database is reachable

Already wired in the repo:

```bash
npm run db:up            # boots the postgres container
npm run db:psql          # \dt should list pagila tables
```

Verify the existing `/api/health` route still works, then move on. If the database is empty, load Pagila:

```bash
docker compose exec -T postgres psql -U postgres -d pagila < pagila-schema.sql
docker compose exec -T postgres psql -U postgres -d pagila < pagila-data.sql
```

Pagila schema/data files are available from the upstream Pagila repo; drop them into the repo root (don't commit).

---

## Phase 1 — Design tokens & global styles

**Files to write:**

- `src/app/globals.css` — replace the placeholder block. Paste the contents of `designs/tokens.jsx`'s `TOKENS_CSS` constant. Keep Tailwind's `@import "tailwindcss"` at the top.
- Add to the `<head>` in `src/app/layout.tsx`:
  ```tsx
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
  />
  ```
  (Or better: use `next/font` to self-host. `next/font/google` for both Manrope and IBM Plex Mono. Reference them in `globals.css` via CSS variables — Next 16's `next/font` API may differ; check the local docs.)

- Add to `tailwind.config` (or the `@theme` block in `globals.css` for Tailwind v4): aliases that map `bg-surface`, `text-muted`, `border-strong`, etc. to the CSS variables. Example for Tailwind v4 `@theme`:
  ```css
  @theme inline {
    --color-bg: var(--bg);
    --color-surface: var(--surface);
    --color-surface-2: var(--surface-2);
    --color-text: var(--text);
    --color-text-muted: var(--text-muted);
    --color-text-soft: var(--text-soft);
    --color-border: var(--border);
    --color-accent: var(--accent);
    --color-accent-soft: var(--accent-soft);
    --color-teal: var(--teal);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-danger: var(--danger);
    --color-violet: var(--violet);
    --font-sans: var(--font-sans);
    --font-mono: var(--font-mono);
    --radius-md: 8px;
    --radius-lg: 12px;
  }
  ```

- Apply `class="pa-root density-compact"` to `<body>` in `layout.tsx`. Wire dark mode via a server-read cookie or `next-themes` (cookie-based, no flash).

**Done when:** Opening any route shows the warm-off-white background, Manrope text rendered, default body color matches `--text`.

---

## Phase 2 — Components library

Recreate in `src/components/ui/`:

```
src/components/ui/
├── Icon.tsx             (port the path map from primitives.jsx — or `import * as Lucide from 'lucide-react'`)
├── Btn.tsx              (Button — use a discriminated union for variants)
├── Input.tsx
├── Chip.tsx
├── Rating.tsx
├── CategoryChip.tsx
├── Avatar.tsx
├── Check.tsx
├── Sparkline.tsx
├── MiniBars.tsx
└── index.ts             (barrel)
```

All of these are **client components** because they need event handlers and state. Add `'use client'` at the top of each, except `Avatar`, `Chip`, `Rating`, `CategoryChip`, `Sparkline`, `MiniBars`, and `Icon` which are pure-presentation and can stay server-renderable.

**Type props** — example for `Btn`:

```ts
type BtnProps = {
  variant?: 'default' | 'primary' | 'ghost' | 'danger-ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

Translate `pa-btn`, `pa-input`, etc. classes from `primitives.jsx` directly. They're already self-contained.

**Done when:** A `/sandbox` route renders one of every component and they match the prototype.

---

## Phase 3 — App shell

Files:

- `src/components/Shell/Sidebar.tsx` — port from `designs/shell.jsx` `Sidebar`. Active state comes from `usePathname()`.
- `src/components/Shell/Topbar.tsx` — port from `Topbar`. The search input is client-side; the bell and avatar dropdown are client-side islands.
- `src/components/Shell/UserMenu.tsx` (new) — wraps the avatar; opens a popover with theme toggle, density toggle, profile link, sign-out.
- `src/app/(admin)/layout.tsx` — wraps `Sidebar` + main column with `Topbar` + `<main>{children}</main>`. Use the `(admin)` route group so the existing landing page can stay at `/` or be replaced.

Move the existing landing `src/app/page.tsx` to `src/app/(marketing)/page.tsx`, or just delete it and make `/` the admin dashboard.

**Done when:** Any admin route renders the shell with active nav state correctly.

---

## Phase 4 — Database access layer

`src/lib/db.ts` already exists. Add:

- `src/lib/queries/films.ts` — `listFilms({ sort, dir, page, filters })`, `getFilm(id)`, `updateFilm(id, patch)`, `bulkUpdateFilms(ids, patch)`, etc.
- `src/lib/queries/dashboard.ts` — `getKpis()`, `getRentalsByDay(days)`, `getTopFilms(month)`, `getRecentActivity()`.
- `src/lib/queries/stores.ts` — `listStores()`, `getStoreDetail(id)`, `listStaff({ store, role })`.

All queries use parameterized `pool.query($1, $2, …)`. See `DATA_MODEL.md` for the SQL.

Typed return shapes — define them in `src/lib/types.ts`:

```ts
export type FilmRow = {
  id: number;
  title: string;
  year: number;
  category: string;
  rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  length: number;
  rate: number;        // numeric → number
  replace: number;
  inventory: number;   // computed
  storesInventory: [number, number];
  updated: string;     // ISO date
  actors: number;
  lang: string;
  features: string[];  // from film.special_features text[]
  desc: string;
};
```

---

## Phase 5 — Dashboard

- `src/app/(admin)/page.tsx` — server component. Calls the four KPI queries in parallel via `Promise.all`. Renders `<DashboardClient initial={...} />`.
- `src/components/dashboard/KpiTile.tsx` — pure presentational, takes `{ label, icon, value, unit, delta, deltaDir, spark, sparkColor }`.
- `src/components/dashboard/RentalsChart.tsx` — pure presentational bar chart (port `db-bars` block). Pass in the 14-day data + the day-of-week boundaries for axis labels.
- `src/components/dashboard/TopFilmsList.tsx`
- `src/components/dashboard/ActivityFeed.tsx` — server-fetched initial 10 events. Real-time would need polling (`useSWR` w/ 30s refresh) or websockets — out of scope for MVP.

**Done when:** `/` renders real Pagila numbers (≈1,000 films, real active rentals from `rental` table where `return_date IS NULL`, real revenue from `payment`).

---

## Phase 6 — Films list

- `src/app/(admin)/films/page.tsx` — server component. Reads searchParams (sort, dir, page, filters), calls `listFilms`, passes rows + total + facets to client.
- `src/components/films/FilmsTable.tsx` — `'use client'`. Holds selection state, manages inline-edit input, dispatches sort changes by `router.push(new URL with searchParams)`.
- `src/components/films/FilmsToolbar.tsx` — `'use client'`. Search input (debounced 300ms → push to URL), filter pills with popovers, sort button.
- `src/components/films/FilmsBulkBar.tsx` — appears when `selected.size > 0`. Bulk actions trigger server actions.
- `src/components/films/StockBar.tsx`.

**Server actions** (in `src/lib/actions/films.ts`):
```ts
'use server';
export async function updateFilmCell(id: number, field: 'rate'|'category'|..., value: unknown) { ... }
export async function bulkArchiveFilms(ids: number[]) { ... }
export async function bulkSetCategory(ids: number[], categoryId: number) { ... }
```
Each action ends with `revalidatePath('/films')`.

**Inline edit pattern:**
- Cell renders a `<button>` (looks like a chip / mono value).
- On double-click → swap to controlled `<input>` with `useActionState` hooked to the server action.
- On Enter / blur → fire action; on Escape → cancel.

**Done when:** `/films?sort=title&dir=asc` works, sort cycles correctly, selecting rows shows the bulk bar, double-clicking a rate cell saves the new value on blur.

---

## Phase 7 — Film detail drawer (parallel route)

Use Next.js intercepting routes so the drawer overlays the films list when navigating from there, and is a full page when accessed directly.

File structure:

```
src/app/(admin)/films/
├── page.tsx                    (list)
├── @drawer/
│   ├── default.tsx             (returns null)
│   └── (.)[id]/
│       └── page.tsx            (the intercepted drawer)
└── [id]/
    └── page.tsx                (the standalone fallback)
```

`src/app/(admin)/films/layout.tsx` must accept `{ children, drawer }` and render both.

**Drawer component** (`src/components/films/FilmDrawer.tsx`):
- Server component if you can fetch the film synchronously. The drawer body is mostly static; the action buttons in the footer can be a client island.
- 460px fixed width, slides in via CSS keyframe (`transform: translateX(0)` from `translateX(100%)`).
- Scrim is a sibling `<div>` with `onClick` → `router.back()`.

**Esc key**: a small client wrapper component listens for Escape and calls `router.back()`.

**Done when:** Click row → drawer slides in over the list. Reload the URL → drawer renders as a standalone page with the shell. Esc / scrim click closes it.

---

## Phase 8 — Film edit modal (parallel route)

Same intercepting-route pattern, nested:

```
src/app/(admin)/films/[id]/edit/page.tsx
src/app/(admin)/films/@drawer/(.)[id]/edit/page.tsx   ← intercepted
```

`FilmEditForm.tsx` is a client component using `useActionState(updateFilm, …)`. Auto-save: debounce form values 600ms and submit; show a "Saved Xs ago" tick with a `useEffect` interval.

Validation: server-side with `zod` (add `zod` to deps if you want it). Display errors inline.

**Done when:** Editing a film and tabbing through fields saves automatically; explicit "Save changes" button saves immediately and closes the modal.

---

## Phase 9 — Stores & Staff

- `src/app/(admin)/stores/page.tsx` — server component. `listStores()` + `listStaff()` in parallel.
- `src/components/stores/StoreCard.tsx` — port from `stores-staff.jsx` `StoreCard`.
- `src/components/stores/StaffTable.tsx` — `'use client'`. Same selection/sort patterns as the films table.
- `src/components/stores/StaffTabs.tsx` — segmented control. Tab state in URL.
- Add-staff: opens a smaller modal at `/stores/staff/new` (intercepted from `/stores`).

**Done when:** Both real Pagila stores show with their actual cities/addresses; staff table lists all 2 real staff + any you've added.

---

## Phase 10 — Theme & density toggles

- `src/components/ThemeToggle.tsx` (`'use client'`) — reads/writes a cookie + `<html>` class.
- Cookie name: `pa-theme` (light | dark | system). Read it in `layout.tsx` via `cookies()` and apply the class server-side to prevent flash.
- Density similar: `pa-density` cookie.

**Done when:** Toggle works without flashing on reload.

---

## Phase 11 — Polish

- 404 / loading / error states. Use `loading.tsx` in each route with a skeleton table.
- Toast notifications on save / delete. Pick `sonner` (smallest, headless) and wire it up at the layout level.
- Keyboard shortcuts: ⌘K opens search palette (out-of-scope MVP — leave as a placeholder button).
- Pagination: real-cursor pagination is cleaner than offset for 1,000 films, but offset is fine here.
- Audit: `npm run lint`, `npm run build`, fix any TS errors.

---

## Out of scope for this implementation pass

- Real-time activity feed (use 30s polling).
- ⌘K command palette.
- Customer/Rental/Payment modules.
- Bulk CSV import.
- Multi-tenant / RBAC (every signed-in user is a catalog admin for both stores).
- Image upload for film posters (placeholders only).

---

## Suggested commit order

1. `chore: load tokens + fonts; refresh globals.css`
2. `feat(ui): primitive components (Btn, Input, Chip, Rating, Avatar, Check, Sparkline)`
3. `feat: admin shell with sidebar + topbar`
4. `feat(db): film queries + types`
5. `feat: dashboard route with real KPIs`
6. `feat: films list with sort + filter + URL state`
7. `feat: bulk select + inline cell edit + server actions`
8. `feat: film detail drawer (intercepted route)`
9. `feat: film edit modal + auto-save`
10. `feat: stores & staff page`
11. `feat: theme + density toggles with no-flash SSR`
12. `polish: loading skeletons, toasts, error states`
