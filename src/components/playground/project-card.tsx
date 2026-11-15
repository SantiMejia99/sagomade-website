import React, { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { CARD_SIZE, getLayoutSeed, type GridMedia } from '@/components/playground/grid-data';
import { getActiveCard, setActiveCard, useIsActiveCard } from '@/components/playground/active-card';
import TerminalReadout from '@/components/playground/terminal-readout';
import { useInView } from '@/components/playground/use-in-view';
import { VOID, hash01 } from '@/components/playground/void-config';

// Start loading (and playing) a card's media when it is within about one card of the viewport.
const IN_VIEW_ROOT_MARGIN = `${CARD_SIZE}px`;

// The media is opaque out to VOID.maskSolid of the card's half-size and fades to nothing exactly at the card edge.
const CARD_MASK = `radial-gradient(closest-side at center, #000 ${VOID.maskSolid * 100}%, transparent 100%)`;

// Per-cell float parameters as CSS custom properties for playground.css; stable for a cell within a session.
function driftStyle(row: number, col: number): React.CSSProperties {
  const d = VOID.drift;
  const seed = getLayoutSeed();
  const pick = (salt: number, min: number, max: number) => min + (max - min) * hash01(seed, salt, row, col);
  const xDur = pick(11, d.halfPeriodMin, d.halfPeriodMax);
  const yDur = pick(12, d.halfPeriodMin, d.halfPeriodMax);
  return {
    '--drift-x-amp': `${pick(13, d.ampMin, d.ampMax).toFixed(2)}px`,
    '--drift-y-amp': `${pick(14, d.ampMin, d.ampMax).toFixed(2)}px`,
    '--drift-x-dur': `${xDur.toFixed(2)}s`,
    '--drift-y-dur': `${yDur.toFixed(2)}s`,
    // Negative delays start each cell part-way through its loop.
    '--drift-x-delay': `${(-2 * xDur * hash01(seed, 15, row, col)).toFixed(2)}s`,
    '--drift-y-delay': `${(-2 * yDur * hash01(seed, 16, row, col)).toFixed(2)}s`,
  } as React.CSSProperties;
}

const R = VOID.readout;

// No hover effects while the grid is dragged or still gliding (attributes set by the grid).
function motionBlocked(card: HTMLElement | null) {
  const grid = card?.closest('.pg-grid');
  return !!grid && (grid.hasAttribute('data-dragging') || grid.hasAttribute('data-moving'));
}

// Memoized card component to prevent unnecessary re-renders. Props are primitives plus stable references
// (the hasMoved ref and a shared onNavigate), so a card re-renders only when its own data changes, or when it gains
// or loses the active (hover / focus / first-tap) state.
const ProjectCard = React.memo(
  ({
    projectId,
    cellRow,
    cellCol,
    header,
    type,
    baseX,
    baseY,
    media,
    isPageVisible,
    hasMoved,
    onNavigate,
  }: {
    projectId: number;
    cellRow: number;
    cellCol: number;
    header: string;
    type: string; // the project's year
    baseX: number;
    baseY: number;
    // Same object per project id (see getProjectMedia), so it does not break memoization.
    media: GridMedia | undefined;
    isPageVisible: boolean;
    // Read at event time, so the click-vs-drag check sees the live value rather than one captured at render.
    hasMoved: RefObject<boolean>;
    onNavigate: (projectId: number) => void;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRef = useRef<HTMLDivElement>(null);
    // Observe the media (where the card is actually drawn, after the CRT barrel), against the grid container (whose
    // overflow clip would otherwise swallow the margin), so videos start before they come into view.
    const inView = useInView(mediaRef, IN_VIEW_ROOT_MARGIN, '.pg-grid');
    const key = `${cellRow}:${cellCol}`;
    const isActive = useIsActiveCard(key);
    // Which side the readout floats on and whether it says [TAP], fixed when the card activates. It stays set while
    // the readout fades out after deactivation, then clears.
    const [readout, setReadout] = useState<{ side: 'left' | 'right'; touch: boolean } | null>(null);

    // Latches true the first time the card comes near the viewport: video sources are attached only from then on.
    const [activated, setActivated] = useState(false);
    if (inView && !activated) setActivated(true);

    // Play while near the viewport and the tab is visible; pause otherwise.
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !activated) return;
      if (inView && isPageVisible) {
        // Rejections (autoplay policy, or a pause() that interrupts the pending play) are expected and harmless.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, [activated, inView, isPageVisible]);

    // After deactivation, keep the readout mounted for its fade-out, then remove it.
    useEffect(() => {
      if (isActive || !readout) return;
      const timer = setTimeout(() => setReadout(null), R.fadeOutMs);
      return () => clearTimeout(timer);
    }, [isActive, readout]);

    const activate = useCallback(
      (touch: boolean) => {
        const rect = cardRef.current?.getBoundingClientRect();
        const side = rect && rect.right > window.innerWidth - R.flipMargin ? 'left' : 'right';
        setReadout({ side, touch });
        setActiveCard(key);
      },
      [key]
    );

    // Mouse and pen: hovering activates. pointermove re-activates after the grid settles under a still pointer.
    const handlePointerOver = useCallback(
      (e: React.PointerEvent) => {
        if (e.pointerType === 'touch' || getActiveCard() === key || motionBlocked(cardRef.current)) return;
        activate(false);
      },
      [activate, key]
    );

    const handlePointerLeave = useCallback(
      (e: React.PointerEvent) => {
        if (e.pointerType !== 'touch' && getActiveCard() === key) setActiveCard(null);
      },
      [key]
    );

    // Mouse click navigates (touch taps are handled in touchend, which suppresses the click).
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (hasMoved.current) return;
        e.stopPropagation();
        onNavigate(projectId);
      },
      [hasMoved, onNavigate, projectId]
    );

    // Touch: the first tap activates, a second tap on the active card navigates.
    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        if (hasMoved.current) return;
        e.preventDefault();
        if (getActiveCard() === key) onNavigate(projectId);
        else activate(true);
      },
      [activate, hasMoved, key, onNavigate, projectId]
    );

    // Keyboard: focus activates (only for keyboard focus, not the focus a mouse press gives), Enter navigates.
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        if (e.currentTarget.matches(':focus-visible') && getActiveCard() !== key) activate(false);
      },
      [activate, key]
    );

    const handleBlur = useCallback(() => {
      if (getActiveCard() === key) setActiveCard(null);
    }, [key]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        onNavigate(projectId);
      },
      [onNavigate, projectId]
    );

    const drift = useMemo(() => driftStyle(cellRow, cellCol), [cellRow, cellCol]);

    return (
      <div
        ref={cardRef}
        className='pg-card absolute'
        data-active={isActive ? '' : undefined}
        role='link'
        tabIndex={0}
        aria-label={`${header}, ${type}`}
        style={{
          left: baseX,
          top: baseY,
          width: CARD_SIZE,
          height: CARD_SIZE,
          // Above its neighbours while its readout is showing (or fading).
          zIndex: readout ? 3 : 1,
        }}
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerOver}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        {/* CRT barrel: the grid writes this wrapper's transform (pull toward the screen centre and shrink) as it
            pans. Float: x and y swing on separate CSS animations (playground.css), inside it. */}
        <div className='pg-crt w-full h-full'>
          <div className='void-drift-x w-full h-full' style={drift}>
            <div className='void-drift-y relative w-full h-full'>
              {/* The media: masked to feather into the void; lifts or dims via playground.css. */}
              <div
                ref={mediaRef}
                className='pg-media relative w-full h-full overflow-hidden touch-manipulation'
                style={{ WebkitMaskImage: CARD_MASK, maskImage: CARD_MASK }}
              >
                {media ? (
                  // object-fit: cover, centered, fills the square card like the original artwork. The poster shows
                  // until the first frame; sources are attached only once activated, so preload='none' fetches nothing
                  // before then. Source order lets each browser pick a format it hardware-decodes.
                  <video
                    ref={videoRef}
                    className='absolute inset-0 w-full h-full object-cover object-center'
                    poster={media.poster}
                    muted
                    loop
                    playsInline
                    preload='none'
                    disablePictureInPicture
                    disableRemotePlayback
                    aria-hidden='true'
                  >
                    {activated && (
                      <>
                        {/* Codecs match the encodes: VP9 profile 0, and H.264 High@L3.0 (avc1.64001E). */}
                        <source src={media.webm} type='video/webm; codecs="vp9"' />
                        <source src={media.mp4} type='video/mp4; codecs="avc1.64001E"' />
                      </>
                    )}
                  </video>
                ) : null}
              </div>
              {/* Outside the mask, inside the drift: floats with the project, unfaded. */}
              {readout && (
                <TerminalReadout
                  projectId={projectId}
                  header={header}
                  year={type}
                  side={readout.side}
                  touch={readout.touch}
                  leaving={!isActive}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
