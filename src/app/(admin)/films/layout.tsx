/**
 * Films layout — accepts the implicit `children` slot (the /films list,
 * or /films/[id], or /films/[id]/edit on a hard refresh) plus the named
 * `@drawer` parallel-routes slot.
 *
 * The drawer slot renders:
 *   - `null` (via @drawer/default.tsx) for the bare /films URL
 *   - the intercepted drawer for /films/[id] when navigated to from
 *     /films (see @drawer/(.)[id]/page.tsx)
 *   - the intercepted modal for /films/[id]/edit when navigated to from
 *     /films or the drawer (see @drawer/(.)[id]/edit/page.tsx)
 *
 * Per node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md
 * (the local Next 16 doc): both slots are passed as props; slots are
 * combined with the regular Page to form the final route.
 *
 * The intercepting prefix is `(.)` (same-level). Quoting that file
 * (intercepting-routes.md): "in the above example, the path to the
 * `photo` segment can use the `(..)` matcher since `@modal` is a slot
 * and **not** a segment. This means that the `photo` route is only one
 * segment level higher, despite being two file-system levels higher."
 * In our case `[id]` lives at the SAME segment level as `@drawer`
 * (both children of `films`), so `(.)[id]` is correct.
 */

export default function FilmsLayout({
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
