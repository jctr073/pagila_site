import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";

import { cn } from "@/components/ui/cn";
import { getPreferences, themeClassFor } from "@/lib/preferences";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pagila Site",
  description: "Next.js, TypeScript, and Postgres starter for Pagila.",
};

/**
 * No-flash system theme bootstrap.
 *
 * Runs in <head> *before* React hydrates. If the user's saved theme
 * is 'system' (the default), we read `prefers-color-scheme` and add
 * `theme-dark` to <html> before paint. For 'light' / 'dark' the
 * server already wrote the right class, so this script is a no-op.
 *
 * Kept intentionally tiny and self-contained — no template-injected
 * user data is interpolated in.
 */
const NO_FLASH_SCRIPT = `(function(){try{var d=document.documentElement;var c=document.cookie||'';var m=c.match(/(?:^|; )pa-theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):'system';if(t==='system'){if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('theme-dark')}else{d.classList.remove('theme-dark')}}}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, density } = await getPreferences();
  const htmlClass = cn(
    manrope.variable,
    plexMono.variable,
    themeClassFor(theme),
  );
  return (
    <html lang="en" className={htmlClass} data-theme={theme}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className={cn("pa-root", `density-${density}`)}>{children}</body>
    </html>
  );
}
