/**
 * Rentals layout — implicit `children` slot (the /rentals list, the
 * standalone /rentals/[id] on hard refresh, or /rentals/new) plus the
 * named `@drawer` parallel-routes slot used for the intercepted drawer
 * and new-rental modal. Mirrors src/app/(admin)/stores/layout.tsx.
 */

export default function RentalsLayout({
  children,
  drawer,
}: {
  children: React.ReactNode;
  drawer: React.ReactNode;
}) {
  return (
    <>
      {children}
      {drawer}
    </>
  );
}
