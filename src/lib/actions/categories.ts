"use server";

import { revalidatePath } from "next/cache";

import {
  createCategory as q_create,
  deleteCategoryCascade as q_delete,
  renameCategory as q_rename,
} from "@/lib/queries/categories";

function revalidateAffected() {
  // /categories owns the list view. /films re-renders so its category
  // filter (and per-film category chip lookup) reflects the change.
  revalidatePath("/categories");
  revalidatePath("/films");
}

export async function createCategory(name: string): Promise<number> {
  if (typeof name !== "string") throw new Error("invalid name");
  const id = await q_create(name);
  revalidateAffected();
  return id;
}

export async function renameCategory(id: number, name: string): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) throw new Error("invalid id");
  if (typeof name !== "string") throw new Error("invalid name");
  await q_rename(id, name);
  revalidateAffected();
}

export async function deleteCategory(id: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) throw new Error("invalid id");
  await q_delete(id);
  revalidateAffected();
}
