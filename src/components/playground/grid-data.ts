import projects from '@/app/dashboard/data.json';

export type Project = {
  id: number;
  header: string;
  type: string;
};

export const projectsArray = Object.values(projects);

export const CARD_SIZE = 240;
export const GRID_GAP = 24;

export const gifMap: Record<number, string> = {
  1: '/optimized/consultation-notice.webp',
  2: '/optimized/espacio-ideal.webp',
  3: '/optimized/wine-bottles.webp',
  4: '/optimized/beer-bottles.webp',
  5: '/optimized/standing-desk.webp',
  6: '/optimized/poss-magazine.webp',
  7: '/optimized/running-shirt.webp',
  8: '/optimized/green-standards-toolkit.webp',
  9: '/optimized/tote-bag.webp',
  10: '/optimized/paradigm-shift.webp',
  11: '/projects/espacio-ideal-catalogues/espacio-catalogues-placeholder-1.webp',
  12: '/projects/espacio-ideal-website/espacio-website-placeholder.webp',
  13: '/projects/25-years/biglieri-25-years-ph.webp',
  14: '/projects/biglieri-rebrand/biglieri-bph.webp',
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

export function getProjectGif(id: number) {
  return gifMap[id] || undefined;
}

// Seeded random function for consistent randomization
export function seededRandom(seed: number): number {
  let hash = seed * 2654435761;
  hash = (hash ^ (hash >>> 16)) * 0x85ebca6b;
  hash = (hash ^ (hash >>> 13)) * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  return Math.abs(hash) / 2147483647;
}

// Get project index ensuring even distribution with no adjacent duplicates
export function getProjectIndex(row: number, col: number, projectsLength: number): number {
  const patternCols = 6;
  const patternRows = 4;

  // Find title
  const tileRow = Math.floor(row / patternRows);
  const tileCol = Math.floor(col / patternCols);

  // Position within the tile
  const localRow = ((row % patternRows) + patternRows) % patternRows;
  const localCol = ((col % patternCols) + patternCols) % patternCols;
  const cellIndex = localRow * patternCols + localCol;

  // Generate a unique shuffled arrangement for this tile
  const tileSeed = tileRow * 92821 + tileCol * 93563;
  const arrangement = Array.from({ length: projectsLength }, (_, i) => i);

  // Fisher-Yates shuffle with seeded random
  for (let i = projectsLength - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(tileSeed + i * 2654435761) * (i + 1));
    [arrangement[i], arrangement[j]] = [arrangement[j], arrangement[i]];
  }

  // Return the project at this cell's position
  return arrangement[cellIndex % projectsLength];
}
