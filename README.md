# Pagila Site

Next.js 16, TypeScript, and Postgres admin UI for the Pagila sample database.
The app is organized as a compact operations dashboard with films, stores,
staff, and database health views.

## Requirements

- Node.js 24 LTS
- npm 11
- Docker

This repo includes `.node-version` and was scaffolded with Node.js 24.15.0 and
npm 11.14.1.

## Environment

Create or update `.env` with the local database connection string:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pagila
```

The working `.env` is ignored by git. `.env.example` is committed as the
template.

## Development

Start Postgres:

```bash
npm run db:up
```

Start Next.js:

```bash
npm run dev
```

Open http://localhost:3000 and check the database route at
http://localhost:3000/api/health.

VS Code's `Next.js: debug website` launch configuration pins
`DATABASE_URL` to the development database on `localhost:5432`.

## Project Structure

```text
src/
  app/
    layout.tsx                 Root layout, fonts, theme and density classes
    globals.css                Global CSS entry point
    _*.css                     Private app-level CSS files by surface
    (admin)/                   Route group for the main admin shell
      layout.tsx               Sidebar, topbar, main content, toaster
      page.tsx                 Dashboard route at /
      films/
        layout.tsx             Films page plus @drawer parallel slot
        page.tsx               Films list route at /films
        [id]/page.tsx          Standalone film detail route
        [id]/edit/page.tsx     Standalone film edit route
        [id]/add-inventory/    Standalone add-stock route
        @drawer/default.tsx    Empty drawer slot for /films
        @drawer/(.)[id]/       Intercepted drawer route
        @drawer/(.)[id]/edit/  Intercepted edit modal route
        @drawer/(.)[id]/add-inventory/  Intercepted add-stock modal route
      stores/
        layout.tsx             Stores list plus @drawer parallel slot
        page.tsx               Stores list route at /stores
        [id]/page.tsx          Standalone store detail route
        [id]/edit/page.tsx     Standalone store edit route
        @drawer/default.tsx    Empty drawer slot for /stores
        @drawer/(.)[id]/       Intercepted store drawer route
        @drawer/(.)[id]/edit/  Intercepted store edit modal route
      categories/page.tsx      Categories list route at /categories
    api/health/route.ts        Database health JSON endpoint
    sandbox/page.tsx           Local sandbox route
  components/
    Shell/                     App chrome components
    dashboard/                 Dashboard display components
    films/                     Films table, toolbar, footer, inline edits
    films/detail/              Drawer, edit modal, edit form, shells
    stores/                    Stores table, toolbar, footer, bulk bar
    stores/detail/             Drawer, drawer shell, standalone wrapper,
                               edit modal shell, edit form
    ui/                        Shared primitives and tiny visualizations
  lib/
    db.ts                      Postgres pool and typed query helper
    preferences.ts             Cookie-backed theme and density helpers
    actions/                   Server actions
    queries/                   SQL query and mutation layer
    types.ts                   Shared DTO types
