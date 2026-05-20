// Film detail side-drawer + film edit modal artboards.

const DRAWER_CSS = `
.fd-stage { position: relative; height: 100%; }
.fd-stage .scrim { position: absolute; inset: 0; background: rgba(40, 28, 16, 0.42); backdrop-filter: blur(2px);
  z-index: 5; }
.fd-stage .pa-page-h, .fd-stage .pa-page-body, .fd-stage .pa-topbar { filter: blur(0.4px); }

.fd-drawer { position: absolute; right: 0; top: 0; bottom: 0; width: 460px; background: var(--surface);
  border-left: 1px solid var(--border); box-shadow: var(--shadow-lg); z-index: 6; display: flex; flex-direction: column;
  overflow: hidden; }
.fd-hd { display: flex; align-items: center; padding: 12px 16px; gap: 10px; border-bottom: 1px solid var(--border); }
.fd-hd .id { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-soft); }
.fd-hd .nav { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.fd-hd .nav .pa-btn { color: var(--text-muted); }

.fd-hero { padding: 18px 20px 14px; display: flex; gap: 14px; align-items: flex-start; }
.fd-poster-lg { width: 88px; height: 120px; border-radius: 8px; flex-shrink: 0; position: relative; overflow: hidden;
  background: linear-gradient(155deg, var(--accent-soft) 0%, var(--surface-3) 100%);
  border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
  color: var(--accent); font-family: var(--font-mono); font-size: 10px; }
.fd-poster-lg::after { content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,.18) 6px 7px); }
.fd-hero h2 { font-size: 20px; font-weight: 700; letter-spacing: -.02em; margin: 0 0 4px; line-height: 1.15; }
.fd-hero .sub { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fd-hero .sub b { color: var(--text); font-weight: 600; }
.fd-hero .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 4px; }

.fd-body { flex: 1; overflow: auto; padding: 0 20px 20px; display: flex; flex-direction: column; gap: 18px; }
.fd-sec h4 { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--text-soft); margin: 0 0 10px; display: flex; align-items: center; gap: 6px; }
.fd-sec h4 .pill { background: var(--surface-2); color: var(--text-muted); padding: 1px 6px; border-radius: 999px;
  font-size: 10px; font-family: var(--font-mono); letter-spacing: 0; text-transform: none; font-weight: 500; }
.fd-desc { font-size: 13px; line-height: 1.55; color: var(--text); text-wrap: pretty; }

.fd-kvgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; }
.fd-kv .k { font-size: 11px; color: var(--text-soft); font-weight: 500; }
.fd-kv .v { font-size: 13px; font-weight: 600; color: var(--text); margin-top: 2px; }
.fd-kv .v.mono { font-family: var(--font-mono); font-size: 12.5px; font-weight: 500; }

.fd-inv-table { display: grid; grid-template-columns: 1fr auto auto; gap: 0; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.fd-inv-row { display: contents; }
.fd-inv-row > div { padding: 9px 12px; font-size: 12.5px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
.fd-inv-row:first-child > div { border-top: 0; background: var(--surface-2); font-size: 11px; color: var(--text-muted); font-weight: 600;
  letter-spacing: .03em; text-transform: uppercase; }

.fd-actors { display: flex; flex-wrap: wrap; gap: 6px; }
.fd-actor { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px 3px 4px; border-radius: 999px;
  background: var(--surface-2); border: 1px solid var(--border); font-size: 12px; font-weight: 500; }

.fd-foot { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px;
  background: var(--surface-2); }

/* ─── Modal ─── */
.fm-stage { position: relative; height: 100%; }
.fm-stage .scrim { position: absolute; inset: 0; background: rgba(40, 28, 16, 0.55); backdrop-filter: blur(3px); z-index: 5; }

.fm-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 640px; max-height: calc(100% - 60px); background: var(--surface); border-radius: 14px;
  box-shadow: var(--shadow-lg); border: 1px solid var(--border); z-index: 6; display: flex; flex-direction: column;
  overflow: hidden; }
.fm-hd { padding: 16px 20px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.fm-hd h3 { font-size: 16px; margin: 0; font-weight: 700; letter-spacing: -.015em; }
.fm-hd .sub { font-size: 12px; color: var(--text-muted); }

.fm-body { flex: 1; overflow: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 18px; }
.fm-sec { display: flex; flex-direction: column; gap: 10px; }
.fm-sec-h { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--text-soft); }
.fm-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.fm-row.row-3 { grid-template-columns: repeat(3, 1fr); }
.fm-row.row-4 { grid-template-columns: repeat(4, 1fr); }
.fm-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.fm-field label { font-size: 11.5px; font-weight: 500; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.fm-field label .req { color: var(--accent); }
.fm-textarea { width: 100%; min-height: 80px; padding: 9px 11px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface); font: inherit; font-size: 13px; resize: vertical; outline: none; }
.fm-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.fm-select { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border: 1px solid var(--border);
  border-radius: 8px; background: var(--surface); font-size: 13px; }
.fm-select span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fm-multi { padding: 8px; min-height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface);
  display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.fm-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px 2px 8px; border-radius: 999px;
  background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-soft-border); font-size: 11.5px; font-weight: 500; }
.fm-pill .x { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; cursor: pointer; }
.fm-pill .x:hover { background: rgba(255,255,255,.4); }

.fm-checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 12px; padding: 4px 0; }
.fm-checkrow { display: flex; align-items: center; gap: 7px; font-size: 12.5px; cursor: pointer; padding: 4px 0; }

.fm-foot { padding: 12px 18px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px;
  background: var(--surface-2); }
.fm-foot .saved { font-size: 11.5px; color: var(--text-soft); display: flex; align-items: center; gap: 5px; }
`;
if (!document.getElementById('pa-drawer-css')) {
  const s = document.createElement('style');
  s.id = 'pa-drawer-css';
  s.textContent = DRAWER_CSS;
  document.head.appendChild(s);
}

