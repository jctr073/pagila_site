// Pagila admin shell: sidebar + topbar used by every artboard.

const SHELL_CSS = `
.pa-shell { display: grid; grid-template-columns: var(--sidebar-w) 1fr; height: 100%; background: var(--bg);
  color: var(--text); overflow: hidden; border-radius: inherit; }

.pa-sidebar { background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column;
  padding: 14px 10px 12px; gap: 18px; }
.pa-brand { display: flex; align-items: center; gap: 9px; padding: 0 6px; }
.pa-brand-logo { width: 28px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, var(--accent) 0%, oklch(0.7 0.14 60) 100%);
  display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px;
  box-shadow: 0 2px 6px -1px var(--accent-soft-border); }
.pa-brand-name { font-weight: 700; font-size: 14px; letter-spacing: -0.01em; }
.pa-brand-sub { font-size: 10.5px; color: var(--text-soft); font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }

.pa-storepick { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px;
  background: var(--surface-2); border: 1px solid var(--border); margin: 0 2px; cursor: pointer; }
.pa-storepick:hover { border-color: var(--border-strong); }
.pa-storepick .lbl { flex: 1; min-width: 0; }
.pa-storepick .lbl b { display: block; font-size: 12.5px; font-weight: 600; letter-spacing: -.005em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pa-storepick .lbl span { display: block; font-size: 10.5px; color: var(--text-soft); font-weight: 500; }

.pa-navsect { display: flex; flex-direction: column; gap: 1px; }
.pa-navsect-h { font-size: 10px; font-weight: 700; letter-spacing: .08em; color: var(--text-soft);
  text-transform: uppercase; padding: 6px 10px 4px; }
.pa-navitem { display: flex; align-items: center; gap: 9px; padding: 6px 10px; border-radius: 7px;
  font-size: 12.5px; font-weight: 500; color: var(--text-muted); cursor: pointer; line-height: 1.2;
  transition: background .1s, color .1s; }
.pa-navitem:hover { background: var(--surface-2); color: var(--text); }
.pa-navitem[data-active="1"] { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
.pa-navitem .count { margin-left: auto; font-size: 10.5px; color: var(--text-soft); font-family: var(--font-mono);
  font-weight: 500; }
.pa-navitem[data-active="1"] .count { color: var(--accent); }
.pa-navitem .badge { margin-left: auto; background: var(--accent); color: #fff; border-radius: 999px;
  font-size: 9.5px; font-weight: 700; padding: 1px 6px; font-family: var(--font-mono); }

.pa-side-foot { margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border); display: flex;
  flex-direction: column; gap: 2px; }

.pa-main { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--bg); }
.pa-topbar { display: flex; align-items: center; height: var(--header-h); padding: 0 18px; gap: 12px;
  border-bottom: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
.pa-crumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.pa-crumb b { color: var(--text); font-weight: 600; }
.pa-crumb svg { color: var(--text-soft); }

.pa-page { flex: 1; min-height: 0; overflow: auto; padding: 0; display: flex; flex-direction: column; }
.pa-page-h { padding: 18px 22px 14px; display: flex; align-items: flex-end; gap: 16px; }
.pa-page-h .ttl { flex: 1; min-width: 0; }
.pa-page-h h1 { font-size: 22px; line-height: 1.2; font-weight: 700; letter-spacing: -.018em; margin: 0; }
.pa-page-h p { color: var(--text-muted); margin: 4px 0 0; font-size: 13px; }
.pa-page-h .actions { display: flex; align-items: center; gap: 8px; }
.pa-page-body { padding: 0 22px 24px; display: flex; flex-direction: column; gap: 16px; min-height: 0; }
`;
if (!document.getElementById('pa-shell-css')) {
  const s = document.createElement('style');
  s.id = 'pa-shell-css';
  s.textContent = SHELL_CSS;
  document.head.appendChild(s);
}

function Sidebar({ active, store = 1, badges = {} }) {
  const s = window.PA.STORES.find(s => s.id === store) || window.PA.STORES[0];
  return (
    <aside className="pa-sidebar">
      <div className="pa-brand">
        <div className="pa-brand-logo">P</div>
        <div>
          <div className="pa-brand-name">Pagila</div>
          <div className="pa-brand-sub">Catalog admin</div>
        </div>
      </div>

      <div className="pa-storepick" title="Switch store">
        <Avatar initials={`#${s.id}`} tone="accent" size={26} />
        <div className="lbl">
          <b>Store #{s.id}</b>
          <span>{s.city}, {s.country}</span>
        </div>
        <Icon name="chevUpDown" size={14} />
      </div>

      <div className="pa-navsect">
        <div className="pa-navitem" data-active={active === 'dashboard' ? '1' : ''}>
          <Icon name="home" size={15} /> Dashboard
        </div>
        <div className="pa-navitem" data-active={active === 'films' ? '1' : ''}>
          <Icon name="film" size={15} /> Films <span className="count">1,000</span>
        </div>
        <div className="pa-navitem" data-active={active === 'actors' ? '1' : ''}>
          <Icon name="users" size={15} /> Actors <span className="count">200</span>
        </div>
        <div className="pa-navitem" data-active={active === 'categories' ? '1' : ''}>
          <Icon name="tag" size={15} /> Categories <span className="count">16</span>
        </div>
        <div className="pa-navitem" data-active={active === 'inventory' ? '1' : ''}>
          <Icon name="archive" size={15} /> Inventory <span className="count">4,581</span>
        </div>
      </div>

      <div className="pa-navsect">
        <div className="pa-navsect-h">Operations</div>
        <div className="pa-navitem" data-active={active === 'stores' ? '1' : ''}>
          <Icon name="store" size={15} /> Stores & Staff
        </div>
        <div className="pa-navitem" data-active={active === 'rentals' ? '1' : ''}>
          <Icon name="cycle" size={15} /> Rentals
          {badges.rentals && <span className="badge">{badges.rentals}</span>}
        </div>
        <div className="pa-navitem" data-active={active === 'customers' ? '1' : ''}>
          <Icon name="users" size={15} /> Customers <span className="count">599</span>
        </div>
      </div>

      <div className="pa-side-foot">
        <div className="pa-navitem"><Icon name="settings" size={15} /> Settings</div>
        <div className="pa-navitem"><Icon name="info" size={15} /> Help & shortcuts</div>
      </div>
    </aside>
  );
}

function Topbar({ crumb = ['Catalog', 'Films'], right }) {
  return (
    <div className="pa-topbar">
      <div className="pa-crumb">
        {crumb.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevRight" size={12} />}
            {i === crumb.length - 1 ? <b>{c}</b> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <Input leftIcon="search" placeholder="Search films, actors, customers…" kbd="⌘K" size="sm" style={{ width: 280 }} />
      <Btn variant="ghost" size="sm" iconOnly aria-label="Notifications"><Icon name="bell" size={14} /></Btn>
      <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
      <Avatar initials="DA" tone="teal" size={28} />
      {right}
    </div>
  );
}

function Shell({ active, crumb, store, children, badges, topbarRight }) {
  return (
    <div className="pa-shell">
      <Sidebar active={active} store={store} badges={badges} />
      <div className="pa-main">
        <Topbar crumb={crumb} right={topbarRight} />
        <div className="pa-page">{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, Shell });
