import React, { useCallback, useRef, type RefObject } from 'react';
import { CARD_SIZE } from '@/components/playground/grid-data';
import { useLazyImage } from '@/components/playground/use-lazy-image';

// Start loading a card's image when it is within about one card of the viewport.
const LAZY_ROOT_MARGIN = `${CARD_SIZE}px`;

// Memoized card component to prevent unnecessary re-renders. Props are primitives plus stable references
// (the hasMoved ref and a shared onNavigate), so a card re-renders only when its own data changes.
const ProjectCard = React.memo(
  ({
    projectId,
    header,
    type,
    baseX,
    baseY,
    gif,
    isPageVisible,
    hasMoved,
    onNavigate,
  }: {
    projectId: number;
    header: string;
    type: string;
    baseX: number;
    baseY: number;
    gif: string | undefined;
    isPageVisible: boolean;
    // Read at event time, so the click-vs-drag check sees the live value rather than one captured at render.
    hasMoved: RefObject<boolean>;
    onNavigate: (projectId: number) => void;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isContentLoaded = useLazyImage(gif, cardRef, LAZY_ROOT_MARGIN);

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
        <div
          className='relative w-full h-full overflow-hidden touch-manipulation'
          style={{
            // Disable transitions when page is not visible
            transition: isPageVisible ? 'transform 200ms' : 'none',
            backgroundColor: '#0d0d0d',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at center, #000 60%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 65% 65% at center, #000 60%, transparent 100%)',
          }}
        >
          {gif && isContentLoaded ? (
            <div
              className='absolute inset-0 bg-cover bg-center'
              style={{
                backgroundImage: `url(${gif})`,
                aspectRatio: '1/1',
                width: '100%',
                height: '100%',
              }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 text-white text-3xl font-bold opacity-60'>
              {header?.[0] || '?'}
            </div>
          )}
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
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
