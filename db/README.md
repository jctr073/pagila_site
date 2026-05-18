# Database

Schema changes are managed with [node-pg-migrate]. Migration files live in
`db/migrations/` and are applied in filename (timestamp) order. The
`pgmigrations` table in each database records which migrations have run.

[node-pg-migrate]: https://salsita.github.io/node-pg-migrate/

## Migration files

- One `.sql` file per change, with `-- Up Migration` and `-- Down Migration`
  sections.
- `1779067029732_baseline.sql` is a `pg_dump --schema-only` snapshot of the
  Pagila database at the time the repo adopted migrations. The Down section is
  intentionally empty.
- Write `pg`-driver-friendly SQL only: no `psql` meta-commands such as
  `\restrict`, `\connect`, or `\copy`.

## Workflow

Create a new migration:

```bash
npm run db:migrate:create -- add_director_to_film
```

Apply pending migrations to the local dev database (port `5432`):

```bash
npm run db:migrate
```

Roll back the most recent migration on the dev database:

```bash
npm run db:migrate:down
```

The test database on port `5433` is recreated from scratch every time the
container starts. `npm run db:test:up` boots the container, waits for it to be
healthy, and then runs `npm run db:test:migrate` so the schema is built purely
from `db/migrations/`.

## Bootstrapping a new dev database

If you ever drop and recreate the dev database, run `npm run db:migrate` to
build the schema, then load Pagila sample data separately (`pg_restore` from a
data-only dump, or any other seed mechanism). Migrations carry schema only —
not row data.
