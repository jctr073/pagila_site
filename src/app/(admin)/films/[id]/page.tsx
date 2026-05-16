/**
 * Standalone film detail — rendered when /films/[id] is hard-loaded
 * (cold visit, refresh, or shared link). Same data fetch as the
 * intercepted drawer, but laid out inside the admin shell as a normal
 * page rather than a fixed-position overlay.
 *
 * Reuses <FilmDrawer standalone /> for the body so the design stays in
 * sync without duplicating markup.
 */

import { notFound } from "next/navigation";

import FilmDrawer from "@/components/films/detail/FilmDrawer";
import StandaloneDrawerPage from "@/components/films/detail/StandaloneDrawerPage";
import {
  getFilm,
  getFilm30dPerformance,
  getFilmCast,
  getFilmDemandSparklines,
  getFilmInventoryByStore,
} from "@/lib/queries/films";

export default async function StandaloneFilmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const filmId = Number.parseInt(id, 10);
  if (!Number.isFinite(filmId) || filmId <= 0) notFound();

  const [film, inventory, cast, perf, sparks] = await Promise.all([
    getFilm(filmId),
    getFilmInventoryByStore(filmId),
    getFilmCast(filmId),
    getFilm30dPerformance(filmId),
    getFilmDemandSparklines([filmId]),
  ]);
  if (!film) notFound();

  const spark = sparks.get(filmId);

  return (
    <StandaloneDrawerPage title={film.title}>
      <FilmDrawer
        film={film}
        inventory={inventory}
        cast={cast}
        perf={perf}
        spark={spark}
        standalone
      />
    </StandaloneDrawerPage>
  );
}
