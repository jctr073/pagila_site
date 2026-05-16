"use client";

import Icon from "./Icon";

export type CheckProps = {
  checked?: boolean;
  mixed?: boolean;
  onChange?: (next: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
};

/**
 * Check — tri-state checkbox rendered as a <button role="checkbox">.
 *
 * - `checked={true}` → solid accent, ✓ glyph.
 * - `mixed={true}` (and `checked={false}`) → solid accent, − bar via ::after.
 * - both false → outlined.
 *
 * Mirrors designs/primitives.jsx#Check. Marked 'use client' because it
 * owns an onClick handler that consumers wire into local state.
 */
export default function Check({
  checked = false,
  mixed = false,
  onChange,
  ariaLabel,
  disabled,
}: CheckProps) {
  const showMixed = mixed && !checked;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={showMixed ? "mixed" : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className="pa-check"
      data-on={checked ? "1" : ""}
      data-mixed={showMixed ? "1" : ""}
      onClick={() => onChange?.(!checked)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange?.(!checked);
        }
      }}
    >
      {checked && <Icon name="check" size={10} />}
    </button>
  );
}
