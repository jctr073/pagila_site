"use client";

/**
 * Tiny in-house toast helper.
 *
 * Sidesteps the "no new deps" constraint that rules out `sonner` /
 * `react-hot-toast`. Pattern: a module-level event emitter the
 * `<Toaster />` listens to, plus a `toast` object with `success`,
 * `error`, `info` helpers. Auto-dismiss after 3s.
 *
 * Mounted once in src/app/(admin)/layout.tsx. No portal — the Toaster
 * uses `position: fixed`, which is sufficient for our shell layout.
 */

import { useEffect, useState } from "react";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; tone: ToastTone; text: string };

type Listener = (t: ToastItem) => void;

let nextId = 1;
const listeners = new Set<Listener>();

function emit(tone: ToastTone, text: string) {
  const item: ToastItem = { id: nextId++, tone, text };
  listeners.forEach((fn) => fn(item));
}

export const toast = {
  success: (text: string) => emit("success", text),
  error: (text: string) => emit("error", text),
  info: (text: string) => emit("info", text),
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onItem: Listener = (item) => {
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 3000);
    };
    listeners.add(onItem);
    return () => {
      listeners.delete(onItem);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pa-toaster" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className="pa-toast" data-tone={t.tone} role="status">
          {t.text}
        </div>
      ))}
    </div>
  );
}
