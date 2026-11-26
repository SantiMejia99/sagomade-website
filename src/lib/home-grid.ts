/** Tile size and spacing of the infinite home grid, in px. */
export const CARD_SIZE = 240;
export const GRID_GAP = 24;
export const CELL_SIZE = CARD_SIZE + GRID_GAP;

/** Deterministic pseudo-random number in [0, 1] for a given integer seed. */
function seededRandom(seed: number): number {
  let hash = seed * 2654435761;
  hash = (hash ^ (hash >>> 16)) * 0x85ebca6b;
  hash = (hash ^ (hash >>> 13)) * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  return Math.abs(hash) / 2147483647;
}

/**
 * Project index for a grid cell. The infinite plane is divided into 6x4 tiles; each tile
 * gets its own seeded shuffle so projects are evenly distributed and stable across renders.
 */
export function getProjectIndex(row: number, col: number, projectsLength: number): number {
  const patternCols = 6;
  const patternRows = 4;

  // Which tile this cell belongs to
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

  return arrangement[cellIndex % projectsLength];
}
