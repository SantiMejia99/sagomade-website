import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { CARD_SIZE } from '@/components/playground/grid-data';
import { VOID, hash01 } from '@/components/playground/void-config';

const R = VOID.readout;

type Segment = { text: string; dim?: boolean };

// "LABEL ......... " padded to a fixed width so the values line up.
const leader = (label: string) => `${label} ${'.'.repeat(Math.max(1, R.labelWidth - label.length - 2))} `;

function readoutLines(projectId: number, header: string, year: string, touch: boolean): Segment[][] {
  return [
    [{ text: '> ', dim: true }, { text: `OPEN PROJECT_${String(projectId).padStart(2, '0')}` }],
    [{ text: header.toUpperCase() }],
    [{ text: leader('YEAR'), dim: true }, { text: year }],
    [{ text: touch ? '[TAP] ' : '[CLICK] ', dim: true }, { text: 'VIEW ' }],
  ];
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The terminal readout beside the active project. It types itself out once on mount (each character flickers through
 * a couple of retro glyphs, then resolves), driven by one rAF loop writing textContent through refs, so React does
 * not re-render per frame. `leaving` fades it out; the parent unmounts it after the fade.
 */
export default function TerminalReadout({
  projectId,
  header,
  year,
  side,
  touch,
  leaving,
}: {
  projectId: number;
  header: string;
  year: string;
  side: 'left' | 'right' | 'below';
  touch: boolean;
  leaving: boolean;
}) {
  const lines = useMemo(() => readoutLines(projectId, header, year, touch), [projectId, header, year, touch]);
  const segments = useMemo(() => lines.flat(), [lines]);
  const rootRef = useRef<HTMLDivElement>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Keep the whole readout on screen: lay out the full text once, measure where it lands (after the card's CRT
  // scale), and nudge it inside the viewport gutter. Runs before paint, so the measuring is never seen.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    segments.forEach((seg, i) => {
      const span = spanRefs.current[i];
      if (span) span.textContent = seg.text;
    });
    el.style.translate = '';
    const rect = el.getBoundingClientRect();
    const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1; // the card's CRT scale
    const g = R.viewportGutter;
    const clamp = (start: number, end: number, size: number) =>
      start < g ? g - start : end > size - g ? Math.max(g - start, size - g - end) : 0;
    const dx = clamp(rect.left, rect.right, window.innerWidth);
    const dy = clamp(rect.top, rect.bottom, window.innerHeight);
    if (dx || dy) el.style.translate = `${dx / scale}px ${dy / scale}px`;
  }, [segments, side]);

  useLayoutEffect(() => {
    const spans = spanRefs.current;
    const cursor = cursorRef.current;
    const finish = () => {
      segments.forEach((seg, i) => {
        if (spans[i]) spans[i]!.textContent = seg.text;
      });
      if (cursor) cursor.style.visibility = 'visible';
    };
    if (leaving || prefersReducedMotion()) {
      finish();
      return;
    }

    // Every character's reveal time, spread evenly over typeMs, in reading order.
    const chars: { seg: number; ch: string; at: number }[] = [];
    const total = segments.reduce((n, seg) => n + seg.text.length, 0);
    segments.forEach((seg, s) => {
      for (const ch of seg.text) chars.push({ seg: s, ch, at: (R.typeMs * (chars.length + 1)) / total });
    });
    const scrambleMs = R.scrambleSteps * R.glyphStepMs;
    const seed = Math.floor(performance.now() * 1000);
    const glyph = (i: number, step: number) => R.glyphs[Math.floor(hash01(seed, i, step) * R.glyphs.length)];

    if (cursor) cursor.style.visibility = 'hidden';
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;
      if (t >= R.typeMs) {
        finish(); // always lands exactly on the real text
        return;
      }
      const out = segments.map(() => '');
      chars.forEach(({ seg, ch, at }, i) => {
        if (t >= at || ch === ' ') {
          if (t >= at - scrambleMs) out[seg] += ch;
        } else if (t >= at - scrambleMs) {
          out[seg] += glyph(i, Math.floor((t - (at - scrambleMs)) / R.glyphStepMs));
        }
      });
      out.forEach((text, i) => {
        const span = spans[i];
        if (span && span.textContent !== text) span.textContent = text;
      });
      raf = requestAnimationFrame(frame);
    };
    frame(start);
    return () => cancelAnimationFrame(raf);
  }, [segments, leaving]);

  let index = 0;
  const distance = CARD_SIZE * (0.5 + R.offset);
  // Below: under the lifted rim plus a gap, centred (playground.css), its halo's top stopping at the rim.
  const belowTop = CARD_SIZE / 2 + (CARD_SIZE / 2) * VOID.hover.liftScale + R.belowGap;
  const position: React.CSSProperties =
    side === 'right' ? { left: distance } : side === 'left' ? { right: distance } : { top: belowTop };
  return (
    <div
      ref={rootRef}
      className='pg-readout'
      aria-hidden='true'
      data-side={side}
      data-leaving={leaving ? '' : undefined}
      style={position}
    >
      {lines.map((line, l) => (
        <div key={l}>
          {line.map(seg => {
            const i = index++;
            return (
              <span
                key={i}
                ref={el => {
                  spanRefs.current[i] = el;
                }}
                className={seg.dim ? 'pg-dim' : undefined}
              />
            );
          })}
          {l === lines.length - 1 && (
            <span ref={cursorRef} className='pg-cursor'>
              █
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
