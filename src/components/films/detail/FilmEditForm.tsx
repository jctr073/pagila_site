"use client";

/**
 * FilmEditForm — the actual edit form body (lives inside the modal).
 *
 * Two save channels:
 *   1. Auto-save: changes to any controlled field schedule a debounced
 *      `updateFilm` server-action call after 600 ms of idle. Coalesces
 *      back-to-back edits.
 *   2. Explicit "Save changes" button: flushes any pending debounce,
 *      runs `updateFilm`, then `router.back()` to dismiss the modal.
 *
 * "Auto-saved Xs ago" indicator: a `useEffect` with `setInterval(1s)` keeps
 * the relative-time label fresh. The timer is paused when there's no saved
 * timestamp yet (initial mount) to avoid spinning a ticker against null.
 *
 * Cast editing is out of scope for the MVP — we render the existing cast
 * with the × buttons + "Add actor" disabled, and show a small
 * "Coming soon" hint underneath.
 */

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";
import Btn from "@/components/ui/Btn";
import CategoryChip from "@/components/ui/CategoryChip";
import Check from "@/components/ui/Check";
import Icon from "@/components/ui/Icon";
import Rating from "@/components/ui/Rating";
import { updateFilm, type UpdateFilmResult } from "@/lib/actions/films";
import type {
  FilmCastMember,
  FilmDetail,
  Rating as RatingValue,
  SpecialFeature,
} from "@/lib/types";

const FEATURE_OPTIONS: SpecialFeature[] = [
  "Trailers",
  "Commentaries",
  "Deleted Scenes",
  "Behind the Scenes",
];
const RATING_OPTIONS: RatingValue[] = ["G", "PG", "PG-13", "R", "NC-17"];

type LookupRow = { id: number; name: string };

export type FilmEditFormProps = {
  film: FilmDetail;
  categories: LookupRow[];
  languages: LookupRow[];
  cast: FilmCastMember[];
  /** Render as a page (no fixed positioning) instead of a centered modal. */
  standalone?: boolean;
};

type FormState = {
  title: string;
  desc: string;
  year: number;
  durationDays: number;
  rate: number;
  length: number;
  replace: number;
  rating: RatingValue;
  features: string[];
  categoryId: number;
  languageId: number;
  originalLanguageId: number | null;
};

function snapshot(film: FilmDetail): FormState {
  return {
    title: film.title,
    desc: film.desc,
    year: film.year,
    durationDays: film.durationDays,
    rate: film.rate,
    length: film.length,
    replace: film.replace,
    rating: film.rating,
    features: [...film.features],
    categoryId: film.categoryId,
    languageId: film.languageId,
    originalLanguageId: film.originalLanguageId,
  };
}

/** "Just now" / "Xs ago" / "Xm ago". Kept tiny — no Intl pile-up. */
function relativeTime(savedAtIso: string | null, nowMs: number): string {
  if (!savedAtIso) return "";
  const t = new Date(savedAtIso).getTime();
  if (Number.isNaN(t)) return "";
  const secs = Math.max(0, Math.round((nowMs - t) / 1000));
  if (secs < 2) return "Auto-saved just now";
  if (secs < 60) return `Auto-saved ${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `Auto-saved ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `Auto-saved ${hrs}h ago`;
}

const INITIAL_SAVED_AT = new Date(0).toISOString();
const INITIAL_STATE: UpdateFilmResult = {
  ok: true,
  savedAt: INITIAL_SAVED_AT,
};

