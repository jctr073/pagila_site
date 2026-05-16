# Pagila Site

Next.js, TypeScript, and Postgres starter using a local Docker database.

## Requirements

- Node.js 24 LTS
- npm 11
- Docker

This repo includes `.node-version` and was scaffolded with Node.js 24.15.0 and npm 11.14.1.

## Environment

Create or update `.env` with the local database connection string:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pagila
```

The working `.env` is intentionally ignored by git. `.env.example` is committed as the template.

## Development

Start Postgres:

```bash
npm run db:up
```

Start Next.js:

```bash
npm run dev
```

Open http://localhost:3000 and check the database route at http://localhost:3000/api/health.

## Database Commands

```bash
npm run db:up
npm run db:logs
npm run db:psql
npm run db:down
```

## Verification

```bash
npm run lint
npm run build
npm audit
```
