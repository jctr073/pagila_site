// app.jsx — mounts the design canvas with all artboards + tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "density": "compact",
  "tableStyle": "lined"
}/*EDITMODE-END*/;

function ThemedArtboard({ tweaks, children, w = 1280, h = 820 }) {
  const cls = `pa-root ${tweaks.dark ? 'theme-dark' : ''} density-${tweaks.density}`;
  return (
    <div className={cls} style={{ width: w, height: h, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Make sure body gets the dark class too so the canvas frame matches mood.
  React.useEffect(() => {
    document.body.classList.toggle('theme-dark', !!t.dark);
  }, [t.dark]);

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

        <DCSection id="operations" title="Operations" subtitle="Stores & staff">
          <DCArtboard id="stores" label="Stores & staff" width={W} height={H}>
            <ThemedArtboard tweaks={t} w={W} h={H}><StoresStaffArtboard /></ThemedArtboard>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
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