```

Top-level configuration lives in `next.config.ts`, `eslint.config.mjs`,
`postcss.config.mjs`, `tsconfig.json`, `package.json`, and
`docker-compose.yml`.

## Route Layout

The app uses the Next.js App Router under `src/app`.

- `RootLayout` in `src/app/layout.tsx` renders the HTML shell, Manrope and IBM
  Plex Mono font variables, metadata, preference classes, and a small no-flash
  theme script.
- `AdminLayout` in `src/app/(admin)/layout.tsx` wraps the dashboard routes with
  `Sidebar`, `Topbar`, `.pa-shell`, `.pa-main`, `.pa-content`, and `Toaster`.
- The `(admin)` folder is a route group, so it does not appear in URLs.
- `DashboardPage` in `src/app/(admin)/page.tsx` is the `/` route.
- `FilmsLayout` in `src/app/(admin)/films/layout.tsx` composes the normal
  `children` slot with the named `@drawer` parallel route slot.
- `StoresRoute` in `src/app/(admin)/stores/page.tsx` is the `/stores` route.
- `CategoriesRoute` in `src/app/(admin)/categories/page.tsx` validates
  `sort` and `dir` from `searchParams`, fetches `listCategoriesForTable`,
  and renders `CategoriesPage`, which owns the new-category and delete
  confirmation modals.
- `GET` in `src/app/api/health/route.ts` returns a database health payload.

Next.js 16 route props such as `params` and `searchParams` are promises in this
codebase. Local framework docs live in `node_modules/next/dist/docs/`; check
them before changing routing conventions.

## Films Routing

Films are the most route-rich section.

- `FilmsRoute` parses and validates `q`, `category`, `rating`, `sort`, `dir`,
  `page`, `pageSize`, and `length` from `searchParams`.
- `FilmsRoute` fetches `listFilms`, `listCategories`, inventory count, and
  `getFilmDemandSparklines`, then renders `FilmsHeader` and `FilmsPage`.
- `FilmsPage` is a client wrapper. It owns the selected film `Set<number>` and
  composes `FilmsToolbar`, `FilmsBulkBar`, `FilmsTable`, and `FilmsFooter`.
- `/films/[id]` hard loads render `StandaloneFilmPage`, which wraps
  `FilmDrawer` in `StandaloneDrawerPage`.
- Client navigation from `/films` to `/films/[id]` uses the intercepted route
  `src/app/(admin)/films/@drawer/(.)[id]/page.tsx`, which renders
  `FilmDrawerShell` plus `FilmDrawer`.
- The drawer route calls `getFilmInventoryByStore(filmId, true)` so stores with
  zero units are hidden. The standalone detail route uses the default
  `getFilmInventoryByStore(filmId)` behavior and shows all stores.
- `/films/[id]/edit` hard loads render `StandaloneEditPage`.
- Client navigation to `/films/[id]/edit` uses
  `@drawer/(.)[id]/edit/page.tsx` and renders `FilmEditModalShell` plus
  `FilmEditForm`.
- `/films/[id]/add-inventory` hard loads render `StandaloneAddInventoryPage`.
- Client navigation to `/films/[id]/add-inventory` uses
  `@drawer/(.)[id]/add-inventory/page.tsx` and renders `FilmEditModalShell`
  plus `FilmAddInventoryForm`. The form inserts one `inventory` row per
  unit per selected store in a single transaction.
- `/stores/[id]/edit` hard loads render `StandaloneStoreDrawerPage`
  wrapping `StoreEditForm` (standalone mode). Client navigation uses
  `@drawer/(.)[id]/edit/page.tsx` and renders `StoreEditModalShell` plus
  `StoreEditForm`. Both routes share the same `getStoreDetail` plus
  `listCities` data fetch.

## Code Organization

Routes in `src/app` are mostly Server Components. They parse URL state, validate
inputs, fetch data in parallel, and pass serializable props down to components.
Interactive state lives in small client components close to the relevant UI.

The query layer in `src/lib/queries` owns SQL and maps database-shaped rows into
app DTOs from `src/lib/types.ts`.

- `dashboard.ts`: `getKpis`, `getRentalsByDay`,
  `getPerStoreRentalAverages`, `getAvgRentalDuration`, `getOverdueRentals`,
  `getTopFilms`, `getRecentActivity`.
- `films.ts`: `listFilms`, `getFilm`, `getFilmInventoryByStore`,
  `getFilmCast`, `getFilm30dPerformance`, `getFilmDemandSparklines`,
  `updateFilmRate`, `updateFilmCategory`, `updateFilm`, `bulkSetCategory`,
  `bulkArchiveFilms`.
- `inventory.ts`: `listStoresLite`, `addFilmInventory`.
- `stores.ts`: `listStores`, `listStoresForTable`, `listStaff`,
  `getStoreDetail`, `listCustomersByStore`, `getStoreRentalSparkline`,
  `updateStore` (atomic `store` + joined `address` patch in one
  transaction).
- `categories.ts`: `listCategoriesForTable`, `createCategory`,
  `renameCategory`, `deleteCategoryCascade`.
- `lookups.ts`: `listCategories`, `listLanguages`, `listCities`.

The server action layer in `src/lib/actions` validates action input, calls the
query layer, and revalidates affected paths.

- `films.ts`: `updateRate`, `updateCategory`, `bulkSetCategory`,
  `bulkArchive`, `updateFilm`, `updateRateFormAction`,
  `updateCategoryFormAction`.
- `inventory.ts`: `addFilmInventory`.
- `stores.ts`: `updateStore` (revalidates `/stores`, `/stores/[id]`, and
  `/stores/[id]/edit`).
- `categories.ts`: `createCategory`, `renameCategory`, `deleteCategory`
  (revalidates both `/categories` and `/films`).
- `preferences.ts`: `setTheme`, `setDensity`.

Database access is centralized in `src/lib/db.ts`:

- `getPool()` creates or reuses the global `pg.Pool`.
- `query<T>()` runs typed Postgres queries.
- Numeric OID 1700 is parsed into JavaScript numbers for Pagila money/rate
  columns.

## Important Types and Constants

Shared DTOs live in `src/lib/types.ts`.

- Film DTOs: `FilmRow`, `FilmDetail`, `FilmInventoryByStore`,
  `FilmCastMember`, `Rating`, `SpecialFeature`.
- Dashboard DTOs: `DashboardKpi`, `RentalsByDay`, `TopFilm`,
  `RecentActivity`.
- Store/staff DTOs: `StoreRow`, `StoreDetail`, `StoreEditPatch`,
  `StaffRow`.
- Category DTO: `CategoryListRow`.

Frequently touched constants and helpers:

- `SORT_COLUMNS`, `VALID_SORT`, and `VALID_DIR` in `src/lib/queries/films.ts`
  protect dynamic SQL ordering.
- `VALID_SORTS` and `VALID_RATINGS` in `src/app/(admin)/films/page.tsx`
  validate URL params before they reach the query layer.
- `STORE_LABELS` and the `storeLabel(id)` helper in `src/lib/storeLabels.ts`
  map Pagila store IDs to display names and tones; `FilmDrawer` and
  `FilmAddInventoryForm` both consume it.
- `FEATURE_OPTIONS` and `RATING_OPTIONS` in `FilmEditForm.tsx` drive edit form
  controls.
- `THEME_COOKIE`, `DENSITY_COOKIE`, `DEFAULT_THEME`, and `DEFAULT_DENSITY` in
  `src/lib/preferences.ts` define preference storage.

## Components

Shared UI primitives live in `src/components/ui` and are re-exported from
`src/components/ui/index.ts`.

- `Btn`, `Icon`, `Input`, `Check`.
- `Chip`, `CategoryChip`, `Rating`, `Avatar`.
- `Sparkline`, `MiniBars`, `StockBar`.
- `cn` for class name composition.

Shell components live in `src/components/Shell`: `Sidebar`, `Topbar`, and
`UserMenu`.

Dashboard components are re-exported from `src/components/dashboard/index.ts`:
`PageHeader`, `KpiTile`, `KpiRow`, `RentalsChart`, `TopFilmsList`, and
`ActivityFeed`.

Stores components are re-exported from `src/components/stores/index.ts`:
`StoresHeader`, `StoresPage`, `StoresToolbar`, `StoresBulkBar`,
`StoresTable`, `StoresFooter`, `StoreDrawer`, `StoreDrawerShell`,
`StandaloneStoreDrawerPage`, `StoreEditForm`, and `StoreEditModalShell`.

## Styling

`src/app/globals.css` imports Tailwind plus private CSS files:

- `_design.css`: shared design primitives and utility classes.
- `_shell.css`: sidebar, topbar, and page shell.
- `_dashboard.css`: dashboard-specific layout.
- `_stores.css`: stores and staff UI.
- `_films.css`: films list UI.
- `_film-detail.css`: drawer and edit modal UI.

Theme and density are cookie-backed. `getPreferences()` reads them on the
server, `RootLayout` applies classes, and `UserMenu` changes them through
server actions.

## Database Commands

```bash
npm run db:up
npm run db:logs
npm run db:psql
npm run db:down
```

Schema changes are managed with [node-pg-migrate]; see `db/README.md` for the
full workflow.

```bash
npm run db:migrate                            # apply pending migrations to dev DB
npm run db:migrate:create -- add_column_x     # scaffold a new migration
npm run db:migrate:down                       # roll back the most recent migration
```

[node-pg-migrate]: https://salsita.github.io/node-pg-migrate/

## Testing

Unit tests run with Vitest and do not connect to Postgres:

```bash
npm run test:unit
npm run test:unit:coverage
npm run test:unit:watch
```

Integration tests run against a separate Postgres container on port `5433`.
The test database is named `pagila_test` and its schema is built by running
the migrations in `db/migrations/` against an empty container, so development
data from `localhost:5432/pagila` is not copied or queried by tests. The
default test connection string is
`postgresql://postgres:postgres@127.0.0.1:5433/pagila_test`.

```bash
npm run db:test:up
npm run test:integration
npm run test:integration:coverage
npm run db:test:down
```

Coverage reports are written to `coverage/unit` and `coverage/integration`.
Run `npm run test:coverage` after starting the test database to generate both.
CI uploads both reports to Codecov, which posts a combined coverage comment on
pull requests.

`TEST_DATABASE_URL` can override the integration test host or credentials, but
it must still connect to the `pagila_test` database; the setup refuses to run
otherwise.

## Verification

```bash
npm run lint
npm run test:unit
npm run db:test:up
npm run test:integration
npm run build
npm audit
```
