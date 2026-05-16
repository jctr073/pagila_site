# Database Test Schema

`schema.sql` is a schema-only dump of the Pagila database. It intentionally
does not contain table data.

The `postgres-test` Docker Compose service loads this file into `pagila_test`
on port `5433`, so integration tests do not connect to the development
database on port `5432`.

To refresh the schema after a database migration:

```bash
docker run --rm postgres:18-alpine pg_dump --schema-only --no-owner --no-privileges postgresql://postgres:postgres@host.docker.internal:5432/pagila > db/schema.sql
```
