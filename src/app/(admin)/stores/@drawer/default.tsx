/**
 * Default slot for `@drawer` — returns null when no drawer route is
 * active. Required by Next 16 parallel routes; see
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md
 */

export default function DrawerDefault() {
  return null;
}
