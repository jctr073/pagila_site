// Stores list (films-style table) + Store detail drawer.

const STORES_CSS = `
.sl-storecell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sl-storecell .ico { width: 28px; height: 38px; border-radius: 6px; flex-shrink: 0; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  border: 1px solid var(--border); }
.sl-storecell .ico::after { content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0 4px, rgba(0,0,0,.05) 4px 5px); }
.sl-storecell .body { min-width: 0; }
.sl-storecell .body .ttl { font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -.005em; display: flex; align-items: center; gap: 6px; }
.sl-storecell .body .ttl .flag { font-family: var(--font-mono); font-size: 9.5px; padding: 1px 5px; border-radius: 3px;
  background: var(--surface-3); color: var(--text-soft); font-weight: 600; letter-spacing: .04em; }
.sl-storecell .body .meta { font-size: 11px; color: var(--text-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sl-mgrcell { display: flex; align-items: center; gap: 7px; min-width: 0; }
.sl-mgrcell .nm { font-size: 12.5px; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; }

.sl-statusdot { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; }
.sl-statusdot .d { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }

/* ── Drawer-specific ───────────────────────────────────────────────────── */
.sd-store-ico { width: 88px; height: 88px; border-radius: 14px; flex-shrink: 0; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  border: 1px solid var(--border); }
.sd-store-ico::after { content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0 7px, rgba(255,255,255,.16) 7px 8px); pointer-events: none; }
.sd-store-ico svg { position: relative; z-index: 1; }

.sd-mgrcard { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px dashed var(--border-strong);
  border-radius: 10px; background: var(--surface-2); }
.sd-mgrcard .body { flex: 1; min-width: 0; }
.sd-mgrcard .body b { display: block; font-size: 13px; font-weight: 600; }
.sd-mgrcard .body span { font-size: 11.5px; color: var(--text-soft); }
.sd-mgrcard .body .meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-soft); margin-top: 2px; }

.sd-staffchips { display: flex; flex-wrap: wrap; gap: 6px; }
.sd-staffchip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px 3px 4px; border-radius: 999px;
  background: var(--surface-2); border: 1px solid var(--border); font-size: 12px; font-weight: 500; }
.sd-staffchip small { font-family: var(--font-mono); font-size: 10px; color: var(--text-soft); }

.sd-custtable { width: 100%; border-collapse: collapse; font-size: 12px; }
.sd-custtable thead th { text-align: left; font-weight: 600; color: var(--text-soft); font-size: 10px;
  letter-spacing: .04em; text-transform: uppercase; padding: 8px 10px; border-bottom: 1px solid var(--border);
  background: var(--surface-2); }
.sd-custtable thead th:first-child { border-top-left-radius: 10px; }
.sd-custtable thead th:last-child { border-top-right-radius: 10px; }
.sd-custtable tbody td { padding: 9px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.sd-custtable tbody tr:last-child td { border-bottom: 0; }
.sd-custtable tbody tr:hover { background: var(--surface-2); }
.sd-custtable .nm-cell { display: flex; align-items: center; gap: 8px; min-width: 0; }
.sd-custtable .nm-cell .nm { font-weight: 500; color: var(--text); }
.sd-custtable .nm-cell .em { font-family: var(--font-mono); font-size: 10px; color: var(--text-soft); }
.sd-custwrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.sd-custfoot { padding: 7px 12px; border-top: 1px solid var(--border); display: flex; align-items: center;
  background: var(--surface-2); font-size: 11.5px; color: var(--text-soft); }
.sd-custfoot a { color: var(--accent); font-weight: 500; text-decoration: none; cursor: pointer; }
.sd-custfoot a:hover { text-decoration: underline; }
`;
if (!document.getElementById('pa-stores-css')) {
  const s = document.createElement('style');
  s.id = 'pa-stores-css';
  s.textContent = STORES_CSS;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// Small icon used on the store square.
function StoreGlyph({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-5h16l1 5M5 9v11h14V9M9 13h6" />
    </svg>
  );
}

// ─── List ───────────────────────────────────────────────────────────────────
function StoresListScreen({ tableStyle = 'lined', preselected, focusedStoreId, hideToolbar, sort: sortProp }) {
  const stores = window.PA.STORES;
  const staff = window.PA.STAFF;
  const [selected, setSelected] = React.useState(new Set(preselected || []));
  const [sort, setSort] = React.useState(sortProp || { key: 'id', dir: 'asc' });

  const rows = React.useMemo(() => {
    const list = stores.slice();
    list.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [sort, stores]);

  const allChecked = selected.size > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && selected.size < rows.length;
  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(rows.map(s => s.id)));
  const onSort = (k) => setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' });

  return (
    <div className={`fl-style-${tableStyle}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hideToolbar && (
        <div className="fl-toolbar">
          <Input leftIcon="search" placeholder="Search stores, cities, managers…" size="sm" style={{ width: 260 }} />
          <Btn size="sm" leftIcon="filter">Country</Btn>
          <Btn size="sm" leftIcon="filter">Status</Btn>
          <Btn size="sm" leftIcon="plus" variant="ghost">More filters</Btn>
          <div className="sep" />
          <Btn size="sm" leftIcon="sort">Sort: ID asc</Btn>
          <div style={{ flex: 1 }} />
          <Btn size="sm" leftIcon="download" variant="ghost">Export</Btn>
          <Btn size="sm" leftIcon="plus" variant="primary">New store</Btn>
        </div>
      )}

      {selected.size > 0 && (
        <div className="fl-bulkbar">
          <Check checked={true} onChange={() => setSelected(new Set())} />
          <b style={{ fontWeight: 600 }}>{selected.size} store{selected.size > 1 ? 's' : ''} selected</b>
          <div className="sep" style={{ background: 'rgba(255,255,255,.25)', width: 1, height: 18 }} />
          <Btn size="sm" leftIcon="users">Reassign manager</Btn>
          <Btn size="sm" leftIcon="archive">Pause</Btn>
          <Btn size="sm" leftIcon="duplicate">Duplicate</Btn>
          <div style={{ flex: 1 }} />
          <Btn size="sm" variant="danger-ghost" leftIcon="trash">Delete</Btn>
        </div>
      )}

      <div className="fl-tablewrap">
        <table className="fl-table">
          <thead>
            <tr>
              <th style={{ width: 36, paddingRight: 0 }}>
                <Check checked={allChecked} mixed={someChecked} onChange={toggleAll} />
              </th>
              <th style={{ width: 54 }}><ColHead label="ID"        sortKey="id"        sort={sort} onSort={onSort} /></th>
              <th><ColHead label="Location" sortKey="city" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 200 }}><ColHead label="Address"   sortKey="address"   sort={sort} onSort={onSort} /></th>
              <th style={{ width: 170 }}><ColHead label="Manager"   sortKey="id"        sort={null} /></th>
              <th style={{ width: 95 }}><ColHead label="Inventory" sortKey="inventory" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 80 }}><ColHead label="Customers" sortKey="customers" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 60 }}><ColHead label="Staff"     sortKey="staff"     sort={sort} onSort={onSort} /></th>
              <th style={{ width: 90 }}>Status</th>
              <th style={{ width: 110 }}>Last sync</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const mgr = staff.find(p => p.store === s.id && p.role === 'Manager') || staff[0];
              const isSel = selected.has(s.id);
              const isFocus = focusedStoreId === s.id;
              const lastSync = ['just now', '2 min ago', '5 min ago', '12 min ago', '1 h ago', '24 min ago', '6 min ago'][i % 7];
              const open = s.id !== 13;
              return (
                <tr key={s.id} data-selected={isSel ? '1' : ''}
                    style={isFocus ? { background: 'var(--accent-soft)' } : null}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Check checked={isSel} onChange={() => toggle(s.id)} />
                  </td>
                  <td><span className="fl-id mono">#{String(s.id).padStart(3, '0')}</span></td>
                  <td>
                    <div className="sl-storecell">
                      <div className="ico" style={{
                        background: `oklch(from ${s.accent} 0.94 calc(c * 0.4) h)`,
                        color: s.accent,
                      }}>
                        <span style={{ position: 'relative', zIndex: 1 }}>#{s.id}</span>
                      </div>
                      <div className="body">
                        <div className="ttl">{s.city} <span className="flag">{s.country_code}</span></div>
                        <div className="meta">{s.country} · {s.district}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.address}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-soft)' }}>{s.postal}</div>
                  </td>
                  <td>
                    <div className="sl-mgrcell">
                      <Avatar initials={mgr.avatar} tone={mgr.tone} size={24} />
                      <span className="nm">{mgr.name}</span>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontWeight: 500 }}>{s.inventory.toLocaleString()}</span></td>
                  <td><span className="mono" style={{ color: 'var(--text-muted)' }}>{s.customers}</span></td>
                  <td><span className="mono">{s.staff}</span></td>
                  <td>
                    {open
                      ? <Chip tone="success" dot>Open</Chip>
                      : <Chip tone="warning" dot>Setup</Chip>}
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-soft)', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className="d" style={{ width: 6, height: 6, borderRadius: 999, background: open ? 'var(--success)' : 'var(--warning)' }} />
                      {lastSync}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Btn size="sm" variant="ghost" iconOnly><Icon name="more" size={14} /></Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="fl-foot">
        <span><b style={{ color: 'var(--text)' }}>1–{rows.length}</b> of <b style={{ color: 'var(--text)' }}>{rows.length}</b> stores</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-soft)' }}>Rows per page:</span>
        <Btn size="sm" variant="ghost" rightIcon="chevDown">25</Btn>
        <div className="pager">
          <button className="fl-pgbtn"><Icon name="chevLeft" size={12} /></button>
          <button className="fl-pgbtn" data-active="1">1</button>
          <button className="fl-pgbtn"><Icon name="chevRight" size={12} /></button>
        </div>
      </div>
    </div>
  );
}

function StoresArtboard({ tableStyle, preselected, focusedStoreId }) {
  const totalStaff = window.PA.STAFF.length;
  const totalCustomers = window.PA.STORES.reduce((a, s) => a + s.customers, 0);
  return (
    <Shell active="stores" crumb={['Operations', 'Stores & Staff']}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>Stores & Staff</h1>
          <p>{window.PA.STORES.length} stores · {totalStaff} staff members · {totalCustomers.toLocaleString()} customers · synced live</p>
        </div>
        <div className="actions">
          <Btn size="sm" variant="ghost" leftIcon="upload">Import CSV</Btn>
          <Btn size="sm" leftIcon="grid" variant="ghost" />
          <Btn size="sm" leftIcon="list" />
        </div>
      </div>
      <div className="pa-page-body">
        <StoresListScreen tableStyle={tableStyle} preselected={preselected} focusedStoreId={focusedStoreId} />
      </div>
    </Shell>
  );
}

// ─── Drawer ─────────────────────────────────────────────────────────────────
function StoreDetailDrawer({ store }) {
  const s = store;
  const staff = window.PA.STAFF;
  const mgr = staff.find(p => p.store === s.id && p.role === 'Manager') || staff[0];
  const clerks = staff.filter(p => p.store === s.id && p.role !== 'Manager');
  const customers = window.PA.CUSTOMERS.filter(c => c.store === s.id);
  const visibleCustomers = customers.slice(0, 6);
  const open = s.id !== 13;

  return (
    <div className="fd-drawer">
      <div className="fd-hd">
        <span className="id">#{String(s.id).padStart(3, '0')}</span>
        {open
          ? <Chip tone="success" dot>Open</Chip>
          : <Chip tone="warning" dot>Setup</Chip>}
        <div className="nav">
          <Btn size="sm" variant="ghost" iconOnly aria-label="Prev"><Icon name="chevLeft" size={14} /></Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="Next"><Icon name="chevRight" size={14} /></Btn>
          <div style={{ width: 8 }} />
          <Btn size="sm" variant="ghost" iconOnly><Icon name="eye" size={14} /></Btn>
          <Btn size="sm" variant="ghost" iconOnly><Icon name="more" size={14} /></Btn>
          <Btn size="sm" variant="ghost" iconOnly><Icon name="x" size={14} /></Btn>
        </div>
      </div>

      <div className="fd-hero">
        <div className="sd-store-ico" style={{
          background: `linear-gradient(155deg, oklch(from ${s.accent} 0.94 calc(c * 0.45) h) 0%, oklch(from ${s.accent} 0.88 calc(c * 0.25) h) 100%)`,
          color: s.accent,
        }}>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', lineHeight: 1.1 }}>
            <StoreGlyph size={26} />
            <div style={{ marginTop: 4, fontSize: 11 }}>#{String(s.id).padStart(2, '0')}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{s.city}, {s.country}</h2>
          <div className="sub">
            <b>Store #{s.id}</b> · {s.country_code} · opened <b>{s.opened.slice(0, 4)}</b>
          </div>
          <div className="tags">
            <Chip tone={s.tone}>{s.district}</Chip>
            <Chip>{customers.length}+ customers</Chip>
            <Chip>{s.staff} staff</Chip>
          </div>
        </div>
      </div>

      <div className="fd-body">
        <div className="fd-sec">
          <h4>Address</h4>
          <p className="fd-desc" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.6 }}>
            {s.address}{s.address2 ? `, ${s.address2}` : ''}<br/>
            {s.city}, {s.district} {s.postal}<br/>
            {s.country}
          </p>
        </div>

        <div className="fd-sec">
          <h4>Store details</h4>
          <div className="fd-kvgrid">
            <div className="fd-kv"><div className="k">Phone</div><div className="v mono">{s.phone}</div></div>
            <div className="fd-kv"><div className="k">Time zone</div><div className="v" style={{ fontSize: 12 }}>{s.tz}</div></div>
            <div className="fd-kv"><div className="k">Hours</div><div className="v mono" style={{ fontSize: 11.5 }}>{s.openings}</div></div>
            <div className="fd-kv"><div className="k">Postal code</div><div className="v mono">{s.postal}</div></div>
            <div className="fd-kv"><div className="k">Opened</div><div className="v mono">{s.opened}</div></div>
            <div className="fd-kv"><div className="k">Last sync</div>
              <div className="v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: open ? 'var(--success)' : 'var(--warning)' }} />
                {open ? '2 min ago' : 'never'}
              </div>
            </div>
          </div>
        </div>

        <div className="fd-sec">
          <h4>Store manager</h4>
          <div className="sd-mgrcard">
            <Avatar initials={mgr.avatar} tone={mgr.tone} size={44} />
            <div className="body">
              <b>{mgr.name}</b>
              <span>Store manager · since {mgr.started}</span>
              <div className="meta">@{mgr.username} · {mgr.email}</div>
            </div>
            <Btn size="sm" variant="ghost" iconOnly><Icon name="more" size={14} /></Btn>
          </div>
        </div>

        {clerks.length > 0 && (
          <div className="fd-sec">
            <h4>Staff <span className="pill">{clerks.length + 1} total</span></h4>
            <div className="sd-staffchips">
              {clerks.map(p => (
                <span key={p.id} className="sd-staffchip">
                  <Avatar initials={p.avatar} tone={p.tone} size={20} />
                  {p.name}
                  <small>· {p.role}</small>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="fd-sec">
          <h4>Customers <span className="pill">{s.customers} total</span></h4>
          <div className="sd-custwrap">
            <table className="sd-custtable">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th style={{ width: 70 }}>Rentals</th>
                  <th style={{ width: 80 }}>Last</th>
                  <th style={{ width: 64 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="nm-cell">
                        <Avatar initials={c.avatar} tone={c.tone} size={24} />
                        <div style={{ minWidth: 0 }}>
                          <div className="nm">{c.name}</div>
                          <div className="em">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="mono" style={{ fontSize: 11.5 }}>{c.rentals}</span></td>
                    <td><span style={{ color: 'var(--text-soft)', fontSize: 11 }}>{c.lastRented}</span></td>
                    <td>
                      {c.active
                        ? <Chip tone="success" dot>Active</Chip>
                        : <Chip tone="">Off</Chip>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sd-custfoot">
              Showing {visibleCustomers.length} of {s.customers}
              <div style={{ flex: 1 }} />
              <a>View all customers <Icon name="arrowRight" size={11} /></a>
            </div>
          </div>
        </div>

        <div className="fd-sec">
          <h4>Rental activity</h4>
          <div className="pa-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em' }}>{s.rentals}</div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>rentals · last 7d</div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
            <Sparkline data={window.PA.sparkFor(s.id * 7)} width={120} height={36} color="var(--accent)" />
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <Chip tone="success" dot>+{8 + s.id}%</Chip>
              <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 3 }}>vs prior 7d</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fd-foot">
        <Btn size="sm" variant="ghost" leftIcon="duplicate">Duplicate</Btn>
        <Btn size="sm" variant="ghost" leftIcon="archive">Archive</Btn>
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="ghost">Close</Btn>
        <Btn size="sm" variant="primary" leftIcon="pencil">Edit store</Btn>
      </div>
    </div>
  );
}

function StoreDrawerArtboard({ store }) {
  const s = store || window.PA.STORES.find(x => x.id === 4) || window.PA.STORES[0];
  return (
    <div className="fd-stage" style={{ height: '100%' }}>
      <StoresArtboard focusedStoreId={s.id} />
      <div className="scrim" />
      <StoreDetailDrawer store={s} />
    </div>
  );
}

Object.assign(window, { StoresListScreen, StoresArtboard, StoreDetailDrawer, StoreDrawerArtboard });
