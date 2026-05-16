// Films list screen — table with sort/filter/bulk-select/inline-edit.

const FILMS_CSS = `
.fl-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fl-toolbar .sep { width: 1px; height: 20px; background: var(--border); margin: 0 2px; }

.fl-bulkbar { display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 10px;
  background: var(--accent); color: #fff; box-shadow: var(--shadow-md); font-size: 12.5px; }
.fl-bulkbar .pa-btn { background: rgba(255,255,255,.15); border-color: rgba(255,255,255,.25); color: #fff; }
.fl-bulkbar .pa-btn:hover { background: rgba(255,255,255,.25); }
.fl-bulkbar .pa-btn[data-variant="danger-ghost"] { background: rgba(255,255,255,.1); color: #fff; }

.fl-tablewrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  overflow: hidden; box-shadow: var(--shadow-sm); }
.fl-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.fl-table thead th { text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px;
  letter-spacing: .04em; text-transform: uppercase; padding: 10px var(--cell-px); border-bottom: 1px solid var(--border);
  background: var(--surface-2); position: sticky; top: 0; z-index: 1; }
.fl-table thead th .colhead { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
.fl-table thead th .colhead:hover { color: var(--text); }
.fl-table thead th .colhead[data-active="1"] { color: var(--text); }
.fl-table tbody td { padding: 0 var(--cell-px); height: var(--row-h); border-bottom: 1px solid var(--border);
  vertical-align: middle; }
.fl-table tbody tr:last-child td { border-bottom: 0; }
.fl-table tbody tr { transition: background .08s; }
.fl-table tbody tr:hover { background: var(--surface-2); }
.fl-table tbody tr[data-selected="1"] { background: var(--accent-soft); }
.fl-table tbody tr[data-selected="1"]:hover { background: oklch(from var(--accent-soft) calc(l - 0.02) c h); }

.fl-style-lined .fl-table tbody td { border-bottom: 1px solid var(--border); }
.fl-style-zebra .fl-table tbody tr:nth-child(even) td { background: var(--surface-2); }
.fl-style-zebra .fl-table tbody td { border-bottom: 0; }
.fl-style-cards .fl-tablewrap { background: transparent; border: 0; box-shadow: none; padding: 0; }
.fl-style-cards .fl-table { border-collapse: separate; border-spacing: 0 6px; }
.fl-style-cards .fl-table thead th { background: transparent; border: 0; padding-top: 0; padding-bottom: 6px; }
.fl-style-cards .fl-table tbody tr { background: var(--surface); border-radius: 10px; box-shadow: var(--shadow-sm); }
.fl-style-cards .fl-table tbody td { border: 1px solid var(--border); border-left: 0; border-right: 0; height: calc(var(--row-h) + 4px); }
.fl-style-cards .fl-table tbody td:first-child { border-left: 1px solid var(--border); border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
.fl-style-cards .fl-table tbody td:last-child { border-right: 1px solid var(--border); border-top-right-radius: 10px; border-bottom-right-radius: 10px; }

.fl-titlecell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fl-poster { width: 28px; height: 38px; border-radius: 4px; flex-shrink: 0; position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--surface-3) 0%, var(--surface-2) 100%);
  border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
  color: var(--text-soft); font-family: var(--font-mono); font-size: 9px; }
.fl-poster::after { content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(45deg, transparent 0 4px, rgba(0,0,0,.04) 4px 5px); }
.fl-titlecell .ttl { font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -.005em; }
.fl-titlecell .meta { font-size: 11px; color: var(--text-soft); }

.fl-id { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-soft); }

.fl-edit-cell { width: 100%; height: calc(var(--row-h) - 8px); border: 1px solid var(--accent);
  background: var(--surface); border-radius: 5px; padding: 0 6px; font: inherit; outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft); }

.fl-stockbar { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 11px; }
.fl-stockbar .bar { width: 40px; height: 5px; border-radius: 999px; background: var(--surface-3); overflow: hidden; position: relative; }
.fl-stockbar .bar i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--success); }
.fl-stockbar.lo .bar i { background: var(--warning); }
.fl-stockbar.crit .bar i { background: var(--danger); }
.fl-stockbar.lo { color: var(--warning); }
.fl-stockbar.crit { color: var(--danger); }

.fl-foot { display: flex; align-items: center; gap: 10px; padding: 10px 0 0; font-size: 12px; color: var(--text-muted); }
.fl-foot .pager { display: flex; align-items: center; gap: 4px; }
.fl-pgbtn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;
  border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text-muted); cursor: pointer; }
.fl-pgbtn:hover { background: var(--surface-2); color: var(--text); }
.fl-pgbtn[data-active="1"] { background: var(--accent); border-color: var(--accent); color: #fff; }
`;
if (!document.getElementById('pa-films-css')) {
  const s = document.createElement('style');
  s.id = 'pa-films-css';
  s.textContent = FILMS_CSS;
  document.head.appendChild(s);
}

