"use client";

import { startTransition, useEffect, useState } from "react";

import { Btn, Icon } from "@/components/ui";
import { toast } from "@/components/ui/Toast";
import { deleteCategory } from "@/lib/actions/categories";
import type { CategoryListRow } from "@/lib/types";

export type DeleteCategoryModalProps = {
  category: CategoryListRow | null;
  onClose: () => void;
};

export default function DeleteCategoryModal({
  category,
  onClose,
}: DeleteCategoryModalProps) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!category) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [category, onClose]);

  if (!category) return null;

  function confirm() {
    if (!category || deleting) return;
    const id = category.id;
    const name = category.name;
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success(`Deleted "${name}"`);
        onClose();
      } catch (err) {
        toast.error((err as Error).message || "Failed to delete");
      } finally {
        setDeleting(false);
      }
    });
  }

  const impact =
    category.filmCount === 0
      ? "No films are linked to this category."
      : `Removing will unlink ${category.filmCount.toLocaleString()} film${
          category.filmCount === 1 ? "" : "s"
        } — the films stay, only the link is removed.`;

  return (
    <>
      <div
        className="mdl-scrim"
        aria-hidden="true"
        onClick={() => !deleting && onClose()}
      />
      <div
        className="mdl"
        role="dialog"
        aria-modal="true"
        aria-label="Delete category"
        style={{ width: 460 }}
      >
        <header className="mdl-head">
          <div>
            <h3>Delete category</h3>
            <span className="sub">This cannot be undone.</span>
          </div>
          <div className="grow" />
          <Btn
            size="sm"
            variant="ghost"
            iconOnly
            aria-label="Close"
            onClick={onClose}
            disabled={deleting}
          >
            <Icon name="x" size={14} />
          </Btn>
        </header>

        <div className="mdl-body">
          <p style={{ margin: 0, fontSize: 13, color: "var(--text)" }}>
            Delete <strong>{category.name}</strong>?
          </p>
          <p
            style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}
          >
            {impact}
          </p>
        </div>

        <footer className="mdl-foot">
          <div className="grow" />
          <Btn size="sm" variant="ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </Btn>
          <Btn
            size="sm"
            variant="danger-ghost"
            onClick={confirm}
            disabled={deleting}
            leftIcon="trash"
          >
            {deleting ? "Deleting…" : "Delete category"}
          </Btn>
        </footer>
      </div>
    </>
  );
}
