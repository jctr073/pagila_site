"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Btn, Icon } from "@/components/ui";
import { toast } from "@/components/ui/Toast";
import { createCategory } from "@/lib/actions/categories";

export type NewCategoryModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewCategoryModal({
  open,
  onClose,
}: NewCategoryModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    startTransition(async () => {
      try {
        await createCategory(trimmed);
        toast.success("Category added");
        onClose();
      } catch (err) {
        toast.error((err as Error).message || "Failed to create category");
      } finally {
        setSaving(false);
      }
    });
  }

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <>
      <div
        className="mdl-scrim"
        aria-hidden="true"
        onClick={() => !saving && onClose()}
      />
      <div
        className="mdl"
        role="dialog"
        aria-modal="true"
        aria-label="New category"
        style={{ width: 420 }}
      >
        <header className="mdl-head">
          <div>
            <h3>New category</h3>
            <span className="sub">Add a category for films.</span>
          </div>
          <div className="grow" />
          <Btn
            size="sm"
            variant="ghost"
            iconOnly
            aria-label="Close"
            onClick={onClose}
            disabled={saving}
          >
            <Icon name="x" size={14} />
          </Btn>
        </header>

        <div className="mdl-body">
          <div className="mdl-field">
            <label htmlFor="new-category-name">
              Name <span className="req">*</span>
            </label>
            <input
              id="new-category-name"
              ref={inputRef}
              className="pa-input pa-input-bare"
              style={{
                height: 32,
                padding: "0 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                fontSize: 13,
                color: "var(--text)",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="e.g. Documentary"
              maxLength={25}
              autoComplete="off"
              required
            />
          </div>
        </div>

        <footer className="mdl-foot">
          <div className="grow" />
          <Btn size="sm" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn
            size="sm"
            variant="primary"
            onClick={submit}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Add category"}
          </Btn>
        </footer>
      </div>
    </>
  );
}
