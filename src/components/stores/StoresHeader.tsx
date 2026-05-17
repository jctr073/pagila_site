import { Btn } from "@/components/ui";

/**
 * Page heading for `/stores`. Mirrors the films header layout — title,
 * one-line summary of rollups, and a right-hand actions cluster.
 *
 * Ported from designs/stores-staff.jsx#StoresArtboard's `pa-page-h`
 * block. The grid/list toggle and "Import CSV" buttons are presentation
 * stubs for parity with Films; wiring is out of scope.
 */
export type StoresHeaderProps = {
  storeCount: number;
  staffCount: number;
  customerCount: number;
};

export default function StoresHeader({
  storeCount,
  staffCount,
  customerCount,
}: StoresHeaderProps) {
  return (
    <div className="pa-page-h">
      <div className="ttl">
        <h1>Stores &amp; Staff</h1>
        <p>
          {storeCount.toLocaleString()} stores ·{" "}
          {staffCount.toLocaleString()} staff members ·{" "}
          {customerCount.toLocaleString()} customers · synced live
        </p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="ghost" leftIcon="upload">
          Import CSV
        </Btn>
        <Btn
          size="sm"
          leftIcon="grid"
          variant="ghost"
          iconOnly
          aria-label="Grid view"
        />
        <Btn size="sm" leftIcon="list" iconOnly aria-label="List view" />
      </div>
    </div>
  );
}
