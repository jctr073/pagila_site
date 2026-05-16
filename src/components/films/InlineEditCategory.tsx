"use client";

/**
 * InlineEditCategory — double-click the Category chip to swap categories.
 *
 * Same pattern as InlineEditRate, but renders a `<select>` instead of a
 * free-text input because the value space is the fixed Pagila category
 * lookup table. We pass the category list from the server page so we
 * don't re-query on every cell mount.
 */

import {
  startTransition,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";

import { updateCategory } from "@/lib/actions/films";
import CategoryChip from "@/components/ui/CategoryChip";
import { toast } from "@/components/ui/Toast";

type CategoryOption = { id: number; name: string };

export type InlineEditCategoryProps = {
  id: number;
  initialCategory: string;
  categories: CategoryOption[];
};

export default function InlineEditCategory({
  id,
  initialCategory,
  categories,
}: InlineEditCategoryProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(initialCategory);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialCategory);
  }, [initialCategory]);

  function cancel() {
    setEditing(false);
  }

  async function commit(nextName: string) {
    const cat = categories.find((c) => c.name === nextName);
    if (!cat) {
      cancel();
      return;
    }
    if (cat.name === value) {
      setEditing(false);
      return;
    }
    // Optimistic.
    const prev = value;
    setValue(cat.name);
    setEditing(false);
    setPending(true);
    startTransition(async () => {
      try {
        await updateCategory(id, cat.id);
        toast.success("Saved");
      } catch (err) {
        setValue(prev);
        toast.error((err as Error).message || "Failed to save");
      } finally {
        setPending(false);
      }
    });
  }

  function onKey(e: KeyboardEvent<HTMLSelectElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <select
        autoFocus
        className="fl-edit-cell"
        defaultValue={value}
        onChange={(e) => void commit(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={onKey}
        aria-label="Category"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      className="fl-cell-btn"
      onDoubleClick={() => setEditing(true)}
      onClick={(e) => e.stopPropagation()}
      style={{ opacity: pending ? 0.6 : 1 }}
      title="Double-click to edit"
    >
      <CategoryChip value={value} />
    </button>
  );
}
