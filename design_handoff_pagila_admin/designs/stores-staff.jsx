// Stores & staff artboard — two store cards + staff table.

const STORES_CSS = `
.st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.st-card { padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden; }
.st-card .ribbon { position: absolute; top: -2px; left: 20px; width: 56px; height: 8px; border-radius: 0 0 4px 4px; }
.st-head { display: flex; align-items: flex-start; gap: 14px; }
.st-head .avatar { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; flex-shrink: 0; }
.st-head .id { font-family: var(--font-mono); font-size: 11px; color: var(--text-soft); font-weight: 500; }
.st-head h3 { font-size: 18px; font-weight: 700; letter-spacing: -.015em; margin: 1px 0 0; }
.st-head .addr { font-size: 12.5px; color: var(--text-muted); margin-top: 3px; }

.st-statgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.st-stat { padding: 12px 14px; }
.st-stat + .st-stat { border-left: 1px solid var(--border); }
.st-stat .lbl { font-size: 10.5px; color: var(--text-soft); font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.st-stat .v { font-size: 20px; font-weight: 700; letter-spacing: -.015em; margin-top: 2px; display: flex; align-items: baseline; gap: 4px; }
.st-stat .v small { font-size: 11px; color: var(--text-soft); font-weight: 500; }

.st-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--border); font-size: 12.5px; }
.st-row:first-of-type { border-top: 0; }
.st-row .k { color: var(--text-soft); width: 92px; font-size: 11.5px; flex-shrink: 0; }
.st-row .v { flex: 1; min-width: 0; font-weight: 500; }

.st-mgr { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px dashed var(--border-strong);
  border-radius: 10px; background: var(--surface-2); }
.st-mgr .body { flex: 1; min-width: 0; }
.st-mgr .body b { display: block; font-size: 13px; font-weight: 600; }
.st-mgr .body span { font-size: 11.5px; color: var(--text-soft); }

.st-stafftable .fl-titlecell .meta { font-family: var(--font-mono); font-size: 10.5px; }
`;
if (!document.getElementById('pa-stores-css')) {
  const s = document.createElement('style');
  s.id = 'pa-stores-css';
  s.textContent = STORES_CSS;
  document.head.appendChild(s);
}

function StoreCard({ store, accent, staff }) {
  const s = store;
  const mgr = staff.find(x => x.id === (s.id === 1 ? 1 : 2));
  return (
    <div className="pa-card st-card">
      <div className="ribbon" style={{ background: accent }} />
      <div className="st-head">
        <div className="avatar" style={{ background: `oklch(from ${accent} 0.94 calc(c * 0.4) h)`, color: accent }}>#{s.id}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="id">STORE #{s.id}</div>
          <h3>{s.city}, {s.country}</h3>
          <div className="addr">{s.address}</div>
        </div>
        <Chip tone="success" dot>Open</Chip>
      </div>

      <div className="st-statgrid">
        <div className="st-stat">
          <div className="lbl">Inventory</div>
          <div className="v">{s.inventory.toLocaleString()}<small>units</small></div>
        </div>
        <div className="st-stat">
          <div className="lbl">Active rentals</div>
          <div className="v">{s.id === 1 ? 94 : 89}</div>
        </div>
        <div className="st-stat">
          <div className="lbl">Staff</div>
          <div className="v">{s.staff}<small>active</small></div>
        </div>
      </div>

      <div>
        <div className="st-row">
          <span className="k">Hours</span>
          <span className="v mono">{s.openings}</span>
          <Btn size="sm" variant="ghost" iconOnly><Icon name="pencil" size={12} /></Btn>
        </div>
        <div className="st-row">
          <span className="k">Time zone</span>
          <span className="v">{s.country === 'Canada' ? 'America/Edmonton (MDT)' : 'Australia/Brisbane (AEST)'}</span>
        </div>
        <div className="st-row">
          <span className="k">Phone</span>
          <span className="v mono">{s.country === 'Canada' ? '+1 (403) 555-0142' : '+61 (7) 5555 0214'}</span>
        </div>
        <div className="st-row">
          <span className="k">Last sync</span>
          <span className="v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dot" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--success)' }} /> 2 min ago
          </span>
        </div>
      </div>

      <div className="st-mgr">
        <Avatar initials={mgr.avatar} tone="accent" size={36} />
        <div className="body">
          <b>{mgr.name}</b>
          <span>Store manager · {mgr.email}</span>
        </div>
        <Btn size="sm" variant="ghost" rightIcon="arrowRight">View</Btn>
      </div>
    </div>
  );
}

