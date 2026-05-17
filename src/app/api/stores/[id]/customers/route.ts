import { NextResponse, type NextRequest } from "next/server";

import { listCustomersByStore } from "@/lib/queries/stores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    return NextResponse.json({ error: "invalid store id" }, { status: 400 });
  }

  const url = request.nextUrl;
  const limit = clampInt(url.searchParams.get("limit"), 1, MAX_LIMIT, 12);
  const offset = clampInt(url.searchParams.get("offset"), 0, Number.MAX_SAFE_INTEGER, 0);

  const customers = await listCustomersByStore(storeId, limit, offset);
  return NextResponse.json({ customers });
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw == null) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
