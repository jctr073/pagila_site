// Pagila admin design tokens, theme glue, and mock data.

const TOKENS_CSS = `
:root {
  --bg: oklch(0.985 0.005 70);
  --surface: #ffffff;
  --surface-2: oklch(0.965 0.008 70);
  --surface-3: oklch(0.945 0.012 70);
  --border: oklch(0.91 0.012 70);
  --border-strong: oklch(0.84 0.015 70);
  --text: oklch(0.22 0.018 60);
  --text-muted: oklch(0.48 0.015 60);
  --text-soft: oklch(0.62 0.012 60);
  --accent: oklch(0.66 0.16 38);
  --accent-hover: oklch(0.6 0.17 38);
  --accent-soft: oklch(0.95 0.035 38);
  --accent-soft-border: oklch(0.88 0.06 38);
  --teal: oklch(0.62 0.085 200);
  --teal-soft: oklch(0.95 0.022 200);
  --success: oklch(0.62 0.13 150);
  --success-soft: oklch(0.95 0.045 150);
  --warning: oklch(0.74 0.13 75);
  --warning-soft: oklch(0.96 0.05 75);
  --danger: oklch(0.6 0.18 25);
  --danger-soft: oklch(0.96 0.035 25);
  --violet: oklch(0.6 0.12 290);
  --violet-soft: oklch(0.95 0.03 290);

  --shadow-sm: 0 1px 2px rgba(40, 28, 16, 0.04), 0 1px 1px rgba(40, 28, 16, 0.03);
  --shadow-md: 0 4px 14px -3px rgba(40, 28, 16, 0.08), 0 2px 5px -2px rgba(40, 28, 16, 0.05);
  --shadow-lg: 0 24px 50px -12px rgba(40, 28, 16, 0.18), 0 8px 16px -6px rgba(40, 28, 16, 0.07);

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --row-h: 36px;
  --cell-px: 12px;
  --header-h: 56px;
  --sidebar-w: 224px;

  --font-sans: "Manrope", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

.theme-dark {
  --bg: oklch(0.17 0.008 60);
  --surface: oklch(0.21 0.012 60);
  --surface-2: oklch(0.24 0.014 60);
  --surface-3: oklch(0.28 0.016 60);
  --border: oklch(0.31 0.014 60);
  --border-strong: oklch(0.4 0.016 60);
  --text: oklch(0.96 0.008 70);
  --text-muted: oklch(0.68 0.012 70);
  --text-soft: oklch(0.55 0.012 70);
  --accent: oklch(0.74 0.16 40);
  --accent-hover: oklch(0.8 0.17 40);
  --accent-soft: oklch(0.32 0.06 38);
  --accent-soft-border: oklch(0.42 0.09 38);
  --teal: oklch(0.7 0.09 200);
  --teal-soft: oklch(0.3 0.04 200);
  --success: oklch(0.7 0.13 150);
  --success-soft: oklch(0.28 0.05 150);
  --warning: oklch(0.78 0.13 75);
  --warning-soft: oklch(0.3 0.06 75);
  --danger: oklch(0.7 0.16 25);
  --danger-soft: oklch(0.3 0.06 25);
  --violet: oklch(0.72 0.12 290);
  --violet-soft: oklch(0.3 0.05 290);

  --shadow-sm: 0 1px 2px rgba(0,0,0,.25), 0 1px 1px rgba(0,0,0,.18);
  --shadow-md: 0 4px 14px -3px rgba(0,0,0,.45), 0 2px 5px -2px rgba(0,0,0,.3);
  --shadow-lg: 0 24px 50px -12px rgba(0,0,0,.6), 0 8px 16px -6px rgba(0,0,0,.35);
}

/* ─── Midnight Lime — navy + lime accent (inspired by booking apps) ─── */
.theme-midnight {
  --bg: oklch(0.21 0.04 265);
  --surface: oklch(0.25 0.045 265);
  --surface-2: oklch(0.29 0.045 265);
  --surface-3: oklch(0.33 0.045 265);
  --border: oklch(0.36 0.04 265);
  --border-strong: oklch(0.46 0.045 265);
  --text: oklch(0.97 0.005 265);
  --text-muted: oklch(0.74 0.018 265);
  --text-soft: oklch(0.6 0.02 265);
  --accent: oklch(0.86 0.17 118);
  --accent-hover: oklch(0.9 0.17 118);
  --accent-soft: oklch(0.32 0.07 118);
  --accent-soft-border: oklch(0.5 0.12 118);
  --teal: oklch(0.78 0.12 200);
  --teal-soft: oklch(0.3 0.05 200);
  --success: oklch(0.78 0.15 145);
  --success-soft: oklch(0.3 0.06 145);
  --warning: oklch(0.82 0.14 80);
  --warning-soft: oklch(0.32 0.07 80);
  --danger: oklch(0.72 0.17 25);
  --danger-soft: oklch(0.32 0.07 25);
  --violet: oklch(0.74 0.13 290);
  --violet-soft: oklch(0.3 0.05 290);

  --shadow-sm: 0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.22);
  --shadow-md: 0 4px 14px -3px rgba(0,0,0,.5), 0 2px 5px -2px rgba(0,0,0,.35);
  --shadow-lg: 0 24px 50px -12px rgba(0,0,0,.7), 0 8px 16px -6px rgba(0,0,0,.4);
}

/* ─── Cobalt Paper — crisp white + cobalt blue ─── */
.theme-cobalt {
  --bg: oklch(0.985 0.004 250);
  --surface: #ffffff;
  --surface-2: oklch(0.965 0.008 250);
  --surface-3: oklch(0.94 0.012 250);
  --border: oklch(0.9 0.014 250);
  --border-strong: oklch(0.82 0.02 250);
  --text: oklch(0.22 0.025 255);
  --text-muted: oklch(0.46 0.02 255);
  --text-soft: oklch(0.6 0.015 255);
  --accent: oklch(0.52 0.19 258);
  --accent-hover: oklch(0.46 0.2 258);
  --accent-soft: oklch(0.95 0.04 258);
  --accent-soft-border: oklch(0.85 0.08 258);
  --teal: oklch(0.6 0.1 200);
  --teal-soft: oklch(0.95 0.025 200);
  --success: oklch(0.6 0.13 150);
  --success-soft: oklch(0.95 0.045 150);
  --warning: oklch(0.74 0.13 75);
  --warning-soft: oklch(0.96 0.05 75);
  --danger: oklch(0.58 0.18 25);
  --danger-soft: oklch(0.96 0.035 25);
  --violet: oklch(0.6 0.14 290);
  --violet-soft: oklch(0.95 0.035 290);
}

/* ─── Forest Amber — deep forest + amber highlights ─── */
.theme-forest {
  --bg: oklch(0.2 0.025 155);
  --surface: oklch(0.24 0.028 155);
  --surface-2: oklch(0.28 0.03 155);
  --surface-3: oklch(0.32 0.03 155);
  --border: oklch(0.35 0.028 155);
  --border-strong: oklch(0.44 0.032 155);
  --text: oklch(0.96 0.012 110);
  --text-muted: oklch(0.72 0.022 110);
  --text-soft: oklch(0.58 0.02 110);
  --accent: oklch(0.78 0.15 82);
  --accent-hover: oklch(0.83 0.15 82);
  --accent-soft: oklch(0.32 0.07 82);
  --accent-soft-border: oklch(0.48 0.11 82);
  --teal: oklch(0.74 0.1 180);
  --teal-soft: oklch(0.3 0.05 180);
  --success: oklch(0.78 0.14 150);
  --success-soft: oklch(0.3 0.06 150);
  --warning: oklch(0.82 0.14 70);
  --warning-soft: oklch(0.32 0.07 70);
  --danger: oklch(0.72 0.17 25);
  --danger-soft: oklch(0.32 0.07 25);
  --violet: oklch(0.74 0.13 290);
  --violet-soft: oklch(0.3 0.05 290);

  --shadow-sm: 0 1px 2px rgba(0,0,0,.28), 0 1px 1px rgba(0,0,0,.2);
  --shadow-md: 0 4px 14px -3px rgba(0,0,0,.48), 0 2px 5px -2px rgba(0,0,0,.32);
  --shadow-lg: 0 24px 50px -12px rgba(0,0,0,.68), 0 8px 16px -6px rgba(0,0,0,.38);
}

/* ─── Slate Mint — cool slate + mint highlight ─── */
.theme-mint {
  --bg: oklch(0.98 0.006 200);
  --surface: #ffffff;
  --surface-2: oklch(0.96 0.01 200);
  --surface-3: oklch(0.94 0.014 200);
  --border: oklch(0.9 0.014 200);
  --border-strong: oklch(0.82 0.02 200);
  --text: oklch(0.24 0.018 210);
  --text-muted: oklch(0.48 0.015 210);
  --text-soft: oklch(0.62 0.012 210);
  --accent: oklch(0.62 0.12 170);
  --accent-hover: oklch(0.56 0.13 170);
  --accent-soft: oklch(0.95 0.04 170);
  --accent-soft-border: oklch(0.85 0.08 170);
  --teal: oklch(0.6 0.1 210);
  --teal-soft: oklch(0.95 0.025 210);
  --success: oklch(0.6 0.13 150);
  --success-soft: oklch(0.95 0.045 150);
  --warning: oklch(0.74 0.13 75);
  --warning-soft: oklch(0.96 0.05 75);
  --danger: oklch(0.58 0.18 25);
  --danger-soft: oklch(0.96 0.035 25);
  --violet: oklch(0.6 0.13 290);
  --violet-soft: oklch(0.95 0.035 290);
}

/* ─── Mono — true neutral greyscale, no chroma ─── */
.theme-mono {
  --bg: oklch(0.98 0 0);
  --surface: #ffffff;
  --surface-2: oklch(0.965 0 0);
  --surface-3: oklch(0.94 0 0);
  --border: oklch(0.9 0 0);
  --border-strong: oklch(0.78 0 0);
  --text: oklch(0.18 0 0);
  --text-muted: oklch(0.46 0 0);
  --text-soft: oklch(0.62 0 0);
  --accent: oklch(0.2 0 0);
  --accent-hover: oklch(0.1 0 0);
  --accent-soft: oklch(0.93 0 0);
  --accent-soft-border: oklch(0.82 0 0);
  --teal: oklch(0.5 0 0);
  --teal-soft: oklch(0.94 0 0);
  --success: oklch(0.55 0.1 150);
  --success-soft: oklch(0.95 0.03 150);
  --warning: oklch(0.7 0.12 75);
  --warning-soft: oklch(0.95 0.04 75);
  --danger: oklch(0.55 0.18 25);
  --danger-soft: oklch(0.95 0.03 25);
  --violet: oklch(0.5 0 0);
  --violet-soft: oklch(0.94 0 0);
}

/* ─── Plum Velvet — dark plum + champagne pink ─── */
.theme-plum {
  --bg: oklch(0.2 0.04 330);
  --surface: oklch(0.24 0.045 330);
  --surface-2: oklch(0.28 0.05 330);
  --surface-3: oklch(0.32 0.05 330);
  --border: oklch(0.36 0.045 330);
  --border-strong: oklch(0.46 0.05 330);
  --text: oklch(0.97 0.008 330);
  --text-muted: oklch(0.74 0.02 330);
  --text-soft: oklch(0.6 0.018 330);
  --accent: oklch(0.82 0.12 40);
  --accent-hover: oklch(0.87 0.12 40);
  --accent-soft: oklch(0.32 0.07 40);
  --accent-soft-border: oklch(0.48 0.11 40);
  --teal: oklch(0.74 0.1 200);
  --teal-soft: oklch(0.3 0.05 200);
  --success: oklch(0.76 0.14 150);
  --success-soft: oklch(0.3 0.06 150);
  --warning: oklch(0.82 0.14 80);
  --warning-soft: oklch(0.32 0.07 80);
  --danger: oklch(0.72 0.17 25);
  --danger-soft: oklch(0.32 0.07 25);
  --violet: oklch(0.78 0.13 300);
  --violet-soft: oklch(0.3 0.06 300);

  --shadow-sm: 0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.22);
  --shadow-md: 0 4px 14px -3px rgba(0,0,0,.5), 0 2px 5px -2px rgba(0,0,0,.35);
  --shadow-lg: 0 24px 50px -12px rgba(0,0,0,.7), 0 8px 16px -6px rgba(0,0,0,.4);
}

.density-compact { --row-h: 32px; --cell-px: 10px; }
.density-regular { --row-h: 40px; --cell-px: 12px; }
.density-comfy   { --row-h: 48px; --cell-px: 16px; }

.pa-root {
  font-family: var(--font-sans);
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "ss01", "cv11";
  font-variant-numeric: tabular-nums;
  line-height: 1.45;
}
.pa-root *, .pa-root *::before, .pa-root *::after { box-sizing: border-box; }
.pa-root .mono { font-family: var(--font-mono); font-feature-settings: "zero"; }

.pa-root button { font-family: inherit; }
.pa-root input, .pa-root textarea, .pa-root select { font-family: inherit; color: inherit; }
`;