function StoresStaffArtboard() {
  const stores = window.PA.STORES;
  const staff = window.PA.STAFF;
  const [selected, setSelected] = React.useState(new Set());
  const [tab, setTab] = React.useState('staff');

  return (
    <Shell active="stores" crumb={['Operations', 'Stores & Staff']}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>Stores & Staff</h1>
          <p>2 stores · 7 staff members · synced live across both locations</p>
        </div>
        <div className="actions">
          <Btn size="sm" leftIcon="upload" variant="ghost">Export staff</Btn>
          <Btn size="sm" leftIcon="plus" variant="primary">Add staff member</Btn>
        </div>
      </div>

      <div className="pa-page-body">
        <div className="st-grid">
          <StoreCard store={stores[0]} accent="oklch(0.66 0.16 38)" staff={staff} />
          <StoreCard store={stores[1]} accent="oklch(0.62 0.085 200)" staff={staff} />
        </div>

        <div className="pa-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 4 }}>
            <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: 'var(--surface-2)' }}>
              {['staff', 'shifts', 'permissions'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ border: 0, padding: '5px 11px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    background: tab === t ? 'var(--surface)' : 'transparent',
                    color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                    boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                    textTransform: 'capitalize', fontFamily: 'inherit' }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <Input leftIcon="search" placeholder="Search staff…" size="sm" style={{ width: 200 }} />
            <Btn size="sm" leftIcon="filter">Store: All</Btn>
            <Btn size="sm" leftIcon="filter">Role: All</Btn>
          </div>

          <div className="st-stafftable fl-style-lined">
            <table className="fl-table">
              <thead>
                <tr>
                  <th style={{ width: 36, paddingRight: 0 }}><Check checked={false} onChange={() => {}} /></th>
                  <th>Member</th>
                  <th style={{ width: 100 }}>Store</th>
                  <th style={{ width: 100 }}>Role</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th style={{ width: 110 }}>Started</th>
                  <th style={{ width: 80 }}>Rentals MTD</th>
                  <th style={{ width: 110 }}>Last active</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((p, i) => {
                  const tone = i % 4 === 0 ? 'accent' : i % 4 === 1 ? 'teal' : i % 4 === 2 ? 'violet' : 'success';
                  const lastActive = p.active ? ['just now', '4m ago', '18m ago', '42m ago', '1h ago', '2h ago', 'today'][i] : '3d ago';
                  return (
                    <tr key={p.id} data-selected={selected.has(p.id) ? '1' : ''}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <Check checked={selected.has(p.id)} onChange={() => {
                          const n = new Set(selected); n.has(p.id) ? n.delete(p.id) : n.add(p.id); setSelected(n);
                        }} />
                      </td>
                      <td>
                        <div className="fl-titlecell">
                          <Avatar initials={p.avatar} tone={tone} size={30} />
                          <div style={{ minWidth: 0 }}>
                            <div className="ttl">{p.name}</div>
                            <div className="meta">@{p.username} · {p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Chip tone={p.store === 1 ? 'solid' : 'teal'} dot>#{p.store} · {p.store === 1 ? 'Lethbridge' : 'Woodridge'}</Chip>
                      </td>
                      <td>
                        <Chip tone={p.role === 'Manager' ? 'violet' : ''}>{p.role}</Chip>
                      </td>
                      <td>
                        {p.active ? <Chip tone="success" dot>Active</Chip> : <Chip tone="danger" dot>Disabled</Chip>}
                      </td>
                      <td><span className="mono" style={{ color: 'var(--text-soft)', fontSize: 11.5 }}>{p.started}</span></td>
                      <td><span className="mono">{p.active ? [124, 98, 73, 65, 51, 0, 21][i] : 0}</span></td>
                      <td><span style={{ color: 'var(--text-soft)', fontSize: 11.5 }}>{lastActive}</span></td>
                      <td><Btn size="sm" variant="ghost" iconOnly><Icon name="more" size={14} /></Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}

Object.assign(window, { StoresStaffArtboard });
