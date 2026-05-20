// Dashboard artboard — KPI tiles + sparklines + recent activity.

const DASH_CSS = `
.db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.db-kpi { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.db-kpi .lbl { font-size: 11.5px; color: var(--text-muted); font-weight: 600; letter-spacing: .03em;
  text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.db-kpi .lbl .ico { color: var(--text-soft); }
.db-kpi .val { font-size: 26px; font-weight: 700; letter-spacing: -.02em; line-height: 1.05; }
.db-kpi .val .unit { font-size: 14px; font-weight: 600; color: var(--text-soft); margin-left: 2px; }
.db-kpi .row { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.db-delta { display: inline-flex; align-items: center; gap: 2px; font-size: 11.5px; font-weight: 600;
  font-family: var(--font-mono); }
.db-delta.up { color: var(--success); }
.db-delta.down { color: var(--danger); }

.db-cols { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; }
.db-section-h { display: flex; align-items: center; gap: 8px; padding: 14px 16px 8px; }
.db-section-h h3 { font-size: 13px; font-weight: 600; margin: 0; letter-spacing: -.005em; }
.db-section-h .sub { font-size: 11.5px; color: var(--text-soft); }

.db-tilegrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
.db-tile { padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--border); }
.db-tile:nth-child(odd) { border-right: 1px solid var(--border); }
.db-tile:nth-child(-n+2) { border-top: 0; }
.db-tile .num { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }
.db-tile .lbl { font-size: 11.5px; color: var(--text-muted); }

.db-list { display: flex; flex-direction: column; }
.db-list-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-top: 1px solid var(--border);
  font-size: 12.5px; }
.db-list-item:hover { background: var(--surface-2); }
.db-list-item .ttl { font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-list-item .meta { color: var(--text-soft); font-size: 11.5px; font-family: var(--font-mono); }

.db-feed { display: flex; flex-direction: column; }
.db-feed-item { display: flex; gap: 12px; padding: 10px 16px; border-top: 1px solid var(--border); font-size: 12.5px; }
.db-feed-item .dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); margin-top: 6px; flex-shrink: 0; }
.db-feed-item .dot.teal { background: var(--teal); }
.db-feed-item .dot.success { background: var(--success); }
.db-feed-item .dot.warning { background: var(--warning); }
.db-feed-item .body { flex: 1; min-width: 0; }
.db-feed-item .body b { font-weight: 600; }
.db-feed-item .time { color: var(--text-soft); font-size: 11px; font-family: var(--font-mono); flex-shrink: 0; }

.db-chart { padding: 14px 16px; }
.db-chart .axis { display: flex; justify-content: space-between; padding-top: 6px;
  font-size: 10.5px; color: var(--text-soft); font-family: var(--font-mono); }
.db-bars { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; height: 130px; align-items: end; }
.db-bars .b { background: var(--accent-soft); border: 1px solid var(--accent-soft-border); border-radius: 4px 4px 0 0;
  position: relative; }
.db-bars .b.peak { background: var(--accent); border-color: var(--accent); }
.db-bars .b.future { background: repeating-linear-gradient(45deg, var(--surface-2) 0 4px, transparent 4px 8px); border-style: dashed; }
`;
if (!document.getElementById('pa-dash-css')) {
  const s = document.createElement('style');
  s.id = 'pa-dash-css';
  s.textContent = DASH_CSS;
  document.head.appendChild(s);
}

function Kpi({ label, icon, value, unit, delta, deltaDir, spark, sparkColor }) {
  return (
    <div className="pa-card db-kpi">
      <div className="lbl"><Icon name={icon} size={13} className="ico" /> {label}</div>
      <div className="row">
        <div className="val">{value}{unit && <span className="unit">{unit}</span>}</div>
        {spark && <Sparkline data={spark} color={sparkColor || 'var(--accent)'} width={68} height={28} />}
      </div>
      {delta && (
        <div className={`db-delta ${deltaDir}`}>
          <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDown'} size={11} /> {delta}
          <span style={{ color: 'var(--text-soft)', marginLeft: 4, fontWeight: 500 }}>vs. last 30d</span>
        </div>
      )}
    </div>
  );
}

