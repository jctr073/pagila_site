/**
 * Intercepted edit modal — `/films/[id]/edit` when navigated FROM the
 * films list or from the drawer.
 *
 * Same `(.)` same-level interceptor convention as the drawer route. The
 * modal is a client-side form (<FilmEditForm />) wrapped in a client
 * shell that adds scrim + Esc handling.
 *
 * Data: re-fetches the film + lookups in parallel. Cast is fetched too
 * so the disabled cast preview shows current actors.
 */

import { notFound } from "next/navigation";

import FilmEditForm from "@/components/films/detail/FilmEditForm";
import FilmEditModalShell from "@/components/films/detail/FilmEditModalShell";
import { getFilm, getFilmCast } from "@/lib/queries/films";
import { listCategories, listLanguages } from "@/lib/queries/lookups";

export default async function InterceptedEditModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const filmId = Number.parseInt(id, 10);
  if (!Number.isFinite(filmId) || filmId <= 0) notFound();

  const [film, cast, categories, languages] = await Promise.all([
    getFilm(filmId),
    getFilmCast(filmId),
    listCategories(),
    listLanguages(),
  ]);
  if (!film) notFound();

  return (
    <FilmEditModalShell>
      <FilmEditForm
        film={film}
        categories={categories}
        languages={languages}
        cast={cast}
      />
    </FilmEditModalShell>
  );
}
