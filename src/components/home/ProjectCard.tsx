import React, { useCallback } from 'react';
import { CARD_SIZE } from '@/lib/home-grid';
import type { HomeProject } from '@/types';

interface ProjectCardProps {
  project: HomeProject;
  baseX: number;
  baseY: number;
  image: string | undefined;
  isContentLoaded: boolean;
  isPageVisible: boolean;
  /** True while/just after a drag, so the pointer-up of a drag isn't treated as a click. */
  hasMovedRef: React.RefObject<boolean>;
  onNavigate: () => void;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  baseX,
  baseY,
  image,
  isContentLoaded,
  isPageVisible,
  hasMovedRef,
  onNavigate,
}: ProjectCardProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only navigate if user didn't drag (clicked in place)
      if (!hasMovedRef.current && !('ontouchstart' in window)) {
        e.stopPropagation();
        onNavigate();
      }
    },
    [hasMovedRef, onNavigate]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!hasMovedRef.current && 'ontouchstart' in window) {
        e.preventDefault();
        onNavigate();
      }
    },
    [hasMovedRef, onNavigate]
  );

  return (
    <div
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
        {image && isContentLoaded ? (
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: `url(${image})`,
              aspectRatio: '1/1',
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 text-white text-3xl font-bold opacity-60'>
            {project.header?.[0] || '?'}
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
          <h3 className='text-xl font-bold mb-1 text-center'>{project.header}</h3>
          <p className='text-md text-center opacity-90'>{project.type}</p>
        </div>
      </div>
    </div>
  );
});

export default ProjectCard;
