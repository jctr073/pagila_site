export type AvatarTone =
  | "default"
  | "accent"
  | "teal"
  | "violet"
  | "success";

export type AvatarProps = {
  initials?: string;
  name?: string;
  tone?: AvatarTone;
  size?: number;
};

/**
 * Avatar — circular initials badge.
 * Maps to .pa-avatar + data-tone in src/app/_design.css.
 *
 * If `name` is provided and `initials` is not, we derive initials from
 * the first letter of each word (max 2 chars).
 */
export default function Avatar({
  initials,
  name,
  tone = "default",
  size = 28,
}: AvatarProps) {
  const text = initials ?? deriveInitials(name);
  return (
    <span
      className="pa-avatar"
      data-tone={tone === "default" ? "" : tone}
      style={{
        width: size,
        height: size,
        fontSize: size < 24 ? 10 : 11,
      }}
      aria-label={name}
    >
      {text}
    </span>
  );
}

function deriveInitials(name?: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