function injectTokensOnce() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pa-tokens')) return;
  const s = document.createElement('style');
  s.id = 'pa-tokens';
  s.textContent = TOKENS_CSS;
  document.head.appendChild(s);

  // Load fonts.
  if (!document.getElementById('pa-fonts')) {
    const l1 = document.createElement('link');
    l1.rel = 'preconnect'; l1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(l1);
    const l2 = document.createElement('link');
    l2.rel = 'preconnect'; l2.href = 'https://fonts.gstatic.com'; l2.crossOrigin = '';
    document.head.appendChild(l2);
    const l = document.createElement('link');
    l.id = 'pa-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }
}
injectTokensOnce();

// ─────────────────────────────────────────────────────────────────────────────
// Mock Pagila data — real titles + plausible categories/ratings/runtimes.

const CATEGORIES = [
  'Action', 'Animation', 'Children', 'Classics', 'Comedy', 'Documentary',
  'Drama', 'Family', 'Foreign', 'Games', 'Horror', 'Music', 'New', 'Sci-Fi',
  'Sports', 'Travel',
];

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const LANGUAGES = ['English', 'Italian', 'Japanese', 'Mandarin', 'French', 'German'];

const FILMS = [
  { id: 1, title: 'Academy Dinosaur',   year: 2006, category: 'Documentary', rating: 'PG',    length: 86,  rate: 0.99, replace: 20.99, inventory: 8, stores: [4,4],  updated: '2026-04-18', actors: 10, lang: 'English', features: ['Deleted Scenes', 'Behind the Scenes'], desc: 'A epic drama of a feminist and a mad scientist who must battle a teacher in the canadian rockies.' },
  { id: 2, title: 'Ace Goldfinger',     year: 2006, category: 'Horror',      rating: 'G',     length: 48,  rate: 4.99, replace: 12.99, inventory: 3, stores: [2,1],  updated: '2026-04-16', actors: 4,  lang: 'English', features: ['Trailers', 'Deleted Scenes'], desc: 'A astounding epistle of a database administrator and a explorer who must find a car in ancient china.' },
  { id: 3, title: 'Adaptation Holes',   year: 2006, category: 'Documentary', rating: 'NC-17', length: 50,  rate: 2.99, replace: 18.99, inventory: 4, stores: [2,2],  updated: '2026-04-15', actors: 5,  lang: 'English', features: ['Trailers', 'Deleted Scenes'], desc: 'A astounding reflection of a lumberjack and a car who must sink a lumberjack in a baloon factory.' },
  { id: 4, title: 'Affair Prejudice',   year: 2006, category: 'Horror',      rating: 'G',     length: 117, rate: 2.99, replace: 26.99, inventory: 6, stores: [3,3],  updated: '2026-04-12', actors: 5,  lang: 'English', features: ['Commentaries', 'Behind the Scenes'], desc: 'A fanciful documentary of a frisbee and a lumberjack who must chase a monkey in a shark tank.' },
  { id: 5, title: 'African Egg',        year: 2006, category: 'Family',      rating: 'G',     length: 130, rate: 2.99, replace: 22.99, inventory: 6, stores: [3,3],  updated: '2026-04-11', actors: 6,  lang: 'English', features: ['Deleted Scenes'], desc: 'A fast-paced documentary of a pastry chef and a dentist who must pursue a forensic psychologist in the gulf of mexico.' },
  { id: 6, title: 'Agent Truman',       year: 2006, category: 'Foreign',     rating: 'PG',    length: 169, rate: 2.99, replace: 17.99, inventory: 7, stores: [4,3],  updated: '2026-04-10', actors: 7,  lang: 'English', features: ['Deleted Scenes'], desc: 'A intrepid panorama of a robot and a boy who must escape a sumo wrestler in ancient china.' },
  { id: 7, title: 'Airplane Sierra',    year: 2006, category: 'Comedy',      rating: 'PG-13', length: 62,  rate: 4.99, replace: 28.99, inventory: 5, stores: [3,2],  updated: '2026-04-09', actors: 4,  lang: 'English', features: ['Trailers', 'Commentaries', 'Behind the Scenes'], desc: 'A touching saga of a hunter and a butler who must discover a butler in a jet boat.' },
  { id: 8, title: 'Airport Pollock',    year: 2006, category: 'Horror',      rating: 'R',     length: 54,  rate: 4.99, replace: 15.99, inventory: 5, stores: [3,2],  updated: '2026-04-08', actors: 4,  lang: 'English', features: ['Trailers'], desc: 'A epic tale of a moose and a girl who must confront a monkey in ancient india.' },
  { id: 9, title: 'Alabama Devil',      year: 2006, category: 'Horror',      rating: 'PG-13', length: 114, rate: 2.99, replace: 21.99, inventory: 5, stores: [2,3],  updated: '2026-04-07', actors: 8,  lang: 'English', features: ['Trailers', 'Deleted Scenes'], desc: 'A thoughtful panorama of a database administrator and a mad scientist who must outgun a mad scientist in a jet boat.' },
  { id: 10, title: 'Aladdin Calendar', year: 2006, category: 'Sports',      rating: 'NC-17', length: 63,  rate: 4.99, replace: 24.99, inventory: 7, stores: [4,3],  updated: '2026-04-06', actors: 11, lang: 'English', features: ['Trailers', 'Commentaries'], desc: 'A action-packed tale of a man and a lumberjack who must reach a feminist in ancient china.' },
  { id: 11, title: 'Alamo Videotape',  year: 2006, category: 'Foreign',     rating: 'G',     length: 126, rate: 0.99, replace: 15.99, inventory: 6, stores: [3,3],  updated: '2026-04-05', actors: 7,  lang: 'English', features: ['Behind the Scenes'], desc: 'A boring epistle of a butler and a cat who must fight a pastry chef in a mysql convention.' },
  { id: 12, title: 'Alaska Phantom',   year: 2006, category: 'Music',       rating: 'PG-13', length: 136, rate: 0.99, replace: 22.99, inventory: 6, stores: [3,3],  updated: '2026-04-04', actors: 9,  lang: 'English', features: ['Commentaries', 'Deleted Scenes'], desc: 'A fanciful saga of a hunter and a pastry chef who must vanquish a boy in australia.' },
  { id: 13, title: 'Ali Forever',      year: 2006, category: 'Action',      rating: 'PG',    length: 150, rate: 4.99, replace: 21.99, inventory: 4, stores: [2,2],  updated: '2026-04-03', actors: 5,  lang: 'English', features: ['Deleted Scenes', 'Behind the Scenes'], desc: 'A action-packed drama of a dentist and a crocodile who must outgun a feminist in the canadian rockies.' },
  { id: 14, title: 'Alice Fantasia',   year: 2006, category: 'Classics',    rating: 'NC-17', length: 94,  rate: 0.99, replace: 23.99, inventory: 6, stores: [3,3],  updated: '2026-04-02', actors: 5,  lang: 'English', features: ['Trailers', 'Deleted Scenes', 'Behind the Scenes'], desc: 'A emotional drama of a a shark and a database administrator who must vanquish a pioneer in soviet georgia.' },
  { id: 15, title: 'Alien Center',     year: 2006, category: 'Foreign',     rating: 'NC-17', length: 46,  rate: 2.99, replace: 10.99, inventory: 6, stores: [3,3],  updated: '2026-04-01', actors: 6,  lang: 'English', features: ['Trailers', 'Commentaries', 'Behind the Scenes'], desc: 'A brilliant drama of a cat and a mad scientist who must battle a feminist in a mysql convention.' },
  { id: 16, title: 'Alley Evolution',  year: 2006, category: 'Foreign',     rating: 'NC-17', length: 180, rate: 2.99, replace: 23.99, inventory: 4, stores: [2,2],  updated: '2026-03-31', actors: 5,  lang: 'English', features: ['Trailers', 'Commentaries'], desc: 'A fast-paced drama of a robot and a composer who must battle a astronaut in new orleans.' },
  { id: 17, title: 'Alone Trip',       year: 2006, category: 'Music',       rating: 'R',     length: 82,  rate: 0.99, replace: 14.99, inventory: 5, stores: [2,3],  updated: '2026-03-30', actors: 7,  lang: 'English', features: ['Behind the Scenes'], desc: 'A fast-paced character study of a composer and a dog who must outgun a boat in an abandoned amusement park.' },
  { id: 18, title: 'Alter Victory',    year: 2006, category: 'Animation',   rating: 'PG-13', length: 57,  rate: 0.99, replace: 27.99, inventory: 6, stores: [3,3],  updated: '2026-03-29', actors: 11, lang: 'English', features: ['Behind the Scenes'], desc: 'A thoughtful drama of a teacher and a man who must defeat a forensic psychologist in new orleans.' },
  { id: 19, title: 'Amadeus Holy',     year: 2006, category: 'Action',      rating: 'PG',    length: 113, rate: 0.99, replace: 20.99, inventory: 4, stores: [2,2],  updated: '2026-03-28', actors: 7,  lang: 'English', features: ['Deleted Scenes', 'Behind the Scenes'], desc: 'A emotional display of a pioneer and a technical writer who must battle a man in a jet boat.' },
  { id: 20, title: 'Amelie Hellfighters', year: 2006, category: 'Music',    rating: 'R',     length: 79,  rate: 4.99, replace: 23.99, inventory: 6, stores: [3,3],  updated: '2026-03-27', actors: 6,  lang: 'English', features: ['Behind the Scenes'], desc: 'A boring drama of a woman and a squirrel who must conquer a student in a baloon factory.' },
  { id: 21, title: 'American Circus',  year: 2006, category: 'Action',      rating: 'R',     length: 129, rate: 4.99, replace: 17.99, inventory: 5, stores: [3,2],  updated: '2026-03-26', actors: 7,  lang: 'English', features: ['Commentaries', 'Behind the Scenes'], desc: 'A insightful drama of a girl and a astronaut who must face a database administrator in a shark tank.' },
  { id: 22, title: 'Amistad Midsummer',year: 2006, category: 'Documentary', rating: 'G',     length: 85,  rate: 2.99, replace: 10.99, inventory: 3, stores: [2,1],  updated: '2026-03-25', actors: 5,  lang: 'English', features: ['Behind the Scenes'], desc: 'A emotional character study of a dentist and a lumberjack who must overcome a frisbee in the gulf of mexico.' },
  { id: 23, title: 'Anaconda Confessions', year: 2006, category: 'Family', rating: 'G',     length: 92,  rate: 0.99, replace: 9.99,  inventory: 4, stores: [2,2],  updated: '2026-03-24', actors: 6,  lang: 'English', features: ['Trailers', 'Deleted Scenes'], desc: 'A lacklusture display of a dentist and a dentist who must fight a girl in australia.' },
  { id: 24, title: 'Analyze Hoosiers', year: 2006, category: 'Horror',     rating: 'R',     length: 181, rate: 2.99, replace: 10.99, inventory: 5, stores: [3,2],  updated: '2026-03-23', actors: 7,  lang: 'English', features: ['Trailers'], desc: 'A thoughtful display of a explorer and a pastry chef who must overcome a forensic psychologist in the outback.' },
  { id: 25, title: 'Angels Life',      year: 2006, category: 'Music',      rating: 'G',     length: 74,  rate: 0.99, replace: 15.99, inventory: 3, stores: [1,2],  updated: '2026-03-22', actors: 4,  lang: 'English', features: ['Trailers'], desc: 'A thoughtful display of a woman and a astronaut who must find a astronaut in ancient china.' },
];

