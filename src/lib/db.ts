import { Pool, type QueryResult, type QueryResultRow } from "pg";

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
