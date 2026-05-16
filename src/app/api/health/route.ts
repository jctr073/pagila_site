import { NextResponse } from "next/server";

import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DatabaseHealthRow = {
  database_name: string;
  database_user: string;
  server_time: string;
};

export async function GET() {
  try {
    const { rows } = await query<DatabaseHealthRow>(`
      select
        current_database() as database_name,
        current_user as database_user,
        now()::text as server_time
    `);

    return NextResponse.json({
      ok: true,
      database: rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown database connection error",
      },
      { status: 500 },
    );
  }
}
