/**
 * Admin route-group layout.
 *
 * Server component. Wraps every page inside the (admin) route group in
 * the Sidebar + Topbar shell. The root layout (src/app/layout.tsx)
 * already renders <html>/<body class="pa-root density-…">, so this
 * layer is purely visual chrome.
 *
 * Phase 10/11: reads cookie-backed prefs and forwards them to the
 * Topbar so the UserMenu starts with the correct theme/density label.
 * Mounts the global <Toaster /> here (admin-only — the marketing
 * surface doesn't need it).
 */

import Sidebar from "@/components/Shell/Sidebar";
import Topbar from "@/components/Shell/Topbar";
import { Toaster } from "@/components/ui/Toast";
import { getPreferences } from "@/lib/preferences";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, density } = await getPreferences();
  return (
    <div className="pa-shell">
      <Sidebar />
      <div className="pa-main">
        <Topbar initialTheme={theme} initialDensity={density} />
        <main className="pa-content">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