const ACTORS = [
  'Penelope Guiness', 'Nick Wahlberg', 'Ed Chase', 'Jennifer Davis', 'Johnny Lollobrigida',
  'Bette Nicholson', 'Grace Mostel', 'Matthew Johansson', 'Joe Swank', 'Christian Gable',
  'Zero Cage', 'Karl Berry', 'Uma Wood', 'Vivien Bergen', 'Cuba Olivier',
];

const STORES = [
  { id: 1,  address: '47 MySakila Drive',        address2: 'Suite 200',     district: 'Alberta',         city: 'Lethbridge',     country: 'Canada',       postal: 'T1J 1Y2', phone: '+1 (403) 555-0142', country_code: 'CA', tz: 'America/Edmonton (MDT)',  openings: 'Mon–Sat 9a–10p · Sun 11a–7p', inventory: 4581, staff: 4, customers: 326, rentals: 94, opened: '2018-04-12', accent: 'oklch(0.66 0.16 38)',  tone: 'accent'  },
  { id: 2,  address: '28 MySQL Boulevard',       address2: '',              district: 'QLD',             city: 'Woodridge',      country: 'Australia',    postal: '4114',    phone: '+61 (7) 5555 0214', country_code: 'AU', tz: 'Australia/Brisbane (AEST)', openings: 'Mon–Sat 8a–11p · Sun 10a–8p', inventory: 4002, staff: 3, customers: 273, rentals: 89, opened: '2019-08-30', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
  { id: 3,  address: '1031 Daugavpils Parkway',  address2: '',              district: 'Algiers',         city: 'Bchar',          country: 'Algeria',      postal: '08000',   phone: '+213 49 81 47 32',  country_code: 'DZ', tz: 'Africa/Algiers (CET)',     openings: 'Mon–Sat 9a–9p · Sun 11a–6p',  inventory: 2104, staff: 2, customers: 184, rentals: 41, opened: '2021-02-04', accent: 'oklch(0.7 0.13 60)',    tone: 'accent'  },
  { id: 4,  address: '569 Baicheng Lane',        address2: 'Floor 3',       district: 'Gauteng',         city: 'Boksburg',       country: 'South Africa', postal: '1459',    phone: '+27 11 555 0188',   country_code: 'ZA', tz: 'Africa/Johannesburg (SAST)', openings: 'Mon–Sat 9a–9p · Sun 11a–6p', inventory: 2270, staff: 6, customers: 412, rentals: 92, opened: '2020-06-14', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
  { id: 5,  address: '478 Joliet Way',           address2: '',              district: 'Waikato',         city: 'Hamilton',       country: 'New Zealand',  postal: '3204',    phone: '+64 7 555 0273',    country_code: 'NZ', tz: 'Pacific/Auckland (NZST)',   openings: 'Mon–Sat 9a–9p · Sun 11a–7p', inventory: 2311, staff: 1, customers: 158, rentals: 51, opened: '2022-01-18', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
  { id: 6,  address: '1586 Guaruj Place',        address2: '',              district: 'Hunan',           city: 'Xiangtan',       country: 'China',        postal: '411100',  phone: '+86 731 555 0119',  country_code: 'CN', tz: 'Asia/Shanghai (CST)',       openings: 'Mon–Sat 9a–9p · Sun 11a–7p', inventory: 3015, staff: 6, customers: 488, rentals: 102, opened: '2019-11-22', accent: 'oklch(0.66 0.16 38)',  tone: 'accent'  },
  { id: 7,  address: '770 Bydgoszcz Avenue',     address2: '',              district: 'Puebla',          city: 'Atlixco',        country: 'Mexico',       postal: '74200',   phone: '+52 244 555 0193',  country_code: 'MX', tz: 'America/Mexico_City (CST)', openings: 'Mon–Sat 9a–9p · Sun 12p–7p', inventory: 1842, staff: 2, customers: 213, rentals: 47, opened: '2022-07-09', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
  { id: 8,  address: '215 Lincoln Park West',    address2: '',              district: 'Nebraska',        city: 'Lincoln',        country: 'United States', postal: '68508',  phone: '+1 (402) 555-0163', country_code: 'US', tz: 'America/Chicago (CST)',     openings: 'Mon–Sat 10a–10p · Sun 11a–8p', inventory: 4830, staff: 5, customers: 612, rentals: 178, opened: '2017-09-03', accent: 'oklch(0.66 0.16 38)',  tone: 'accent'  },
  { id: 9,  address: '32 Merlo Crossing',        address2: '',              district: 'Buenos Aires',    city: 'Merlo',          country: 'Argentina',    postal: 'B1722',   phone: '+54 220 555 0144',  country_code: 'AR', tz: 'America/Argentina/Buenos_Aires (ART)', openings: 'Mon–Sat 9a–9p · Sun 11a–7p', inventory: 1207, staff: 2, customers: 142, rentals: 28, opened: '2023-03-19', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
  { id: 10, address: '901 Wakayama Promenade',   address2: 'Block B',       district: 'Tōhoku',          city: 'Aomori',         country: 'Japan',        postal: '030-0813',phone: '+81 17 555 0190',   country_code: 'JP', tz: 'Asia/Tokyo (JST)',          openings: 'Mon–Sun 10a–9p',              inventory: 3712, staff: 4, customers: 397, rentals: 84, opened: '2018-12-01', accent: 'oklch(0.66 0.16 38)',  tone: 'accent'  },
  { id: 11, address: '88 Tampere Square',        address2: '',              district: 'Pirkanmaa',       city: 'Tampere',        country: 'Finland',      postal: '33100',   phone: '+358 3 555 0205',   country_code: 'FI', tz: 'Europe/Helsinki (EEST)',    openings: 'Mon–Fri 10a–8p · Sat 10a–6p · Sun closed', inventory: 1495, staff: 2, customers: 117, rentals: 34, opened: '2024-05-21', accent: 'oklch(0.62 0.085 200)', tone: 'teal'   },
  { id: 12, address: '14 Bafoussam Way',         address2: '',              district: 'West Region',     city: 'Bafoussam',      country: 'Cameroon',     postal: 'BP 25',   phone: '+237 6 555 0177',   country_code: 'CM', tz: 'Africa/Douala (WAT)',       openings: 'Mon–Sat 9a–8p',               inventory: 980,  staff: 1, customers: 89,  rentals: 19, opened: '2024-11-02', accent: 'oklch(0.66 0.16 38)',  tone: 'accent'  },
  { id: 13, address: '405 Tafuna Heights',       address2: '',              district: 'Tutuila',         city: 'Tafuna',         country: 'American Samoa', postal: '96799', phone: '+1 (684) 555-0148', country_code: 'AS', tz: 'Pacific/Pago_Pago (SST)',   openings: 'Mon–Sat 9a–7p · Sun 12p–5p',  inventory: 612,  staff: 1, customers: 64,  rentals: 12, opened: '2025-02-14', accent: 'oklch(0.62 0.085 200)', tone: 'teal'    },
];

const STAFF = [
  // Managers (one per store)
  { id: 1,  name: 'Tisha DuBuque',   email: 'tisha@rosenbaumreichert.com',     store: 1,  role: 'Manager', active: true,  username: 'tisha',   started: '2024-08-12', avatar: 'TD', tone: 'accent'  },
  { id: 2,  name: 'Warner Hudson',   email: 'warner@ratkehaley.com',           store: 2,  role: 'Manager', active: true,  username: 'warner',  started: '2024-09-04', avatar: 'WH', tone: 'accent'  },
  { id: 3,  name: 'Mahdi Cherif',    email: 'mcherif@daugavpils.dz',           store: 3,  role: 'Manager', active: true,  username: 'mahdi',   started: '2025-02-19', avatar: 'MC', tone: 'teal'    },
  { id: 4,  name: 'Lavone O\u2019Reilly', email: 'lavone@kleinwiso.com',       store: 4,  role: 'Manager', active: true,  username: 'lavone',  started: '2025-05-30', avatar: 'LO', tone: 'violet'  },
  { id: 5,  name: 'Louie Walter',    email: 'lwalter@baileykeebler.com',       store: 5,  role: 'Manager', active: true,  username: 'louie',   started: '2025-06-21', avatar: 'LW', tone: 'teal'    },
  { id: 6,  name: 'Jia-Lin Hou',     email: 'jl.hou@xiangtan.cn',              store: 6,  role: 'Manager', active: true,  username: 'jialin',  started: '2024-11-08', avatar: 'JH', tone: 'violet'  },
  { id: 7,  name: 'Camila Ortega',   email: 'camila@atlixco.mx',               store: 7,  role: 'Manager', active: true,  username: 'camila',  started: '2026-01-10', avatar: 'CO', tone: 'accent'  },
  { id: 8,  name: 'Walter Bridges',  email: 'walter@lincolnpark.us',           store: 8,  role: 'Manager', active: true,  username: 'walter',  started: '2023-08-14', avatar: 'WB', tone: 'accent'  },
  { id: 9,  name: 'Tomás Acuña',     email: 'tomas@merlo.ar',                  store: 9,  role: 'Manager', active: true,  username: 'tomas',   started: '2025-04-02', avatar: 'TA', tone: 'teal'    },
  { id: 10, name: 'Hiroko Saito',    email: 'h.saito@wakayama.jp',             store: 10, role: 'Manager', active: true,  username: 'hiroko',  started: '2024-03-12', avatar: 'HS', tone: 'success' },
  { id: 11, name: 'Eero Nieminen',   email: 'eero@tampere.fi',                 store: 11, role: 'Manager', active: true,  username: 'eero',    started: '2025-09-01', avatar: 'EN', tone: 'teal'    },
  { id: 12, name: 'Chantal Mbarga',  email: 'cmbarga@bafoussam.cm',            store: 12, role: 'Manager', active: true,  username: 'chantal', started: '2024-12-10', avatar: 'CM', tone: 'violet'  },
  { id: 13, name: 'Sefi Tuilagi',    email: 'sefi@tafuna.as',                  store: 13, role: 'Manager', active: true,  username: 'sefi',    started: '2025-03-05', avatar: 'ST', tone: 'accent'  },
  // Clerks
  { id: 14, name: 'Riya Patel',      email: 'riya.patel@sakilastaff.com',      store: 1,  role: 'Clerk',   active: true,  username: 'riya',    started: '2025-02-19', avatar: 'RP', tone: 'teal'    },
  { id: 15, name: 'Diego Alvarez',   email: 'diego.alvarez@sakilastaff.com',   store: 1,  role: 'Clerk',   active: true,  username: 'diego',   started: '2025-05-30', avatar: 'DA', tone: 'success' },
  { id: 16, name: 'Hana Müller',     email: 'hana.muller@sakilastaff.com',     store: 1,  role: 'Clerk',   active: true,  username: 'hana',    started: '2026-01-10', avatar: 'HM', tone: 'violet'  },
  { id: 17, name: 'Sun-Hee Park',    email: 'sunhee.park@sakilastaff.com',     store: 2,  role: 'Clerk',   active: true,  username: 'sunhee',  started: '2025-06-21', avatar: 'SP', tone: 'teal'    },
  { id: 18, name: 'Olu Adeyemi',     email: 'olu.adeyemi@sakilastaff.com',     store: 2,  role: 'Clerk',   active: false, username: 'olu',     started: '2024-11-08', avatar: 'OA', tone: 'success' },
];

// Customers — seeded generation per store
const FIRST_NAMES = ['Maria', 'James', 'Olivia', 'Ahmed', 'Yuki', 'Carlos', 'Priya', 'Liam', 'Chen', 'Aisha',
  'Nina', 'Tomás', 'Hana', 'Diego', 'Ingrid', 'Kofi', 'Anya', 'Pavel', 'Lina', 'Theo',
  'Amara', 'Rashid', 'Esme', 'Joon', 'Sofia', 'Mateo', 'Zara', 'Felix', 'Mira', 'Bruno',
  'Saoirse', 'Niko', 'Iris', 'Hugo', 'Talia', 'Otis', 'Yara', 'Reza', 'Camille', 'Bodhi'];
const LAST_NAMES = ['Garcia', 'Smith', 'Khan', 'Tanaka', 'Silva', 'Patel', 'O\u2019Brien', 'Wang', 'Hassan', 'Petrov',
  'Müller', 'Rossi', 'Sato', 'Lopez', 'Adeyemi', 'Kowalski', 'Ivanov', 'Nguyen', 'Reyes', 'Park',
  'Cohen', 'Schmidt', 'Andersen', 'Cruz', 'Becker', 'Suzuki', 'Diop', 'Ferraro', 'Holm', 'Larsson',
  'Okafor', 'Da Silva', 'Hassan', 'Vukovic', 'Jensen', 'Bauer', 'Aguilar', 'Singh', 'Romanov', 'Castillo'];

function seedRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function genCustomersForStore(store, count) {
  const rand = seedRand(store.id * 9973 + 17);
  const out = [];
  for (let i = 0; i < count; i++) {
    const fi = Math.floor(rand() * FIRST_NAMES.length);
    const li = Math.floor(rand() * LAST_NAMES.length);
    const first = FIRST_NAMES[fi];
    const last = LAST_NAMES[li];
    const email = `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase().replace(/[^a-z]/g, '')}@sakilacustomer.org`;
    const yearOffset = Math.floor(rand() * 5);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const joined = `202${1 + yearOffset}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const lastRented = Math.floor(rand() * 90);
    out.push({
      id: store.id * 1000 + i + 1,
      first, last,
      name: `${first} ${last}`,
      avatar: `${first[0]}${last[0]}`.toUpperCase(),
      email,
      store: store.id,
      address_id: store.id * 100 + i,
      district: store.district,
      city: store.city,
      country: store.country,
      active: rand() > 0.08,
      joined,
      rentals: Math.floor(rand() * 64),
      lastRented: lastRented === 0 ? 'today' : lastRented === 1 ? 'yesterday' : `${lastRented}d ago`,
      tone: ['accent', 'teal', 'violet', 'success'][i % 4],
    });
  }
  return out;
}

const CUSTOMERS = STORES.flatMap(s => genCustomersForStore(s, Math.min(s.customers, 8 + (s.id % 6))));

// 8-bucket sparkline data per film (rentals last 8 weeks-ish)
function sparkFor(id) {
  const out = [];
  let seed = id * 9301 + 49297;
  for (let i = 0; i < 12; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    out.push(4 + Math.floor((seed / 233280) * 18));
  }
  return out;
}

// expose
window.PA = { CATEGORIES, RATINGS, LANGUAGES, FILMS, ACTORS, STORES, STAFF, CUSTOMERS, sparkFor };