function DashboardArtboard() {
  const rentalHistory = [42, 48, 51, 49, 55, 58, 62, 65, 71, 68, 74, 79, 82, 88];
  const peakIdx = 13;

  return (
    <Shell active="dashboard" crumb={['Overview', 'Dashboard']}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>Good afternoon, Diego</h1>
          <p>Catalog & inventory across Lethbridge and Woodridge — synced 2 minutes ago.</p>
        </div>
        <div className="actions">
          <Btn size="sm" variant="ghost" leftIcon="clock">Last 30 days</Btn>
          <Btn size="sm" leftIcon="plus" variant="primary">New film</Btn>
        </div>
      </div>

      <div className="pa-page-body">
        <div className="db-grid">
          <Kpi label="Total films" icon="film" value="1,000" delta="+12" deltaDir="up"
               spark={[920, 940, 955, 968, 974, 982, 988, 994, 1000]} />
          <Kpi label="Active rentals" icon="cycle" value="183" delta="+24" deltaDir="up"
               spark={[120, 132, 141, 138, 152, 161, 158, 170, 183]} sparkColor="var(--teal)" />
          <Kpi label="Low-stock films" icon="archive" value="47" delta="-6" deltaDir="down"
               spark={[62, 58, 55, 60, 53, 51, 49, 53, 47]} sparkColor="var(--warning)" />
          <Kpi label="MTD revenue" icon="money" value="14,829" unit=" USD" delta="+8.2%" deltaDir="up"
               spark={[8200, 8900, 9400, 10100, 11300, 12000, 12800, 13900, 14829]} sparkColor="var(--success)" />
        </div>

        <div className="db-cols">
          <div className="pa-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="db-section-h">
              <h3>Rentals — last 14 days</h3>
              <span className="sub">Daily check-outs across both stores</span>
              <div style={{ flex: 1 }} />
              <Chip tone="success" dot>+18% WoW</Chip>
              <Btn size="sm" variant="ghost" rightIcon="chevDown">Daily</Btn>
            </div>
            <div className="db-chart">
              <div className="db-bars">
                {rentalHistory.map((v, i) => (
                  <div key={i} className={`b ${i === peakIdx ? 'peak' : ''}`} style={{ height: `${(v / 90) * 100}%` }} />
                ))}
                <div className="b future" style={{ height: '70%' }} />
                <div className="b future" style={{ height: '65%' }} />
              </div>
              <div className="axis">
                <span>May 3</span><span>May 6</span><span>May 9</span><span>May 12</span><span>May 15</span><span>today</span>
              </div>
            </div>
            <hr className="pa-divider" />
            <div className="db-tilegrid">
              <div className="db-tile">
                <Avatar initials="L" tone="accent" size={32} />
                <div>
                  <div className="num">94<span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500, marginLeft: 3 }}>/day avg</span></div>
                  <div className="lbl">Store #1 · Lethbridge</div>
                </div>
              </div>
              <div className="db-tile">
                <Avatar initials="W" tone="teal" size={32} />
                <div>
                  <div className="num">89<span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500, marginLeft: 3 }}>/day avg</span></div>
                  <div className="lbl">Store #2 · Woodridge</div>
                </div>
              </div>
              <div className="db-tile">
                <div className="num" style={{ color: 'var(--warning)' }}>4.6<span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500, marginLeft: 3 }}>days</span></div>
                <div>
                  <div className="lbl">Avg rental duration</div>
                </div>
              </div>
              <div className="db-tile">
                <div className="num">12</div>
                <div>
                  <div className="lbl">Overdue rentals</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div className="pa-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="db-section-h">
                <h3>Top films this month</h3>
                <div style={{ flex: 1 }} />
                <a className="pa-link" style={{ fontSize: 11.5 }}>See all →</a>
              </div>
              <div className="db-list">
                {[
                  { id: 1,  t: 'Academy Dinosaur',     c: 'Documentary', n: 47 },
                  { id: 6,  t: 'Agent Truman',         c: 'Foreign',     n: 39 },
                  { id: 14, t: 'Alice Fantasia',       c: 'Classics',    n: 35 },
                  { id: 7,  t: 'Airplane Sierra',      c: 'Comedy',      n: 31 },
                  { id: 20, t: 'Amelie Hellfighters',  c: 'Music',       n: 28 },
                ].map((x, i) => (
                  <div key={x.id} className="db-list-item">
                    <span className="mono" style={{ color: 'var(--text-soft)', width: 18 }}>{i + 1}</span>
                    <span className="ttl">{x.t}</span>
                    <CategoryChip value={x.c} />
                    <span className="meta">{x.n}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pa-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="db-section-h">
                <h3>Recent activity</h3>
                <div style={{ flex: 1 }} />
                <Chip dot tone="teal">Live</Chip>
              </div>
              <div className="db-feed">
                <div className="db-feed-item">
                  <span className="dot success" />
                  <div className="body">
                    <b>Riya P.</b> added 4 new inventory units of <b>Agent Truman</b>
                  </div>
                  <span className="time">2m</span>
                </div>
                <div className="db-feed-item">
                  <span className="dot" />
                  <div className="body">
                    <b>Diego A.</b> updated rate for <b>Alabama Devil</b> ($2.99 → $4.99)
                  </div>
                  <span className="time">14m</span>
                </div>
                <div className="db-feed-item">
                  <span className="dot teal" />
                  <div className="body">
                    Bulk-archived <b>3 films</b> in Family
                  </div>
                  <span className="time">1h</span>
                </div>
                <div className="db-feed-item">
                  <span className="dot warning" />
                  <div className="body">
                    Low-stock alert · <b>Academy Dinosaur</b> at Store #2 (1 unit)
                  </div>
                  <span className="time">3h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { DashboardArtboard });
