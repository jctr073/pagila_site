// app.jsx — mounts the design canvas with all artboards + tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "persimmon",
  "density": "compact",
  "tableStyle": "lined"
}/*EDITMODE-END*/;

// theme key → { class, bg (for the canvas/page outside the artboard), dark }
const THEMES = {
  persimmon: { label: 'Persimmon',     cls: '',                bg: '#f0eee9', dark: false },
  dark:      { label: 'Warm Dark',     cls: 'theme-dark',      bg: '#1a1814', dark: true  },
  midnight:  { label: 'Midnight Lime', cls: 'theme-midnight',  bg: '#1e2240', dark: true  },
  plum:      { label: 'Plum Velvet',   cls: 'theme-plum',      bg: '#241a2a', dark: true  },
  forest:    { label: 'Forest Amber',  cls: 'theme-forest',    bg: '#171f1a', dark: true  },
  cobalt:    { label: 'Cobalt Paper',  cls: 'theme-cobalt',    bg: '#eef1f7', dark: false },
  mint:      { label: 'Slate Mint',    cls: 'theme-mint',      bg: '#eef3f1', dark: false },
  mono:      { label: 'Mono',          cls: 'theme-mono',      bg: '#ececec', dark: false },
};

function ThemedArtboard({ tweaks, children, w = 1280, h = 820 }) {
  const theme = THEMES[tweaks.theme] || THEMES.persimmon;
  const cls = `pa-root ${theme.cls} density-${tweaks.density}`;
  return (
    <div className={cls} style={{ width: w, height: h, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Mirror the theme onto the body so the canvas frame matches the mood.
  React.useEffect(() => {
    const theme = THEMES[t.theme] || THEMES.persimmon;
    // clear any previous theme class
    Object.values(THEMES).forEach(th => { if (th.cls) document.body.classList.remove(th.cls); });
    if (theme.cls) document.body.classList.add(theme.cls);
    document.body.classList.toggle('theme-dark', !!theme.dark); // legacy hook
    document.body.style.background = theme.bg;
  }, [t.theme]);

  const W = 1280, H = 820;
  const detailFilm = window.PA.FILMS.find(f => f.id === 1);
  const editFilm   = window.PA.FILMS.find(f => f.id === 9); // Alabama Devil
  const filmsListPreselected = [3, 7, 9, 12]; // 4 selected to show bulk-bar

  return (
    <React.Fragment>
      <DesignCanvas title="Pagila — Catalog admin"
        subtitle="Friendly modern SaaS · persimmon + teal · Manrope / IBM Plex Mono">
        <DCSection id="overview" title="Overview" subtitle="Dashboard + entry points">
          <DCArtboard id="dashboard" label="Dashboard" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}><DashboardArtboard /></ThemedArtboard>
          </DCArtboard>
        </DCSection>

        <DCSection id="films" title="Films" subtitle="Catalog · list, drawer, edit">
          <DCArtboard id="films-list" label="A · List + bulk select" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}>
              <FilmsArtboard tableStyle={t.tableStyle} preselected={filmsListPreselected} />
            </ThemedArtboard>
          </DCArtboard>
          <DCArtboard id="films-drawer" label="B · Detail drawer" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}>
              <FilmDrawerArtboard film={detailFilm} />
            </ThemedArtboard>
          </DCArtboard>
          <DCArtboard id="films-edit" label="C · Edit modal" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}>
              <FilmEditArtboard film={editFilm} />
            </ThemedArtboard>
          </DCArtboard>
        </DCSection>

        <DCSection id="operations" title="Operations" subtitle="Stores & staff · list, drawer">
          <DCArtboard id="stores-list" label="A · Stores list" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}>
              <StoresArtboard tableStyle={t.tableStyle} preselected={[3, 6]} />
            </ThemedArtboard>
          </DCArtboard>
          <DCArtboard id="stores-drawer" label="B · Store detail drawer" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}>
              <StoreDrawerArtboard store={window.PA.STORES.find(s => s.id === 4)} />
            </ThemedArtboard>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakSelect label="Color theme" value={t.theme}
                     options={Object.entries(THEMES).map(([k, v]) => ({ value: k, label: v.label }))}
                     onChange={(v) => setTweak('theme', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
                    options={['compact', 'regular', 'comfy']}
                    onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Tables" />
        <TweakRadio label="Style" value={t.tableStyle}
                    options={['lined', 'zebra', 'cards']}
                    onChange={(v) => setTweak('tableStyle', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
