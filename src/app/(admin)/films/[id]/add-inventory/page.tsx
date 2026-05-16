/**
 * Standalone "Add stock" page — rendered when /films/[id]/add-inventory
 * is hard-loaded (cold visit, refresh, or shared link). Same data + form
 * as the intercepted modal; renders inside the admin shell as a normal
 * page rather than a fixed-position overlay.
 */

import { notFound } from "next/navigation";

import FilmAddInventoryForm from "@/components/films/detail/FilmAddInventoryForm";
import StandaloneDrawerPage from "@/components/films/detail/StandaloneDrawerPage";
import { getFilm, getFilmInventoryByStore } from "@/lib/queries/films";
import { listStoresLite } from "@/lib/queries/inventory";

export default async function StandaloneAddInventoryPage({
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
    <StandaloneDrawerPage title={`Add stock · ${film.title}`}>
      <FilmAddInventoryForm
        film={film}
        stores={stores}
        inventory={inventory}
        standalone
      />
    </StandaloneDrawerPage>
  );
}
