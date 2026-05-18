"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { toast } from "@/components/ui/Toast";
import { renameCategory } from "@/lib/actions/categories";

export type InlineEditNameProps = {
  id: number;
  initialName: string;
};

export default function InlineEditName({
  id,
  initialName,
}: InlineEditNameProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialName);
    setDraft(initialName);
  }, [initialName]);

  function beginEdit() {
    setDraft(value);
    setEditing(true);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  function commit() {
    const next = draft.trim();
    if (!next) {
      cancel();
      return;
    }
    if (next === value) {
      setEditing(false);
      return;
    }
    const prev = value;
    setValue(next);
    setEditing(false);
    setPending(true);
    startTransition(async () => {
      try {
        await renameCategory(id, next);
        toast.success("Saved");
      } catch (err) {
        setValue(prev);
        toast.error((err as Error).message || "Failed to save");
      } finally {
        setPending(false);
      }
    });
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        className="fl-edit-cell"
        defaultValue={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={onKey}
        style={{ width: "100%", minWidth: 160 }}
        aria-label="Category name"
      />
    );
  }

  return (
    <button
      type="button"
      className="fl-cell-btn"
      style={{
        color: "var(--text)",
        fontWeight: 500,
        opacity: pending ? 0.6 : 1,
      }}
      onDoubleClick={beginEdit}
      onClick={(e) => e.stopPropagation()}
      title="Double-click to edit"
    >
      {value}
    </button>
  );
}