function FilmDetailDrawer({ film }) {
  const f = film;
  return (
    <div className="fd-drawer">
      <div className="fd-hd">
        <span className="id">#{String(f.id).padStart(3, '0')}</span>
        <Chip tone="success" dot>Active</Chip>
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
        <div className="fd-poster-lg">POSTER<br/>88×120</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{f.title}</h2>
          <div className="sub">
            <b>{f.year}</b> · <Rating value={f.rating} /> · <b>{f.length} min</b> · {f.lang}
          </div>
          <div className="tags">
            <CategoryChip value={f.category} />
            {f.features.map(x => <Chip key={x}>{x}</Chip>)}
          </div>
        </div>
      </div>

      <div className="fd-body">
        <div className="fd-sec">
          <h4>Synopsis</h4>
          <p className="fd-desc">{f.desc}</p>
        </div>

        <div className="fd-sec">
          <h4>Catalog details</h4>
          <div className="fd-kvgrid">
            <div className="fd-kv"><div className="k">Rental rate</div><div className="v mono">${f.rate.toFixed(2)} / day</div></div>
            <div className="fd-kv"><div className="k">Replacement cost</div><div className="v mono">${f.replace.toFixed(2)}</div></div>
            <div className="fd-kv"><div className="k">Rental duration</div><div className="v mono">5 days</div></div>
            <div className="fd-kv"><div className="k">Original language</div><div className="v">English</div></div>
            <div className="fd-kv"><div className="k">Last updated</div><div className="v mono">{f.updated}</div></div>
            <div className="fd-kv"><div className="k">Updated by</div><div className="v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar initials="DA" tone="teal" size={20} /> Diego A.</div></div>
          </div>
        </div>

        <div className="fd-sec">
          <h4>Inventory <span className="pill">{f.inventory} units</span></h4>
          <div className="fd-inv-table">
            <div className="fd-inv-row">
              <div>Store</div><div>Units</div><div>Out</div>
            </div>
            <div className="fd-inv-row">
              <div><Avatar initials="#1" tone="accent" size={20} /> Lethbridge</div>
              <div className="mono">{f.stores[0]}</div>
              <div className="mono" style={{ color: 'var(--text-soft)' }}>{Math.max(0, f.stores[0] - 2)}</div>
            </div>
            <div className="fd-inv-row">
              <div><Avatar initials="#2" tone="teal" size={20} /> Woodridge</div>
              <div className="mono">{f.stores[1]}</div>
              <div className="mono" style={{ color: 'var(--text-soft)' }}>{Math.max(0, f.stores[1] - 1)}</div>
            </div>
          </div>
        </div>

        <div className="fd-sec">
          <h4>Cast <span className="pill">{f.actors}</span></h4>
          <div className="fd-actors">
            {window.PA.ACTORS.slice(0, f.actors).map(a => {
              const [first, last] = a.split(' ');
              return (
                <span key={a} className="fd-actor">
                  <Avatar initials={`${first[0]}${last[0]}`} tone="violet" size={20} />
                  {a}
                </span>
              );
            })}
          </div>
        </div>

        <div className="fd-sec">
          <h4>Rental performance</h4>
          <div className="pa-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.01em' }}>47</div>
              <div style={{ fontSize: 11, color: 'var(--text-soft)' }}>rentals · last 30d</div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
            <Sparkline data={window.PA.sparkFor(f.id)} width={120} height={36} />
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <Chip tone="success" dot>+22%</Chip>
              <div style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 3 }}>vs prior 30d</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fd-foot">
        <Btn size="sm" variant="ghost" leftIcon="duplicate">Duplicate</Btn>
        <Btn size="sm" variant="ghost" leftIcon="archive">Archive</Btn>
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="ghost">Close</Btn>
        <Btn size="sm" variant="primary" leftIcon="pencil">Edit film</Btn>
      </div>
    </div>
  );
}

function FilmDrawerArtboard({ film }) {
  const f = film || window.PA.FILMS[0];
  return (
    <div className="fd-stage" style={{ height: '100%' }}>
      <FilmsArtboard focusedFilmId={f.id} />
      <div className="scrim" />
      <FilmDetailDrawer film={f} />
    </div>
  );
}

