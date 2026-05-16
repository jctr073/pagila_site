import { CategoryChip } from "@/components/ui";
import type { TopFilm } from "@/lib/types";

export type TopFilmsListProps = {
  films: TopFilm[];
};

/**
 * Numbered top-N films card. Ports the `db-list` block from
 * design_handoff_pagila_admin/designs/dashboard.jsx — rank · title ·
 * category chip · rentals count.
 */
export default function TopFilmsList({ films }: TopFilmsListProps) {
  return (
    <div className="pa-card db-top" style={{ display: "flex", flexDirection: "column" }}>
      <div className="db-section-h">
        <h3>Top films this month</h3>
        <span className="sub">by rental count</span>
        <div className="spacer" />
        <a className="pa-link" style={{ fontSize: 11.5 }}>
          See all →
        </a>
      </div>
      <div className="db-list">
        {films.map((film, i) => (
          <div key={film.id} className="db-top-row">
            <span className="rank">{i + 1}</span>
            <span className="ttl">{film.title}</span>
            <CategoryChip value={film.category} />
            <span className="meta">{film.rentals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
