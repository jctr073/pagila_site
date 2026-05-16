import { Pool, types, type QueryResult, type QueryResultRow } from "pg";

// Postgres OID 1700 = numeric. By default `pg` returns numeric columns as JS
// strings to preserve precision; the Pagila numeric columns (rental_rate,
// replacement_cost, payment.amount) fit comfortably in a JS number, so parse
// them up-front. ESM/CJS module-once semantics ensure this runs only once.
types.setTypeParser(1700, (value: string) => parseFloat(value));

declare global {
  var pagilaPgPool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return databaseUrl;
}

export function getPool() {
  if (!globalThis.pagilaPgPool) {
    globalThis.pagilaPgPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalThis.pagilaPgPool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (!globalThis.pagilaPgPool) return;

  await globalThis.pagilaPgPool.end();
  globalThis.pagilaPgPool = undefined;
}
