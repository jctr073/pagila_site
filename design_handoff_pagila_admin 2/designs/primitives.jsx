// Shared UI primitives for the Pagila admin design.

const PRIM_CSS = `
.pa-btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px;
  border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface);
  color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .12s, border-color .12s, box-shadow .12s, color .12s;
  white-space: nowrap; }
.pa-btn:hover { background: var(--surface-2); border-color: var(--border-strong); }
.pa-btn[data-variant="primary"] { background: var(--accent); border-color: var(--accent);
  color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.18); }
.pa-btn[data-variant="primary"]:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
.pa-btn[data-variant="ghost"] { background: transparent; border-color: transparent; color: var(--text-muted); }
.pa-btn[data-variant="ghost"]:hover { background: var(--surface-2); color: var(--text); }
.pa-btn[data-variant="danger-ghost"] { background: transparent; border-color: transparent; color: var(--danger); }
.pa-btn[data-variant="danger-ghost"]:hover { background: var(--danger-soft); }
.pa-btn[data-size="sm"] { height: 26px; padding: 0 9px; font-size: 12px; border-radius: 6px; gap: 5px; }
.pa-btn[data-size="lg"] { height: 38px; padding: 0 16px; font-size: 14px; }
.pa-btn[data-icon-only="1"] { padding: 0; width: 32px; justify-content: center; }
.pa-btn[data-size="sm"][data-icon-only="1"] { width: 26px; }

.pa-input { display: flex; align-items: center; height: 32px; padding: 0 10px; gap: 6px;
  border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface);
  font-size: 13px; color: var(--text); transition: border-color .12s, box-shadow .12s, background .12s; }
.pa-input:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.pa-input input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent;
  font: inherit; color: inherit; padding: 0; }
.pa-input input::placeholder { color: var(--text-soft); }
.pa-input[data-size="sm"] { height: 26px; font-size: 12px; padding: 0 8px; gap: 5px; }

.pa-chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 500; line-height: 1.6; letter-spacing: .01em;
  background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.pa-chip.solid { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft-border); }
.pa-chip.teal { background: var(--teal-soft); color: var(--teal); border-color: transparent; }
.pa-chip.success { background: var(--success-soft); color: var(--success); border-color: transparent; }
.pa-chip.warning { background: var(--warning-soft); color: var(--warning); border-color: transparent; }
.pa-chip.danger { background: var(--danger-soft); color: var(--danger); border-color: transparent; }
.pa-chip.violet { background: var(--violet-soft); color: var(--violet); border-color: transparent; }
.pa-chip .dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }

.pa-rating { display: inline-flex; align-items: center; padding: 1px 7px; border-radius: 4px;
  font-size: 10.5px; font-weight: 600; letter-spacing: .03em; border: 1px solid;
  font-family: var(--font-mono); }

.pa-avatar { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px;
  border-radius: 999px; background: var(--surface-3); color: var(--text); font-size: 11px; font-weight: 600;
  letter-spacing: .02em; flex-shrink: 0; }
.pa-avatar[data-tone="teal"] { background: var(--teal-soft); color: var(--teal); }
.pa-avatar[data-tone="violet"] { background: var(--violet-soft); color: var(--violet); }
.pa-avatar[data-tone="accent"] { background: var(--accent-soft); color: var(--accent); }
.pa-avatar[data-tone="success"] { background: var(--success-soft); color: var(--success); }

.pa-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px;
  padding: 0 4px; border-radius: 4px; background: var(--surface-2); border: 1px solid var(--border);
  border-bottom-width: 2px; font: 500 11px var(--font-mono); color: var(--text-muted); }

.pa-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm); }

.pa-divider { height: 1px; background: var(--border); border: 0; }
.pa-vrule { width: 1px; align-self: stretch; background: var(--border); }

.pa-link { color: var(--accent); text-decoration: none; font-weight: 500; }
.pa-link:hover { text-decoration: underline; }

/* tiny check */
.pa-check { width: 14px; height: 14px; border: 1.5px solid var(--border-strong); border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center; background: var(--surface);
  cursor: pointer; transition: background .1s, border-color .1s; flex-shrink: 0; }
.pa-check:hover { border-color: var(--accent); }
.pa-check[data-on="1"] { background: var(--accent); border-color: var(--accent); }
.pa-check[data-on="1"] svg { color: #fff; }
.pa-check[data-mixed="1"] { background: var(--accent); border-color: var(--accent); }
.pa-check[data-mixed="1"]::after { content: ''; width: 7px; height: 1.5px; background: #fff; border-radius: 1px; }
`;
if (!document.getElementById('pa-primitives')) {
  const s = document.createElement('style');
  s.id = 'pa-primitives';
  s.textContent = PRIM_CSS;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon — minimal hand-picked Lucide-style paths, stroke=1.6
function Icon({ name, size = 14, ...rest }) {
  const paths = {
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    check: 'M5 12l4 4 10-10',
    x: 'M6 6l12 12M18 6 6 18',
    chevDown: 'm6 9 6 6 6-6',
    chevRight: 'm9 6 6 6-6 6',
    chevLeft: 'm15 6-6 6 6 6',
    chevUpDown: 'M8 9l4-4 4 4M8 15l4 4 4-4',
    filter: 'M4 5h16M7 12h10M10 19h4',
    sort: 'M3 6h13M3 12h9M3 18h5M17 8l4-4 4 4M21 4v16M17 16l4 4 4-4',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    pencil: 'M4 20h4l11-11-4-4L4 16v4z',
    trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13',
    upload: 'M12 16V4M6 10l6-6 6 6M4 20h16',
    download: 'M12 4v12M6 14l6 6 6-6M4 20h16',
    settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
    film: 'M4 4h16v16H4zM4 8h16M4 16h16M8 4v16M16 4v16',
    users: 'M16 17a4 4 0 0 0-8 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 17a4 4 0 0 0-3-3.87M19 5a4 4 0 0 1 0 7.75',
    store: 'M3 9l1-5h16l1 5M5 9v11h14V9M9 13h6',
    tag: 'M3 12V3h9l9 9-9 9-9-9ZM7 7h.01',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9ZM10 21a2 2 0 0 0 4 0',
    home: 'M3 12 12 3l9 9M5 10v10h14V10',
    bookmark: 'M5 4v17l7-5 7 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1Z',
    cycle: 'M21 4v6h-6M3 20v-6h6M21 10a9 9 0 0 0-16.1-2M3 14a9 9 0 0 0 16.1 2',
    money: 'M12 5v14M16 9a3 3 0 0 0-3-2h-2a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 1 0 5h-2a3 3 0 0 1-3-2',
    star: 'M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
    sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M5 19l-1.5 1.5M20.5 3.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    more: 'M5 12h.01M12 12h.01M19 12h.01',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    arrowUp: 'M12 19V5M6 11l6-6 6 6',
    arrowDown: 'M12 5v14M6 13l6 6 6-6',
    info: 'M12 8h.01M11 12h1v4h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
    clock: 'M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
    sparkle: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
    duplicate: 'M9 9h10v10H9zM5 5h10v3M5 5v10h3',
    image: 'M4 5h16v14H4zM4 15l5-5 5 5M14 12l3-3 3 3',
    archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
    play: 'M7 4l13 8-13 8z',
  };
  const d = paths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={d} />
    </svg>
  );
}

