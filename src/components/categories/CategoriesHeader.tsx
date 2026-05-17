"use client";

import { Btn } from "@/components/ui";

export type CategoriesHeaderProps = {
  totalCategories: number;
  totalLinks: number;
  onNew: () => void;
};

export default function CategoriesHeader({
  totalCategories,
  totalLinks,
  onNew,
}: CategoriesHeaderProps) {
  return (
    <div className="pa-page-h">
      <div className="ttl">
        <h1>Categories</h1>
        <p>
          {totalCategories.toLocaleString()} categor
          {totalCategories === 1 ? "y" : "ies"} ·{" "}
          {totalLinks.toLocaleString()} film link
          {totalLinks === 1 ? "" : "s"}
        </p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="primary" leftIcon="plus" onClick={onNew}>
          New category
        </Btn>
      </div>
    </div>
  );
}