function StockBar({ count, max = 10 }) {
  const pct = Math.min(100, Math.round((count / max) * 100));
  const cls = count <= 3 ? 'crit' : count <= 5 ? 'lo' : '';
  return (
    <span className={`fl-stockbar ${cls}`}>
      <span className="bar"><i style={{ width: pct + '%' }} /></span>
      {count}
    </span>
  );
}

function ColHead({ label, sortKey, sort, onSort, align }) {
  const active = sort && sort.key === sortKey;
  const dir = active ? sort.dir : null;
  return (
    <div className="colhead" data-active={active ? '1' : ''} onClick={() => onSort && onSort(sortKey)}
         style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <span>{label}</span>
      {sortKey && (
        dir === 'asc' ? <Icon name="arrowUp" size={11} /> :
        dir === 'desc' ? <Icon name="arrowDown" size={11} /> :
        <Icon name="chevUpDown" size={11} style={{ opacity: .4 }} />
      )}
    </div>
  );
}

function FilmsListScreen({ tableStyle = 'lined', preselected, editingCellId, focusedFilmId, hideToolbar, filterChips, sort: sortProp }) {
  const [selected, setSelected] = React.useState(new Set(preselected || []));
  const [sort, setSort] = React.useState(sortProp || { key: 'updated', dir: 'desc' });
  const [editing, setEditing] = React.useState(editingCellId || null);

  const films = React.useMemo(() => {
    const list = window.PA.FILMS.slice();
    list.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
      return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [sort]);

  const allChecked = selected.size > 0 && selected.size === films.length;
  const someChecked = selected.size > 0 && selected.size < films.length;

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(films.map(f => f.id)));
  const onSort = (k) => setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' });

  return (
    <div className={`fl-style-${tableStyle}`} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!hideToolbar && (
        <div className="fl-toolbar">
          <Input leftIcon="search" placeholder="Search 1,000 films…" size="sm" style={{ width: 240 }} />
          <Btn size="sm" leftIcon="filter">Category {filterChips?.includes('category') && <Chip tone="solid" style={{ marginLeft: 4 }}>3</Chip>}</Btn>
          <Btn size="sm" leftIcon="filter">Rating</Btn>
          <Btn size="sm" leftIcon="filter">Length</Btn>
          <Btn size="sm" leftIcon="plus" variant="ghost">More filters</Btn>
          <div className="sep" />
          <Btn size="sm" leftIcon="sort">Last updated</Btn>
          <div style={{ flex: 1 }} />
          <Btn size="sm" leftIcon="download" variant="ghost">Export</Btn>
          <Btn size="sm" leftIcon="plus" variant="primary">New film</Btn>
        </div>
      )}

      {selected.size > 0 && (
        <div className="fl-bulkbar">
          <Check checked={true} onChange={() => setSelected(new Set())} />
          <b style={{ fontWeight: 600 }}>{selected.size} film{selected.size > 1 ? 's' : ''} selected</b>
          <div className="sep" style={{ background: 'rgba(255,255,255,.25)', width: 1, height: 18 }} />
          <Btn size="sm" leftIcon="tag">Set category</Btn>
          <Btn size="sm" leftIcon="store">Move to store</Btn>
          <Btn size="sm" leftIcon="archive">Archive</Btn>
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
              <th style={{ width: 54 }}><ColHead label="ID" sortKey="id" sort={sort} onSort={onSort} /></th>
              <th><ColHead label="Title" sortKey="title" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 130 }}><ColHead label="Category" sortKey="category" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 70 }}><ColHead label="Rating" sortKey="rating" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 70 }}><ColHead label="Length" sortKey="length" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 90 }}><ColHead label="Rate" sortKey="rate" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 110 }}><ColHead label="Inventory" sortKey="inventory" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 70 }}>Demand</th>
              <th style={{ width: 110 }}><ColHead label="Last updated" sortKey="updated" sort={sort} onSort={onSort} /></th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {films.map(f => {
              const isSel = selected.has(f.id);
              const isFocus = focusedFilmId === f.id;
              return (
                <tr key={f.id} data-selected={isSel ? '1' : ''}
                    style={isFocus ? { background: 'var(--accent-soft)' } : null}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Check checked={isSel} onChange={() => toggle(f.id)} />
                  </td>
                  <td><span className="fl-id mono">#{String(f.id).padStart(3, '0')}</span></td>
                  <td>
                    <div className="fl-titlecell">
                      <div className="fl-poster">FILM</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="ttl">{f.title}</div>
                        <div className="meta">{f.actors} actors · {f.lang}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {editing === `${f.id}:category` ? (
                      <input className="fl-edit-cell" autoFocus defaultValue={f.category} onBlur={() => setEditing(null)} />
                    ) : (
                      <span onDoubleClick={() => setEditing(`${f.id}:category`)} style={{ cursor: 'text' }}>
                        <CategoryChip value={f.category} />
                      </span>
                    )}
                  </td>
                  <td><Rating value={f.rating} /></td>
                  <td><span className="mono" style={{ color: 'var(--text-muted)' }}>{f.length} min</span></td>
                  <td>
                    {editing === `${f.id}:rate` ? (
                      <input className="fl-edit-cell mono" autoFocus defaultValue={f.rate.toFixed(2)} onBlur={() => setEditing(null)} style={{ width: 70 }} />
                    ) : (
                      <span className="mono" onDoubleClick={() => setEditing(`${f.id}:rate`)}
                            style={{ cursor: 'text', color: 'var(--text)', fontWeight: 500 }}>
                        ${f.rate.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td><StockBar count={f.inventory} max={10} /></td>
                  <td><Sparkline data={window.PA.sparkFor(f.id)} width={56} height={20} /></td>
                  <td>
                    <span style={{ color: 'var(--text-soft)', fontSize: 11.5 }}>
                      {f.updated.slice(5).replace('-', '/')}
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
        <span><b style={{ color: 'var(--text)' }}>1–25</b> of <b style={{ color: 'var(--text)' }}>1,000</b> films</span>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-soft)' }}>Rows per page:</span>
        <Btn size="sm" variant="ghost" rightIcon="chevDown">25</Btn>
        <div className="pager">
          <button className="fl-pgbtn"><Icon name="chevLeft" size={12} /></button>
          <button className="fl-pgbtn" data-active="1">1</button>
          <button className="fl-pgbtn">2</button>
          <button className="fl-pgbtn">3</button>
          <button className="fl-pgbtn">…</button>
          <button className="fl-pgbtn">40</button>
          <button className="fl-pgbtn"><Icon name="chevRight" size={12} /></button>
        </div>
      </div>
    </div>
  );
}

function FilmsArtboard({ tableStyle, preselected, focusedFilmId, editingCellId }) {
  return (
    <Shell active="films" crumb={['Catalog', 'Films']}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>Films</h1>
          <p>1,000 titles across 2 stores · 4,581 inventory units</p>
        </div>
        <div className="actions">
          <Btn size="sm" variant="ghost" leftIcon="upload">Import CSV</Btn>
          <Btn size="sm" leftIcon="grid" variant="ghost" />
          <Btn size="sm" leftIcon="list" />
        </div>
      </div>
      <div className="pa-page-body">
        <FilmsListScreen tableStyle={tableStyle} preselected={preselected} focusedFilmId={focusedFilmId} editingCellId={editingCellId} />
      </div>
    </Shell>
  );
}

Object.assign(window, { FilmsListScreen, FilmsArtboard });
