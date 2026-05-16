/**
 * Intercepted "Add stock" modal — `/films/[id]/add-inventory` when
 * navigated FROM the films list or the drawer.
 *
 * Same `(.)` same-level interceptor as the drawer + edit modal routes.
 * Data: re-fetch film + current inventory + stores in parallel. We pass
 * `excludeEmpty=false` so the picker shows stores that currently have
 * zero stock for this film (those are the most likely targets).
 */

import { notFound } from "next/navigation";

import FilmAddInventoryForm from "@/components/films/detail/FilmAddInventoryForm";
import FilmEditModalShell from "@/components/films/detail/FilmEditModalShell";
import { getFilm, getFilmInventoryByStore } from "@/lib/queries/films";
import { listStoresLite } from "@/lib/queries/inventory";

export default async function InterceptedAddInventoryModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const filmId = Number.parseInt(id, 10);
  if (!Number.isFinite(filmId) || filmId <= 0) notFound();

  const [film, inventory, stores] = await Promise.all([
    getFilm(filmId),
    getFilmInventoryByStore(filmId, false),
    listStoresLite(),
  ]);
  if (!film) notFound();

  return (
    <FilmEditModalShell>
      <FilmAddInventoryForm
        film={film}
        stores={stores}
        inventory={inventory}
      />
    </FilmEditModalShell>
  );
}