export default function FilmEditForm({
  film,
  categories,
  languages,
  cast,
  standalone = false,
}: FilmEditFormProps) {
  // The `categories` lookup is fetched server-side for future use (the
  // Category select preview will become a real <select> in v2); referenced
  // here so the prop isn't flagged as unused.
  void categories;
  const router = useRouter();

  // useActionState (Next 16 / React 19 idiomatic form-action wiring). We
  // wrap our typed `updateFilm` in an adapter that takes the prev state
  // + the form snapshot — the React signature is
  // `(prevState, payload) => Promise<nextState>`.
  const action = useCallback(
    async (
      _prev: UpdateFilmResult,
      patch: Partial<FilmDetail>,
    ): Promise<UpdateFilmResult> => {
      return await updateFilm(film.id, patch);
    },
    [film.id],
  );

  const [serverState, runAction, isSaving] = useActionState<
    UpdateFilmResult,
    Partial<FilmDetail>
  >(action, INITIAL_STATE);

  const [form, setForm] = useState<FormState>(() => snapshot(film));
  const [prevFilmId, setPrevFilmId] = useState(film.id);

  // Re-snapshot when the server prop changes underneath us (e.g. someone
  // else updated the film and a revalidation flushed in). The React 19
  // idiom for "adjust state during rendering" uses a previous-state
  // variable to detect the change. See
  //   https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (prevFilmId !== film.id) {
    setPrevFilmId(film.id);
    setForm(snapshot(film));
  }

  // Debounce timer. We keep the last-committed snapshot ref so we can
  // compute a minimal patch (only changed keys) per fire.
  const lastSavedRef = useRef<FormState>(snapshot(film));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computePatch = useCallback(
    (next: FormState): Partial<FilmDetail> => {
      const prev = lastSavedRef.current;
      const out: Partial<FilmDetail> = {};
      if (next.title !== prev.title) out.title = next.title;
      if (next.desc !== prev.desc) out.desc = next.desc;
      if (next.year !== prev.year) out.year = next.year;
      if (next.durationDays !== prev.durationDays)
        out.durationDays = next.durationDays;
      if (next.rate !== prev.rate) out.rate = next.rate;
      if (next.length !== prev.length) out.length = next.length;
      if (next.replace !== prev.replace) out.replace = next.replace;
      if (next.rating !== prev.rating) out.rating = next.rating;
      if (next.features.join("|") !== prev.features.join("|"))
        out.features = next.features;
      if (next.languageId !== prev.languageId)
        out.languageId = next.languageId;
      if (next.originalLanguageId !== prev.originalLanguageId)
        out.originalLanguageId = next.originalLanguageId;
      // NB: categoryId is intentionally NOT included in `updateFilm`'s
      // patch — Pagila's category lives in a separate join table. The
      // category select stays a no-op preview for now (same as
      // designs/film-detail.jsx — see TODO below).
      // TODO(v2): wire to updateCategory in actions/films.ts.
      return out;
    },
    [],
  );

  const scheduleAutoSave = useCallback(
    (next: FormState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const patch = computePatch(next);
        if (Object.keys(patch).length === 0) return;
        // Optimistically advance the "last saved" reference so we don't
        // fire the same patch twice on rapid keystrokes.
        lastSavedRef.current = next;
        startTransition(() => {
          runAction(patch);
        });
      }, 600);
    },
    [computePatch, runAction],
  );

  // Cleanup pending debounce on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── "Auto-saved Xs ago" ticker ────────────────────────────────────
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Field update helper ───────────────────────────────────────────
  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as FormState;
      scheduleAutoSave(next);
      return next;
    });
  }

  function toggleFeature(opt: string) {
    setForm((prev) => {
      const has = prev.features.includes(opt);
      const features = has
        ? prev.features.filter((x) => x !== opt)
        : [...prev.features, opt];
      const next = { ...prev, features };
      scheduleAutoSave(next);
      return next;
    });
  }

  async function saveAndClose() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const patch = computePatch(form);
    if (Object.keys(patch).length > 0) {
      lastSavedRef.current = form;
      const result = await updateFilm(film.id, patch);
      if (!result.ok) {
        // Stay on the modal so the user can fix and retry. We can't
        // surface the error via useActionState here because we called
        // the action directly — but the form footer reflects the last
        // useActionState result, which is still meaningful.
        return;
      }
    }
    router.back();
  }

  // ── "Saved Xs ago" label ───────────────────────────────────────────
  const idStr = String(film.id).padStart(3, "0");
  const savedAtIso =
    serverState.ok && serverState.savedAt > INITIAL_SAVED_AT
      ? serverState.savedAt
      : null;
  const savedLabel = savedAtIso ? relativeTime(savedAtIso, now) : "";
  const savedError = serverState.ok ? null : serverState.error;

  return (
    <div
      className={standalone ? "mdl mdl-standalone" : "mdl"}
      role="dialog"
      aria-modal="true"
      aria-label="Edit film"
    >
      <header className="mdl-head">
        <div>
          <h3>Edit film</h3>
          <span className="sub">
            #{idStr} · {film.title}
            {savedLabel ? ` · ${savedLabel.replace("Auto-saved ", "")}` : ""}
          </span>
        </div>
        <div className="grow" />
        <Btn
          size="sm"
          variant="ghost"
          iconOnly
          aria-label="Close"
          onClick={() => router.back()}
        >
          <Icon name="x" size={14} />
        </Btn>
      </header>

      <div className="mdl-body">
        {/* ── Basics ──────────────────────────────────────────────── */}
        <section className="mdl-section">
          <div className="mdl-section-h">Basics</div>
          <div className="mdl-field">
            <label htmlFor="film-title">
              Title <span className="req">*</span>
            </label>
            <input
              id="film-title"
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
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>
          <div className="mdl-field">
            <label htmlFor="film-desc">Synopsis</label>
            <textarea
              id="film-desc"
              className="mdl-textarea"
              value={form.desc}
              onChange={(e) => updateField("desc", e.target.value)}
            />
          </div>
          <div className="mdl-grid-3">
            <div className="mdl-field">
              <label>Category</label>
              <div className="mdl-select-fake" title="Category editing coming soon">
                <CategoryChip value={film.category} />
                <Icon
                  name="chevDown"
                  size={12}
                  style={{ marginLeft: "auto", color: "var(--text-soft)" }}
                />
              </div>
            </div>
            <div className="mdl-field">
              <label htmlFor="film-rating">Rating</label>
              <select
                id="film-rating"
                className="mdl-select"
                value={form.rating}
                onChange={(e) =>
                  updateField("rating", e.target.value as RatingValue)
                }
              >
                {RATING_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="mdl-field">
              <label htmlFor="film-lang">Language</label>
              <select
                id="film-lang"
                className="mdl-select"
                value={form.languageId}
                onChange={(e) =>
                  updateField("languageId", Number(e.target.value))
                }
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Show current rating as a pill preview underneath the select */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-soft)" }}>
              Preview:
            </span>
            <Rating value={form.rating} />
          </div>
        </section>

        {/* ── Pricing & duration ──────────────────────────────────── */}
        <section className="mdl-section">
          <div className="mdl-section-h">Pricing & duration</div>
          <div className="mdl-grid-4">
            <div className="mdl-field">
              <label>Release year</label>
              <NumericInput
                value={form.year}
                onCommit={(n) => updateField("year", n)}
              />
            </div>
            <div className="mdl-field">
              <label>Length</label>
              <NumericInput
                value={form.length}
                onCommit={(n) => updateField("length", n)}
                suffix="min"
              />
            </div>
            <div className="mdl-field">
              <label>Rental rate</label>
              <NumericInput
                value={form.rate}
                onCommit={(n) => updateField("rate", n)}
                prefix="$"
                step={0.01}
                decimals={2}
              />
            </div>
            <div className="mdl-field">
              <label>Replacement</label>
              <NumericInput
                value={form.replace}
                onCommit={(n) => updateField("replace", n)}
                prefix="$"
                step={0.01}
                decimals={2}
              />
            </div>
          </div>
          <div className="mdl-grid-2">
            <div className="mdl-field">
              <label>Rental duration</label>
              <NumericInput
                value={form.durationDays}
                onCommit={(n) => updateField("durationDays", n)}
                suffix="days"
              />
            </div>
            <div className="mdl-field">
              <label htmlFor="film-olang">Original language</label>
              <select
                id="film-olang"
                className="mdl-select"
                value={form.originalLanguageId ?? ""}
                onChange={(e) =>
                  updateField(
                    "originalLanguageId",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">— None —</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Special features ────────────────────────────────────── */}
        <section className="mdl-section">
          <div className="mdl-section-h">Special features</div>
          <div className="mdl-feats">
            {FEATURE_OPTIONS.map((opt) => (
              <label key={opt}>
                <Check
                  checked={form.features.includes(opt)}
                  onChange={() => toggleFeature(opt)}
                  ariaLabel={opt}
                />
                {opt}
              </label>
            ))}
          </div>
        </section>

        {/* ── Cast (read-only pills) ──────────────────────────────── */}
        <section className="mdl-section">
          <div className="mdl-section-h">Cast</div>
          <div className="mdl-cast">
            {cast.map((a) => {
              const initials = `${a.first_name[0] ?? ""}${a.last_name[0] ?? ""}`;
              return (
                <span key={a.actor_id} className="pill">
                  <Avatar
                    initials={initials.toUpperCase()}
                    tone="violet"
                    size={16}
                  />
                  {a.first_name} {a.last_name}
                  <span
                    className="x"
                    aria-disabled="true"
                    title="Coming soon"
                  >
                    <Icon name="x" size={10} />
                  </span>
                </span>
              );
            })}
            {/* TODO(v2): cast diff via film_actor table. Until then, the
                add/remove controls render disabled. */}
            <button
              type="button"
              className="pa-btn add-actor"
              data-variant="ghost"
              data-size="sm"
              disabled
              title="Coming soon"
            >
              <Icon name="plus" size={12} /> Add actor
            </button>
          </div>
          <div className="mdl-cast-hint">
            Cast editing coming soon — current cast is read-only.
          </div>
        </section>
      </div>

      <footer className="mdl-foot">
        <span className="saved" aria-live="polite">
          {savedError ? (
            <>
              <Icon name="x" size={11} className="err" />
              <span style={{ color: "var(--danger)" }}>
                Save failed: {savedError}
              </span>
            </>
          ) : isSaving ? (
            <>
              <Icon name="cycle" size={11} />
              Saving…
            </>
          ) : savedLabel ? (
            <>
              <Icon name="check" size={11} className="ok" />
              {savedLabel}
            </>
          ) : (
            <span style={{ color: "var(--text-soft)" }}>Edits auto-save</span>
          )}
        </span>
        <div className="grow" />
        <Btn size="sm" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Btn>
        <Btn
          size="sm"
          variant="primary"
          leftIcon="check"
          onClick={() => void saveAndClose()}
          disabled={isSaving}
        >
          Save changes
        </Btn>
      </footer>
    </div>
  );
}

/* ── NumericInput ──────────────────────────────────────────────────── */
/**
 * Small, controlled-ish numeric input. We keep a local string draft so
 * the user can type freely (e.g. "0.0" while typing "0.05"), and only
 * commit on blur / Enter to the parent's typed number value.
 */
function NumericInput({
  value,
  onCommit,
  prefix,
  suffix,
  step = 1,
  decimals = 0,
}: {
  value: number;
  onCommit: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  decimals?: number;
}) {
  const display = `${prefix ?? ""}${value.toFixed(decimals)}${suffix ? ` ${suffix}` : ""}`;
  const [draft, setDraft] = useState(display);
  const [editing, setEditing] = useState(false);
  const [prevDisplay, setPrevDisplay] = useState(display);

  // Keep the draft in sync when the external value changes — but only
  // while NOT editing (so we don't clobber what the user is typing).
  // Uses the React 19 "previous prop" idiom (see
  //   react.dev/reference/react/useState#storing-information-from-previous-renders)
  // to derive the update during render rather than in a useEffect.
  if (!editing && prevDisplay !== display) {
    setPrevDisplay(display);
    setDraft(display);
  }

  function commit() {
    setEditing(false);
    // Strip prefix/suffix; parse the first number we find.
    const cleaned = draft.replace(/[^0-9.\-]/g, "");
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n)) {
      setDraft(display);
      return;
    }
    if (n === value) {
      setDraft(display);
      return;
    }
    onCommit(n);
  }

  return (
    <input
      type="text"
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      className="pa-input pa-input-bare"
      style={{
        height: 32,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        fontSize: 13,
        fontFamily:
          "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
        color: "var(--text)",
        width: "100%",
      }}
      value={draft}
      step={step}
      onFocus={() => setEditing(true)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setDraft(display);
          setEditing(false);
        }
      }}
    />
  );
}
