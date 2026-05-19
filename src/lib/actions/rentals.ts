"use server";

/**
 * Server actions for /rentals. The list page is read-only; mutations
 * live in the drawer (return / reopen / delete) and the new-rental
 * modal. Each action revalidates `/rentals`, the detail route, and the
 * dashboard so KPI rollups stay fresh.
 */

import { revalidatePath } from "next/cache";

import {
  createRental as q_createRental,
  deleteRental as q_deleteRental,
  reopenRental as q_reopenRental,
  returnRental as q_returnRental,
  type CreateRentalInput,
} from "@/lib/queries/rentals";

export type RentalActionResult =
  | { ok: true; id: number }
  | { ok: false; error: string };

function revalidateRentals(id?: number): void {
  revalidatePath("/rentals");
  revalidatePath("/");
  if (typeof id === "number") {
    revalidatePath(`/rentals/${id}`);
  }
}

function parseId(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function createRentalAction(
  input: CreateRentalInput,
): Promise<RentalActionResult> {
  const inventoryId = parseId(input.inventoryId);
  const customerId = parseId(input.customerId);
  const staffId = parseId(input.staffId);
  if (!inventoryId || !customerId || !staffId) {
    return { ok: false, error: "invalid rental input" };
  }

  try {
    const id = await q_createRental({
      inventoryId,
      customerId,
      staffId,
      rentalDate: input.rentalDate,
    });
    revalidateRentals(id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function returnRentalAction(
  rentalId: number,
): Promise<RentalActionResult> {
  const id = parseId(rentalId);
  if (!id) return { ok: false, error: "invalid id" };
  try {
    await q_returnRental(id);
    revalidateRentals(id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function reopenRentalAction(
  rentalId: number,
): Promise<RentalActionResult> {
  const id = parseId(rentalId);
  if (!id) return { ok: false, error: "invalid id" };
  try {
    await q_reopenRental(id);
    revalidateRentals(id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteRentalAction(
  rentalId: number,
): Promise<RentalActionResult> {
  const id = parseId(rentalId);
  if (!id) return { ok: false, error: "invalid id" };
  try {
    await q_deleteRental(id);
    revalidateRentals();
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
