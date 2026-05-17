/**
 * Stores layout — accepts the implicit `children` slot (the /stores
 * list, or /stores/[id] on hard refresh) plus the named `@drawer`
 * parallel-routes slot used for the intercepted detail drawer.
 *
 * Mirrors src/app/(admin)/films/layout.tsx — see that file for the
 * Next 16 routing notes (intercepting prefix `(.)` because the [id]
 * segment is a sibling of `@drawer`).
 */

export default function StoresLayout({
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
