// Tunables for the playground "void": projects floating in empty space. Everything is meant to be very subtle;
// adjust here.

export const VOID = {
  // The void, equal to the background baked into every grid video (decodes as #0c0c0c-#0d0d0d).
  background: '#0d0d0d',

  // Card edge feather: the media is fully opaque out to this fraction of the card's half-size, then fades to
  // transparent exactly at the card edge, so no box edge or encoder noise can show against the void.
  maskSolid: 0.7,

  // Per-project float. Each axis swings between -amp and +amp and back, easing at the ends; x and y use different
  // half-periods, so the path is a slow figure rather than a line. A full loop is twice the half-period.
  drift: {
    ampMin: 2, // px
    ampMax: 4, // px
    halfPeriodMin: 4, // s (8 s loop)
    halfPeriodMax: 6, // s (12 s loop)
  },
} as const;

// Deterministic hash of integers to [0, 1). Used for per-cell randomness that must stay the same whenever a cell
// remounts while panning.
export function hash01(...values: number[]): number {
  let h = 0x811c9dc5;
  for (const v of values) {
    h = Math.imul(h ^ (v | 0), 0x01000193);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
  }
  h = Math.imul(h ^ (h >>> 16), 0x297a2d39);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
