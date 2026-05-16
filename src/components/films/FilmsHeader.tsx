/**
 * FilmsHeader — page heading for /films.
 *
 * Server-renderable. Title + subtitle + Import CSV + grid/list toggle.
 *
 * Ported from designs/films-list.jsx#FilmsArtboard top-of-page block.
 * Sub-line wording is locked by the design ("N titles across 2 stores ·
 * M inventory units"); both numbers are passed in from the server page.
 */

import Btn from "@/components/ui/Btn";

export type FilmsHeaderProps = {
  totalFilms: number;
  inventoryUnits: number;
};

export default function FilmsHeader({
  totalFilms,
  inventoryUnits,
}: FilmsHeaderProps) {
  return (
    <div className="pa-page-h">
      <div className="ttl">
        <h1>Films</h1>
        <p>
          {totalFilms.toLocaleString()} titles across 2 stores ·{" "}
          {inventoryUnits.toLocaleString()} inventory units
        </p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="ghost" leftIcon="upload">
          Import CSV
        </Btn>
        {/* Grid/list toggle (stubbed — list view is the only one shipped). */}
        <Btn size="sm" leftIcon="grid" variant="ghost" iconOnly aria-label="Grid view" />
        <Btn size="sm" leftIcon="list" iconOnly aria-label="List view" />
      </div>
    </div>
  );
}