// ─── Edit modal ───
function FilmEditModal({ film }) {
  const f = film;
  const [features, setFeatures] = React.useState(f.features);
  const FEATURE_OPTIONS = ['Trailers', 'Commentaries', 'Deleted Scenes', 'Behind the Scenes'];
  const toggleFeat = (x) => setFeatures(fs => fs.includes(x) ? fs.filter(y => y !== x) : [...fs, x]);

  return (
    <div className="fm-modal">
      <div className="fm-hd">
        <div>
          <h3>Edit film</h3>
          <span className="sub">#{String(f.id).padStart(3, '0')} · {f.title} · last saved 2 min ago</span>
        </div>
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="ghost" iconOnly><Icon name="x" size={14} /></Btn>
      </div>

      <div className="fm-body">
        <div className="fm-sec">
          <div className="fm-sec-h">Basics</div>
          <div className="fm-field">
            <label>Title <span className="req">*</span></label>
            <Input defaultValue={f.title} />
          </div>
          <div className="fm-field">
            <label>Synopsis</label>
            <textarea className="fm-textarea" defaultValue={f.desc} />
          </div>
          <div className="fm-row row-3">
            <div className="fm-field">
              <label>Category</label>
              <div className="fm-select">
                <CategoryChip value={f.category} />
                <Icon name="chevDown" size={12} style={{ marginLeft: 'auto', color: 'var(--text-soft)' }} />
              </div>
            </div>
            <div className="fm-field">
              <label>Rating</label>
              <div className="fm-select"><Rating value={f.rating} /><span style={{ marginLeft: 6, color: 'var(--text-soft)' }}>Restricted</span><Icon name="chevDown" size={12} style={{ marginLeft: 'auto', color: 'var(--text-soft)' }} /></div>
            </div>
            <div className="fm-field">
              <label>Language</label>
              <div className="fm-select"><span>{f.lang}</span><Icon name="chevDown" size={12} style={{ color: 'var(--text-soft)' }} /></div>
            </div>
          </div>
        </div>

        <div className="fm-sec">
          <div className="fm-sec-h">Pricing & duration</div>
          <div className="fm-row row-4">
            <div className="fm-field">
              <label>Release year</label>
              <Input defaultValue={f.year} />
            </div>
            <div className="fm-field">
              <label>Length</label>
              <Input defaultValue={`${f.length} min`} />
            </div>
            <div className="fm-field">
              <label>Rental rate</label>
              <Input defaultValue={`$${f.rate.toFixed(2)}`} />
            </div>
            <div className="fm-field">
              <label>Replacement</label>
              <Input defaultValue={`$${f.replace.toFixed(2)}`} />
            </div>
          </div>
          <div className="fm-row">
            <div className="fm-field">
              <label>Rental duration</label>
              <Input defaultValue="5 days" />
            </div>
            <div className="fm-field">
              <label>Original language</label>
              <div className="fm-select"><span style={{ color: 'var(--text-soft)' }}>— None —</span><Icon name="chevDown" size={12} style={{ color: 'var(--text-soft)' }} /></div>
            </div>
          </div>
        </div>

        <div className="fm-sec">
          <div className="fm-sec-h">Special features</div>
          <div className="fm-checks">
            {FEATURE_OPTIONS.map(opt => (
              <label key={opt} className="fm-checkrow" onClick={() => toggleFeat(opt)}>
                <Check checked={features.includes(opt)} onChange={() => toggleFeat(opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="fm-sec">
          <div className="fm-sec-h">Cast</div>
          <div className="fm-multi">
            {window.PA.ACTORS.slice(0, f.actors).map(a => {
              const [first, last] = a.split(' ');
              return (
                <span key={a} className="fm-pill">
                  <Avatar initials={`${first[0]}${last[0]}`} tone="violet" size={16} />
                  {a}
                  <span className="x"><Icon name="x" size={10} /></span>
                </span>
              );
            })}
            <button className="pa-btn" data-variant="ghost" data-size="sm" style={{ height: 24 }}>
              <Icon name="plus" size={12} /> Add actor
            </button>
          </div>
        </div>
      </div>

      <div className="fm-foot">
        <span className="saved"><Icon name="check" size={11} style={{ color: 'var(--success)' }} /> Auto-saved 2s ago</span>
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="ghost">Cancel</Btn>
        <Btn size="sm" variant="primary" leftIcon="check">Save changes</Btn>
      </div>
    </div>
  );
}

function FilmEditArtboard({ film }) {
  const f = film || window.PA.FILMS[5];
  return (
    <div className="fm-stage" style={{ height: '100%' }}>
      <FilmsArtboard focusedFilmId={f.id} editingCellId={null} />
      <div className="scrim" />
      <FilmEditModal film={f} />
    </div>
  );
}

Object.assign(window, { FilmDetailDrawer, FilmDrawerArtboard, FilmEditModal, FilmEditArtboard });
