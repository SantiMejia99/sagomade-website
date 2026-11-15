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

  // Hover / focus / first tap: the active project lifts and brightens, every other project dims.
  hover: {
    liftScale: 1.06,
    liftBrightness: 1.08,
    dimOpacity: 0.4,
    durationMs: 400,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  // Terminal readout floating beside the active project.
  readout: {
    offset: 0.72, // its near edge sits this fraction of CARD_SIZE from the card centre
    flipMargin: 280, // px: if the card's right edge is closer than this to the viewport's right edge, show it on the left
    maxWidth: 260, // px
    fontSize: 11.5, // px
    letterSpacing: '0.06em',
    lineHeight: 1.5,
    labelWidth: 15, // characters for "YEAR ......... " so the values line up
    typeMs: 300, // whole readout types out in this long
    scrambleSteps: 2, // random glyphs a character shows before resolving
    glyphStepMs: 25, // how long each random glyph shows
    glyphs: '░▒▓/\\|_-=+*#<>01',
    fadeOutMs: 150,
    cursorBlinkMs: 1000,
    // Halo: a feathered patch of void behind the text so it never sits directly on a neighbour's artwork. No edge:
    // it is opaque through the text and eases to nothing across the padding.
    haloPadding: 48, // px beyond the text on each side (the side facing the project is clamped; see haloNear)
    haloOpacity: 0.92,
    haloFalloff: 1, // fraction of the padding the fade spans (1 = the whole padding; smaller = solid nearer the edge)
    haloFadeInMs: 150, // fades in as the typing starts; fades out with the readout (fadeOutMs)
    bright: '#f4efe9', // Sago paper-50: title, command, values
    dim: '#969695', // Sago paper-500: prompt, labels, dot leaders, [CLICK]
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
