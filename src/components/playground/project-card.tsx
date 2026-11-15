import React, { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { CARD_SIZE, getLayoutSeed, type GridMedia } from '@/components/playground/grid-data';
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

// Memoized card component to prevent unnecessary re-renders. Props are primitives plus stable references
// (the hasMoved ref and a shared onNavigate), so a card re-renders only when its own data changes.
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
    type: string;
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
    const inView = useInView(cardRef, IN_VIEW_ROOT_MARGIN);

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

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        // Only navigate if user didn't drag (clicked in place)
        if (!hasMoved.current && !('ontouchstart' in window)) {
          e.stopPropagation();
          onNavigate(projectId);
        }
      },
      [hasMoved, onNavigate, projectId]
    );

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        if (!hasMoved.current && 'ontouchstart' in window) {
          e.preventDefault();
          onNavigate(projectId);
        }
      },
      [hasMoved, onNavigate, projectId]
    );

    const drift = useMemo(() => driftStyle(cellRow, cellCol), [cellRow, cellCol]);

    return (
      <div
        ref={cardRef}
        className='group absolute'
        style={{
          left: baseX,
          top: baseY,
          width: CARD_SIZE,
          height: CARD_SIZE,
          zIndex: 1,
        }}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
      >
        {/* Float: x and y swing on separate CSS animations (playground.css), inside the positioned card so they
            never affect layout, panning or hit-testing logic. */}
        <div className='void-drift-x w-full h-full' style={drift}>
          <div className='void-drift-y w-full h-full'>
            <div
              className='relative w-full h-full overflow-hidden touch-manipulation'
              style={{
                // Disable transitions when page is not visible
                transition: isPageVisible ? 'transform 200ms' : 'none',
                WebkitMaskImage: CARD_MASK,
                maskImage: CARD_MASK,
              }}
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
              <div
                className='absolute inset-0 group-hover:bg-black/30'
                style={{
                  transition: isPageVisible ? 'background-color 500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                }}
              />
              <div
                className='absolute inset-0 flex flex-col justify-center items-starts text-white p-4 opacity-0 group-hover:opacity-100'
                style={{
                  transition: isPageVisible ? 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                }}
              >
                <h3 className='text-xl font-bold mb-1 text-center'>{header}</h3>
                <p className='text-md text-center opacity-90'>{type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
