/**
 * Intercepted drawer route — `/films/[id]` when navigated to FROM `/films`.
 *
 * The `(.)` prefix is the "same-level" interceptor per Next 16's
 * `intercepting-routes.md` (the canonical doc lives at
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/intercepting-routes.md).
 *
 * The drawer body is a server component; the surrounding scrim + Esc
 * handler live in <FilmDrawerShell> (client). All data is fetched in
 * parallel via Promise.all.
 *
 * On a hard reload of /films/[id], Next won't run this interceptor —
 * it'll fall through to /films/[id]/page.tsx (the standalone fallback).
 */

import { notFound } from "next/navigation";

import FilmDrawer from "@/components/films/detail/FilmDrawer";
import FilmDrawerShell from "@/components/films/detail/FilmDrawerShell";
import {
  getFilm,
  getFilm30dPerformance,
  getFilmCast,
  getFilmDemandSparklines,
  getFilmInventoryByStore,
} from "@/lib/queries/films";

export default async function InterceptedDrawer({
  params,
}: {
  // Next 16: params is a Promise — see
  //   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
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
    <FilmDrawerShell>
      <FilmDrawer
        film={film}
        inventory={inventory}
        cast={cast}
        perf={perf}
        spark={spark}
      />
    </FilmDrawerShell>
  );
}
