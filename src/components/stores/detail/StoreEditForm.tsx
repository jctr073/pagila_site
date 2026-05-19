"use client";

/**
 * StoreEditForm — edit modal body for a single store.
 *
 * Mirrors FilmEditForm: debounced auto-save per field plus an explicit
 * "Save changes" button that flushes any pending debounce, runs the
 * action one last time, then `router.back()` to dismiss the modal.
 *
 * Editable fields cover `store.name` and the joined address row
 * (address, address2, district, postal_code, phone, city_id). Country
 * isn't directly editable — it follows from the city selection, so the
 * city select renders "City, Country" labels and we surface the resolved
 * country read-only underneath.
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

import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import { updateStore, type UpdateStoreResult } from "@/lib/actions/stores";
import type { CityLookupRow } from "@/lib/queries/lookups";
import type { StoreDetail, StoreEditPatch } from "@/lib/types";

export type StoreEditFormProps = {
  store: StoreDetail;
  cities: CityLookupRow[];
  /** Render as a page (no fixed positioning) instead of a centered modal. */
  standalone?: boolean;
};

type FormState = {
  name: string;
  address: string;
  address2: string;
  district: string;
  postal: string;
  phone: string;
  cityId: number;
};

function snapshot(store: StoreDetail, cityId: number): FormState {
  return {
    name: store.name ?? "",
    address: store.address,
    address2: store.address2 ?? "",
    district: store.district,
    postal: store.postal ?? "",
    phone: store.phone,
    cityId,
  };
}

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
const INITIAL_STATE: UpdateStoreResult = {
  ok: true,
  savedAt: INITIAL_SAVED_AT,
};

const INPUT_STYLE: React.CSSProperties = {
  height: 32,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  fontSize: 13,
  color: "var(--text)",
  width: "100%",
};

export default function StoreEditForm({
  store,
  cities,
  standalone = false,
}: StoreEditFormProps) {
  const router = useRouter();

  // Resolve initial city_id from the store's current city + country. The
  // detail payload doesn't carry the FK, so we match against the lookup.
  const initialCityId =
    cities.find(
      (c) => c.city === store.city && c.country === store.country,
    )?.id ?? cities[0]?.id ?? 0;

  const action = useCallback(
    async (
      _prev: UpdateStoreResult,
      patch: StoreEditPatch,
    ): Promise<UpdateStoreResult> => {
      return await updateStore(store.id, patch);
    },
    [store.id],
  );

  const [serverState, runAction, isSaving] = useActionState<
    UpdateStoreResult,
    StoreEditPatch
  >(action, INITIAL_STATE);

  const [form, setForm] = useState<FormState>(() =>
    snapshot(store, initialCityId),
  );
  const [prevStoreId, setPrevStoreId] = useState(store.id);

  if (prevStoreId !== store.id) {
    setPrevStoreId(store.id);
    setForm(snapshot(store, initialCityId));
  }

  const lastSavedRef = useRef<FormState>(snapshot(store, initialCityId));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computePatch = useCallback((next: FormState): StoreEditPatch => {
    const prev = lastSavedRef.current;
    const out: StoreEditPatch = {};
    if (next.name !== prev.name) out.name = next.name.trim() ? next.name : null;
    if (next.address !== prev.address) out.address = next.address;
    if (next.address2 !== prev.address2)
      out.address2 = next.address2.trim() ? next.address2 : null;
    if (next.district !== prev.district) out.district = next.district;
    if (next.postal !== prev.postal)
      out.postal = next.postal.trim() ? next.postal : null;
    if (next.phone !== prev.phone) out.phone = next.phone;
    if (next.cityId !== prev.cityId) out.cityId = next.cityId;
    return out;
  }, []);

  const scheduleAutoSave = useCallback(
    (next: FormState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const patch = computePatch(next);
        if (Object.keys(patch).length === 0) return;
        lastSavedRef.current = next;
        startTransition(() => {
          runAction(patch);
        });
      }, 600);
    },
    [computePatch, runAction],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as FormState;
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
      const result = await updateStore(store.id, patch);
      if (!result.ok) return;
    }
    router.back();
  }

  const idStr = String(store.id).padStart(3, "0");
  const savedAtIso =
    serverState.ok && serverState.savedAt > INITIAL_SAVED_AT
      ? serverState.savedAt
      : null;
  const savedLabel = savedAtIso ? relativeTime(savedAtIso, now) : "";
  const savedError = serverState.ok ? null : serverState.error;

  const selectedCity = cities.find((c) => c.id === form.cityId);

  return (
    <div
      className={standalone ? "mdl mdl-standalone" : "mdl"}
      role="dialog"
      aria-modal="true"
      aria-label="Edit store"
    >
      <header className="mdl-head">
        <div>
          <h3>Edit store</h3>
          <span className="sub">
            #{idStr} ·{" "}
            {store.name?.trim() || `${store.city}, ${store.country}`}
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
        <section className="mdl-section">
          <div className="mdl-section-h">Basics</div>
          <div className="mdl-field">
            <label htmlFor="store-name">Store name</label>
            <input
              id="store-name"
              className="pa-input pa-input-bare"
              style={INPUT_STYLE}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={`${store.city}, ${store.country}`}
            />
          </div>
        </section>

        <section className="mdl-section">
          <div className="mdl-section-h">Location</div>
          <div className="mdl-field">
            <label htmlFor="store-address">
              Address <span className="req">*</span>
            </label>
            <input
              id="store-address"
              className="pa-input pa-input-bare"
              style={INPUT_STYLE}
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              required
            />
          </div>
          <div className="mdl-field">
            <label htmlFor="store-address2">Address line 2</label>
            <input
              id="store-address2"
              className="pa-input pa-input-bare"
              style={INPUT_STYLE}
              value={form.address2}
              onChange={(e) => updateField("address2", e.target.value)}
            />
          </div>
          <div className="mdl-grid-2">
            <div className="mdl-field">
              <label htmlFor="store-city">
                City <span className="req">*</span>
              </label>
              <select
                id="store-city"
                className="mdl-select"
                value={form.cityId}
                onChange={(e) =>
                  updateField("cityId", Number(e.target.value))
                }
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.city}, {c.country}
                  </option>
                ))}
              </select>
            </div>
            <div className="mdl-field">
              <label>Country</label>
              <div
                className="mdl-select-fake"
                title="Determined by the selected city"
              >
                <span>{selectedCity?.country ?? store.country}</span>
              </div>
            </div>
          </div>
          <div className="mdl-grid-3">
            <div className="mdl-field">
              <label htmlFor="store-district">
                District <span className="req">*</span>
              </label>
              <input
                id="store-district"
                className="pa-input pa-input-bare"
                style={INPUT_STYLE}
                value={form.district}
                onChange={(e) => updateField("district", e.target.value)}
                required
              />
            </div>
            <div className="mdl-field">
              <label htmlFor="store-postal">Postal code</label>
              <input
                id="store-postal"
                className="pa-input pa-input-bare"
                style={{ ...INPUT_STYLE, fontFamily: "var(--font-mono)" }}
                value={form.postal}
                onChange={(e) => updateField("postal", e.target.value)}
              />
            </div>
            <div className="mdl-field">
              <label htmlFor="store-phone">
                Phone <span className="req">*</span>
              </label>
              <input
                id="store-phone"
                className="pa-input pa-input-bare"
                style={{ ...INPUT_STYLE, fontFamily: "var(--font-mono)" }}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
            </div>
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
