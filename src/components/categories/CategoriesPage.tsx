"use client";

import { useState } from "react";

import type { CategoryListRow } from "@/lib/types";

import CategoriesHeader from "./CategoriesHeader";
import CategoriesTable, {
  type CategoriesSortDir,
  type CategoriesSortKey,
} from "./CategoriesTable";
import DeleteCategoryModal from "./DeleteCategoryModal";
import NewCategoryModal from "./NewCategoryModal";

export type CategoriesPageProps = {
  rows: CategoryListRow[];
  sort?: CategoriesSortKey;
  dir?: CategoriesSortDir;
};

export default function CategoriesPage({
  rows,
  sort,
  dir,
}: CategoriesPageProps) {
  const [newOpen, setNewOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CategoryListRow | null>(
    null,
  );

  const totalLinks = rows.reduce((acc, r) => acc + r.filmCount, 0);

  return (
    <>
      <CategoriesHeader
        totalCategories={rows.length}
        totalLinks={totalLinks}
        onNew={() => setNewOpen(true)}
      />
      <div
        className="fl-style-lined"
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <CategoriesTable
          rows={rows}
          sort={sort}
          dir={dir}
          onDelete={(row) => setPendingDelete(row)}
        />
      </div>

      <NewCategoryModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DeleteCategoryModal
        category={pendingDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
