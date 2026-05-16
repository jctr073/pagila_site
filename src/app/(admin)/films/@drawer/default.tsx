/**
 * Default slot for `@drawer` — returns null when no drawer route is
 * active. Required by Next 16 parallel routes (see
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md
 *   §default.js): "On refresh, Next.js will render a `default.js` for
 *   `@analytics`. If `default.js` doesn't exist, a `404` is rendered
 *   instead."
 */

export default function DrawerDefault() {
  return null;
}
