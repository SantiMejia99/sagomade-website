import React, { useMemo } from 'react';
import { CARD_SIZE, GRID_GAP, getLayoutSeed } from '@/components/playground/grid-data';
import { VOID, hash01 } from '@/components/playground/void-config';

const CELL = CARD_SIZE + GRID_GAP;
const HALF = CARD_SIZE / 2;
// Edges each cell owns (so every edge has exactly one owner): right, down, down-right, down-left.
const NEAR: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];
// Longer links go a knight's move away, so they pass between cards rather than through one.
const FAR: [number, number][] = [
  [1, 2],
  [1, -2],
  [2, 1],
  [2, -1],
];
// Salts keep the different random choices independent of each other.
const SALT = { edge: 1, long: 2, longDir: 3, pulse: 4, cycle: 5, phase: 6, reverse: 7 };

type CellWindow = { startRow: number; startCol: number; rows: number; cols: number };

type Link = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  pulse: { cycle: number; delay: number } | null;
};

const edgeKey = (r: number, c: number, dr: number, dc: number) => `${r}:${c}:${dr}:${dc}`;

function hasNearEdge(seed: number, r: number, c: number, k: number): boolean {
  if (hash01(seed, SALT.edge, r, c, k) >= VOID.links.edgeChance) return false;
  // Keep only one of two diagonals that would cross: down-left of (r, c) crosses down-right of (r, c - 1).
  if (k === 3 && hasNearEdge(seed, r, c - 1, 2)) return false;
  return true;
}

// Links owned by the mounted cells. Positions are relative to the window's top-left corner.
function linksFor(win: CellWindow, seed: number): Link[] {
  const links: Link[] = [];
  const trim = VOID.links.trim * CARD_SIZE;
  const add = (r: number, c: number, dr: number, dc: number) => {
    const ax = (c - win.startCol) * CELL + HALF;
    const ay = (r - win.startRow) * CELL + HALF;
    const bx = ax + dc * CELL;
    const by = ay + dr * CELL;
    const full = Math.hypot(bx - ax, by - ay);
    const length = full - 2 * trim;
    if (length < 8) return;
    const ux = (bx - ax) / full;
    const uy = (by - ay) / full;
    // Pulses travel either way along the link.
    const reverse = hash01(seed, SALT.reverse, r, c, dr, dc) < 0.5;
    let [x1, y1, x2, y2] = [ax + ux * trim, ay + uy * trim, bx - ux * trim, by - uy * trim];
    if (reverse) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const p = VOID.pulses;
    const pulse =
      hash01(seed, SALT.pulse, r, c, dr, dc) < p.chance
        ? (() => {
            const cycle = p.cycleMin + (p.cycleMax - p.cycleMin) * hash01(seed, SALT.cycle, r, c, dr, dc);
            return { cycle, delay: cycle * hash01(seed, SALT.phase, r, c, dr, dc) };
          })()
        : null;
    links.push({ key: edgeKey(r, c, dr, dc), x1, y1, x2, y2, length, pulse });
  };

  for (let r = win.startRow; r < win.startRow + win.rows; r++) {
    for (let c = win.startCol; c < win.startCol + win.cols; c++) {
      NEAR.forEach(([dr, dc], k) => {
        if (hasNearEdge(seed, r, c, k)) add(r, c, dr, dc);
      });
      if (hash01(seed, SALT.long, r, c) < VOID.links.longChance) {
        const [dr, dc] = FAR[Math.floor(hash01(seed, SALT.longDir, r, c) * FAR.length)];
        add(r, c, dr, dc);
      }
    }
  }
  return links;
}

// Faint hairlines between projects, under the cards, covering the mounted cell window. Re-rendered only when the
// window changes; it pans with the grid's transform, and pulses are CSS animations, so there is no per-frame work.
const NeuronLinks = React.memo(({ cellWindow }: { cellWindow: CellWindow }) => {
  const links = useMemo(() => linksFor(cellWindow, getLayoutSeed()), [cellWindow]);
  const { color, opacity, width } = VOID.links;
  const p = VOID.pulses;

  return (
    <svg
      aria-hidden='true'
      width={cellWindow.cols * CELL}
      height={cellWindow.rows * CELL}
      overflow='visible'
      style={{
        position: 'absolute',
        left: cellWindow.startCol * CELL,
        top: cellWindow.startRow * CELL,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <g stroke={color} strokeWidth={width} strokeLinecap='round' fill='none'>
        {links.map(l => (
          <line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            strokeOpacity={opacity}
            vectorEffect='non-scaling-stroke'
          />
        ))}
        {links.map(l =>
          l.pulse ? (
            <line
              key={`${l.key}:pulse`}
              className='neuron-pulse'
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              vectorEffect='non-scaling-stroke'
              strokeDasharray={`${p.dash} ${l.length + p.dash}`}
              style={
                {
                  '--pulse-from': p.dash,
                  '--pulse-to': -l.length,
                  '--pulse-cycle': `${l.pulse.cycle}s`,
                  '--pulse-delay': `${-l.pulse.delay}s`,
                  '--pulse-opacity': p.opacity,
                } as React.CSSProperties
              }
            />
          ) : null
        )}
      </g>
    </svg>
  );
});

NeuronLinks.displayName = 'NeuronLinks';

export default NeuronLinks;
