import projects from '@/app/dashboard/data.json';

export type Project = {
  id: number;
  header: string;
  type: string;
};

export const projectsArray = Object.values(projects);

export const CARD_SIZE = 240;
export const GRID_GAP = 24;

export type GridMedia = { kind: 'video'; webm: string; mp4: string; poster: string };

// 30 fps looping clips for every project (see public/videos/grid). 11-14 are rendered from code in
// tools/grid-animations.
const video = (name: string): GridMedia => ({
  kind: 'video',
  webm: `/videos/grid/${name}.webm`,
  mp4: `/videos/grid/${name}.mp4`,
  poster: `/videos/grid/${name}-poster.webp`,
});

export const mediaMap: Record<number, GridMedia> = {
  1: video('consultation-notice'),
  2: video('espacio-ideal'),
  3: video('wine-bottles'),
  4: video('beer-bottles'),
  5: video('standing-desk'),
  6: video('poss-magazine'),
  7: video('running-shirt'),
  8: video('green-standards-toolkit'),
  9: video('tote-bag'),
  10: video('paradigm-shift'),
  11: video('espacio-catalogues'),
  12: video('espacio-website'),
  13: video('biglieri-25-years'),
  14: video('biglieri-cube'),
};

export const colorMap: Record<number, string> = {
  1: '#0d0d0d',
  2: '#0d0d0d',
  3: '#0d0d0d',
  4: '#0d0d0d',
  5: '#0d0d0d',
  6: '#0d0d0d',
  7: '#0d0d0d',
  8: '#0d0d0d',
  9: '#0d0d0d',
  10: '#0d0d0d',
  11: '#0d0d0d',
  12: '#0d0d0d',
  13: '#0d0d0d',
  14: '#0d0d0d',
};

// Returns the same object for a given id every time, so it is safe to pass to memoized cards.
export function getProjectMedia(id: number): GridMedia | undefined {
  return mediaMap[id];
}

// --- Grid layout -------------------------------------------------------------------------------------------------
//
// The infinite grid repeats one PERIOD x PERIOD tile laid out on a torus, so its seams wrap like any other cell:
// - hard: no cell shares a project with any of its 8 neighbours (including diagonals and across the wrap);
// - soft: no project repeats two cells apart along a row or column;
// - balanced: every project fills the same number of cells (28 x 28 = 784 = 56 x 14 for 14 projects).
// The tile starts as a seeded shuffle of exactly balanced counts and is repaired by swapping cells, which keeps the
// counts balanced, until nothing conflicts. It takes about a millisecond, once per page load.
//
// The seed lives in sessionStorage, so the layout is random per visit but stable within one: panning away and back,
// or leaving the page and returning, shows the same projects in the same cells.

const PERIOD = 28;
const SEED_KEY = 'gridLayoutSeed';
const KING = [-1, -1, -1, 0, -1, 1, 0, -1, 0, 1, 1, -1, 1, 0, 1, 1];
const LINE2 = [-2, 0, 2, 0, 0, -2, 0, 2];
const HARD = 1000;
const SOFT = 1;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function freshSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0];
  return Math.floor(Math.random() * 2 ** 32);
}

function sessionSeed(): number {
  try {
    const stored = sessionStorage.getItem(SEED_KEY);
    if (stored !== null && /^\d+$/.test(stored)) return Number(stored) >>> 0;
    const seed = freshSeed();
    sessionStorage.setItem(SEED_KEY, String(seed));
    return seed;
  } catch {
    // Storage unavailable (private mode, blocked): still random, stable for this page load.
    return freshSeed();
  }
}

// Neighbour cell indices on the torus for each cell, for a flat list of (dRow, dCol) offsets.
function torusNeighbours(offsets: number[]): Int32Array {
  const per = offsets.length / 2;
  const out = new Int32Array(PERIOD * PERIOD * per);
  for (let r = 0; r < PERIOD; r++) {
    for (let c = 0; c < PERIOD; c++) {
      for (let k = 0; k < per; k++) {
        const rr = (r + offsets[2 * k] + PERIOD) % PERIOD;
        const cc = (c + offsets[2 * k + 1] + PERIOD) % PERIOD;
        out[(r * PERIOD + c) * per + k] = rr * PERIOD + cc;
      }
    }
  }
  return out;
}

const king = torusNeighbours(KING);
const line2 = torusNeighbours(LINE2);

// Returns the tile (project index per cell). With `strict`, returns null if any cell still touches its own project
// (not observed with 14 projects; possible with very few).
export function buildLayoutTile(seed: number, projects: number, strict = true): Int16Array | null {
  const cells = PERIOD * PERIOD;
  const rand = mulberry32(seed);
  const tile = new Int16Array(cells);
  for (let i = 0; i < cells; i++) tile[i] = i % projects;
  for (let i = cells - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [tile[i], tile[j]] = [tile[j], tile[i]];
  }

  // Cost of cell i holding project v, ignoring cell `skip` (the swap partner).
  const cost = (i: number, v: number, skip: number) => {
    let total = 0;
    for (let k = 0; k < 8; k++) {
      const j = king[i * 8 + k];
      if (j !== skip && tile[j] === v) total += HARD;
    }
    for (let k = 0; k < 4; k++) {
      const j = line2[i * 4 + k];
      if (j !== skip && tile[j] === v) total += SOFT;
    }
    return total;
  };

  for (let round = 0; round < 200; round++) {
    const bad: number[] = [];
    for (let i = 0; i < cells; i++) if (cost(i, tile[i], -1) > 0) bad.push(i);
    if (bad.length === 0) return tile;
    for (const a of bad) {
      const before = cost(a, tile[a], -1);
      if (before === 0) continue; // fixed by an earlier swap this round
      let best = 0;
      let partner = -1;
      for (let t = 0; t < 24; t++) {
        const b = Math.floor(rand() * cells);
        if (tile[b] === tile[a]) continue;
        const delta = cost(a, tile[b], b) + cost(b, tile[a], a) - before - cost(b, tile[b], -1);
        // Take the best improvement; occasionally accept a sideways move to get off plateaus.
        if (delta < best || (delta === 0 && partner < 0 && rand() < 0.1)) {
          best = delta;
          partner = b;
        }
      }
      if (partner >= 0) [tile[a], tile[partner]] = [tile[partner], tile[a]];
    }
  }
  // Out of rounds: accept it only if the hard rule holds (some soft repeats may remain), unless not strict.
  if (strict) for (let i = 0; i < cells; i++) if (cost(i, tile[i], -1) >= HARD) return null;
  return tile;
}

const tiles = new Map<number, Int16Array>();
const layoutSeed = sessionSeed();

// The per-session seed, shared with other per-cell randomness (e.g. the neuron links) so it all changes together.
export function getLayoutSeed(): number {
  return layoutSeed;
}

function layoutTile(projects: number): Int16Array {
  let tile = tiles.get(projects);
  if (!tile) {
    for (let attempt = 0; attempt < 10 && !tile; attempt++)
      tile = buildLayoutTile(layoutSeed + attempt, projects) ?? undefined;
    // Too few projects for the rule to be satisfiable: keep the closest layout rather than loop forever.
    tile ??= buildLayoutTile(layoutSeed, projects, false)!;
    tiles.set(projects, tile);
  }
  return tile;
}

// Index into projectsArray for a grid cell. O(1) after the tile is built (once per page load).
export function getProjectIndex(row: number, col: number, projectsLength: number): number {
  const r = ((row % PERIOD) + PERIOD) % PERIOD;
  const c = ((col % PERIOD) + PERIOD) % PERIOD;
  return layoutTile(projectsLength)[r * PERIOD + c];
}
