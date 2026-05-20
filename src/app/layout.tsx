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
 * No-flash theme bootstrap.
 *
 * Runs in <head> *before* React hydrates. For an explicit theme, the
 * server already wrote the correct class — this script just confirms
 * none of the sibling theme classes leaked in (e.g. via stale HMR).
 *
 * For the default 'system' value, we read `prefers-color-scheme` and
 * add `theme-dark` when the OS asks for dark, so OS-dark users don't
 * flash a light page on first paint.
 *
 * Kept intentionally tiny and self-contained — no template-injected
 * user data is interpolated in.
 */
const NO_FLASH_SCRIPT = `(function(){try{var d=document.documentElement;var classes=['theme-dark','theme-midnight','theme-plum','theme-forest','theme-cobalt','theme-mint','theme-mono'];var c=document.cookie||'';var m=c.match(/(?:^|; )pa-theme=([^;]+)/);var t=m?decodeURIComponent(m[1]):'system';var want='';if(t==='system'){if(window.matchMedia('(prefers-color-scheme: dark)').matches){want='theme-dark'}}else if(t==='dark'){want='theme-dark'}else if(t==='midnight'){want='theme-midnight'}else if(t==='plum'){want='theme-plum'}else if(t==='forest'){want='theme-forest'}else if(t==='cobalt'){want='theme-cobalt'}else if(t==='mint'){want='theme-mint'}else if(t==='mono'){want='theme-mono'}for(var i=0;i<classes.length;i++){if(classes[i]!==want)d.classList.remove(classes[i])}if(want)d.classList.add(want)}catch(e){}})()`;

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
