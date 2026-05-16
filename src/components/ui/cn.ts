/**
 * Tiny class-name joiner. Filters out falsy values and joins with spaces.
 * Avoids pulling in `clsx` for a 10-line utility.
 */
export function cn(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