function Btn({ children, variant, size, iconOnly, leftIcon, rightIcon, ...rest }) {
  return (
    <button className="pa-btn" data-variant={variant || ''} data-size={size || ''} data-icon-only={iconOnly ? '1' : ''} {...rest}>
      {leftIcon && <Icon name={leftIcon} size={size === 'sm' ? 12 : 14} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={size === 'sm' ? 12 : 14} />}
    </button>
  );
}

function Input({ leftIcon, placeholder, size, defaultValue, value, onChange, kbd, rightAddon, style }) {
  return (
    <label className="pa-input" data-size={size || ''} style={style}>
      {leftIcon && <Icon name={leftIcon} size={size === 'sm' ? 12 : 14} style={{ color: 'var(--text-soft)' }} />}
      <input placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange} />
      {kbd && <span className="pa-kbd">{kbd}</span>}
      {rightAddon}
    </label>
  );
}

function Chip({ tone = '', children, dot, style }) {
  return (
    <span className={`pa-chip ${tone}`} style={style}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

const RATING_TONES = {
  'G':     { bg: 'var(--success-soft)', fg: 'var(--success)', bd: 'transparent' },
  'PG':    { bg: 'var(--teal-soft)',    fg: 'var(--teal)',    bd: 'transparent' },
  'PG-13': { bg: 'var(--warning-soft)', fg: 'var(--warning)', bd: 'transparent' },
  'R':     { bg: 'var(--accent-soft)',  fg: 'var(--accent)',  bd: 'var(--accent-soft-border)' },
  'NC-17': { bg: 'var(--danger-soft)',  fg: 'var(--danger)',  bd: 'transparent' },
};
function Rating({ value }) {
  const t = RATING_TONES[value] || RATING_TONES['PG'];
  return <span className="pa-rating" style={{ background: t.bg, color: t.fg, borderColor: t.bd }}>{value}</span>;
}

const CAT_TONES = {
  Action: 'danger', Animation: 'violet', Children: 'teal', Classics: '',
  Comedy: 'warning', Documentary: '', Drama: 'solid', Family: 'success',
  Foreign: 'violet', Games: 'teal', Horror: 'danger', Music: 'solid',
  New: 'success', 'Sci-Fi': 'teal', Sports: 'warning', Travel: 'violet',
};
function CategoryChip({ value }) { return <Chip tone={CAT_TONES[value] || ''}>{value}</Chip>; }

function Avatar({ initials, tone, size = 28 }) {
  return (
    <span className="pa-avatar" data-tone={tone || ''} style={{ width: size, height: size, fontSize: size < 24 ? 10 : 11 }}>
      {initials}
    </span>
  );
}

function Check({ checked, mixed, onChange }) {
  return (
    <span className="pa-check" data-on={checked ? '1' : ''} data-mixed={mixed && !checked ? '1' : ''}
          onClick={() => onChange && onChange(!checked)} role="checkbox" aria-checked={checked}>
      {checked && <Icon name="check" size={10} />}
    </span>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'var(--accent)', width = 80, height = 22, fill = true }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - 2 - ((v - min) / range) * (height - 4)]);
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `L${x} ${y}`)).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  );
}

// ─── BarChart (mini) ────────────────────────────────────────────────────────
function MiniBars({ data, color = 'var(--accent)', width = 120, height = 36 }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data);
  const gap = 2;
  const bw = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const h = Math.max(1, (v / max) * (height - 2));
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx="1.5" fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />;
      })}
    </svg>
  );
}

Object.assign(window, { Icon, Btn, Input, Chip, Rating, CategoryChip, Avatar, Check, Sparkline, MiniBars });
