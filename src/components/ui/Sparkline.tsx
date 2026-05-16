export type SparklineProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
  fill?: boolean;
};

/**
 * Sparkline — SVG line+area chart with an end-dot. Pure SVG output, no
 * client hooks. Ported from designs/primitives.jsx#Sparkline.
 *
 * `fill` (alias of the design's local var) renders the soft area under
 * the line; `showDot` toggles the trailing circle.
 */
export default function Sparkline({
  data,
  color = "var(--accent)",
  width = 80,
  height = 22,
  showDot = true,
  fill = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1);

  const pts: [number, number][] = data.map((v, i) => [
    i * stepX,
    height - 2 - ((v - min) / range) * (height - 4),
  ]);

  const line = pts
    .map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `L${x} ${y}`))
    .join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
      )}
    </svg>
  );
}
