/**
 * Standalone edit modal — rendered when /films/[id]/edit is hard-loaded.
 *
 * Same data + form as the intercepted modal; renders the form inside a
 * standalone page shell (no scrim — there's nothing behind it to dim).
 */

import { notFound } from "next/navigation";

import FilmEditForm from "@/components/films/detail/FilmEditForm";
import StandaloneDrawerPage from "@/components/films/detail/StandaloneDrawerPage";
import { getFilm, getFilmCast } from "@/lib/queries/films";
import { listCategories, listLanguages } from "@/lib/queries/lookups";

export default async function StandaloneEditPage({
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
    <StandaloneDrawerPage title={`Edit · ${film.title}`}>
      <FilmEditForm
        film={film}
        categories={categories}
        languages={languages}
        cast={cast}
        standalone
      />
    </StandaloneDrawerPage>
  );
}
