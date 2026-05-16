import { afterAll, beforeAll } from "vitest";

import { closePool, query } from "@/lib/db";

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5433/pagila_test";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;

function assertTestDatabaseUrl(databaseUrl: string) {
  const parsed = new URL(databaseUrl);

  if (parsed.pathname !== "/pagila_test") {
    throw new Error(
      `Refusing to run integration tests against ${parsed.pathname}; expected /pagila_test`,
    );
  }
}

async function waitForTestDatabase() {
  let lastError: unknown;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const { rows } = await query<{ database_name: string }>(
        "SELECT current_database() AS database_name",
      );
      const databaseName = rows[0]?.database_name;

      if (databaseName !== "pagila_test") {
        throw new Error(
          `Expected pagila_test database, connected to ${databaseName}`,
        );
      }

      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(
    `Could not connect to the test database at ${process.env.DATABASE_URL}. ` +
      `Run npm run db:test:up first. Last error: ${formatError(lastError)}`,
  );
}

function formatError(error: unknown): string {
  if (error instanceof AggregateError) {
    return error.errors.map(formatError).join("; ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

assertTestDatabaseUrl(process.env.DATABASE_URL);

beforeAll(async () => {
  await waitForTestDatabase();
});

afterAll(async () => {
  await closePool();
});
