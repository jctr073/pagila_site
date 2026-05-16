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
  { id: 1, address: '47 MySakila Drive', city: 'Lethbridge', country: 'Canada',  manager: 'Mike Hillyer',  staff: 4, inventory: 4581, openings: '09:00–22:00' },
  { id: 2, address: '28 MySQL Boulevard', city: 'Woodridge', country: 'Australia', manager: 'Jon Stephens', staff: 3, inventory: 4002, openings: '08:00–23:00' },
];

const STAFF = [
  { id: 1, name: 'Mike Hillyer',   email: 'mike.hillyer@sakilastaff.com',   store: 1, role: 'Manager',  active: true,  username: 'mike',   started: '2024-08-12', avatar: 'MH' },
  { id: 2, name: 'Jon Stephens',   email: 'jon.stephens@sakilastaff.com',   store: 2, role: 'Manager',  active: true,  username: 'jon',    started: '2024-09-04', avatar: 'JS' },
  { id: 3, name: 'Riya Patel',     email: 'riya.patel@sakilastaff.com',     store: 1, role: 'Clerk',    active: true,  username: 'riya',   started: '2025-02-19', avatar: 'RP' },
  { id: 4, name: 'Diego Alvarez',  email: 'diego.alvarez@sakilastaff.com',  store: 1, role: 'Clerk',    active: true,  username: 'diego',  started: '2025-05-30', avatar: 'DA' },
  { id: 5, name: 'Sun-Hee Park',   email: 'sunhee.park@sakilastaff.com',    store: 2, role: 'Clerk',    active: true,  username: 'sunhee', started: '2025-06-21', avatar: 'SP' },
  { id: 6, name: 'Olu Adeyemi',    email: 'olu.adeyemi@sakilastaff.com',    store: 2, role: 'Clerk',    active: false, username: 'olu',    started: '2024-11-08', avatar: 'OA' },
  { id: 7, name: 'Hana Müller',    email: 'hana.muller@sakilastaff.com',    store: 1, role: 'Clerk',    active: true,  username: 'hana',   started: '2026-01-10', avatar: 'HM' },
];

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
window.PA = { CATEGORIES, RATINGS, LANGUAGES, FILMS, ACTORS, STORES, STAFF, sparkFor };
