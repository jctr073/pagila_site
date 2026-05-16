export type MiniBarsProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
};

/**
 * MiniBars — small SVG bar chart, highlights the trailing bar at full
 * opacity and dims earlier bars to 0.45. Ported verbatim from
 * designs/primitives.jsx#MiniBars.
 */
export default function MiniBars({
  data,
  color = "var(--accent)",
  width = 120,
  height = 36,
}: MiniBarsProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const gap = 2;
  const bw = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {data.map((v, i) => {
        const h = Math.max(1, (v / max) * (height - 2));
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            rx="1.5"
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.45}
          />
        );
      })}
    </svg>
  );
}
