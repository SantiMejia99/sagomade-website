import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import projects from '../app/dashboard/data.json';
import LoadingScreenV2 from '../components/LoadingScreen-v2';

const projectsArray = Object.values(projects);

const CARD_SIZE = 240;
const GRID_GAP = 24;

const gifMap: Record<number, string> = {
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

function getProjectGif(id: number) {
  return gifMap[id] || undefined;
}

// Seeded random function for consistent randomization
function seededRandom(seed: number): number {
  let hash = seed * 2654435761;
  hash = (hash ^ (hash >>> 16)) * 0x85ebca6b;
  hash = (hash ^ (hash >>> 13)) * 0xc2b2ae35;
  hash = hash ^ (hash >>> 16);
  return Math.abs(hash) / 2147483647;
}

// Get project index ensuring even distribution with no adjacent duplicates
function getProjectIndex(row: number, col: number, projectsLength: number): number {
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

// Memoized card component to prevent unnecessary re-renders
const ProjectCard = React.memo(
  ({
    project,
    baseX,
    baseY,
    gif,
    isContentLoaded,
    isPageVisible,
    hasMoved,
    onNavigate,
  }: {
    project: any;
    baseX: number;
    baseY: number;
    gif: string | undefined;
    isContentLoaded: boolean;
    isDragging: boolean;
    isPageVisible: boolean;
    hasMoved: boolean;
    onNavigate: () => void;
  }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        // Only navigate if user didn't drag (clicked in place)
        if (!hasMoved && !('ontouchstart' in window)) {
          e.stopPropagation();
          onNavigate();
        }
      },
      [hasMoved, onNavigate]
    );

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        if (!hasMoved && 'ontouchstart' in window) {
          e.preventDefault();
          onNavigate();
        }
      },
      [hasMoved, onNavigate]
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
          className='relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 shadow-md cursor-pointer touch-manipulation'
          style={{
            // Disable transitions when page is not visible
            transition: isPageVisible ? 'transform 200ms' : 'none',
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
              {project.header?.[0] || '?'}
            </div>
          )}
          <div
            className='absolute inset-0 group-hover:bg-black/30'
            style={{
              transition: isPageVisible ? 'all 200ms' : 'none',
            }}
          />
          <div
            className='absolute inset-0 flex flex-col justify-center items-starts text-white p-4 opacity-0 group-hover:opacity-100'
            style={{
              transition: isPageVisible ? 'all 200ms' : 'none',
            }}
          >
            <h3 className='text-xl font-bold mb-1 text-center'>{project.header}</h3>
            <p className='text-md text-center opacity-90'>{project.type}</p>
          </div>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

function InfinitePlaygroundGrid({ loadedContent }: { loadedContent: Set<string> }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lastOffset = useRef(offset);
  const targetOffsetRef = useRef(offset);
  const rafIdRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const offsetRef = useRef(offset);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const isVisibleRef = useRef(!document.hidden);
  const isDraggingRef = useRef(false);
  const hasMoved = useRef(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Comprehensive page visibility handling - stops everything when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      isVisibleRef.current = visible;
      setIsPageVisible(visible);

      if (!visible) {
        // Cancel animation frame
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          animatingRef.current = false;
        }

        // Reset dragging state
        setIsDragging(false);
        dragStart.current = null;
        document.body.style.userSelect = '';

        // Snap to target position immediately (no animation)
        const target = targetOffsetRef.current;
        offsetRef.current = target;
        setOffset(target);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for focus/blur as backup
    const handleBlur = () => {
      if (!document.hidden) return; // Only if also hidden
      isVisibleRef.current = false;
      setIsPageVisible(false);

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        animatingRef.current = false;
      }
    };

    const handleFocus = () => {
      if (document.hidden) return; // Only if not hidden
      isVisibleRef.current = true;
      setIsPageVisible(true);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Debounced resize - only when visible
  useEffect(() => {
    if (!isPageVisible) return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isPageVisible]);

  const ensureAnimLoop = useCallback(() => {
    // Don't start animation if page is not visible
    if (animatingRef.current || !isVisibleRef.current) return;
    animatingRef.current = true;

    const step = () => {
      // Stop immediately if page becomes hidden
      if (!isVisibleRef.current) {
        animatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const current = offsetRef.current;
      const target = targetOffsetRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.5) {
        if (dx !== 0 || dy !== 0) {
          const snapped = { x: target.x, y: target.y };
          offsetRef.current = snapped;
          setOffset(snapped);
        }
        animatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const alpha = isDraggingRef.current ? 0.3 : 0.15;
      const next = {
        x: current.x + dx * alpha,
        y: current.y + dy * alpha,
      };
      offsetRef.current = next;
      setOffset(next);
      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, []);

  // Pointer events - disabled when page not visible
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!isVisibleRef.current || e.button !== 0) return;
      setIsDragging(true);
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastOffset.current = offsetRef.current;
      document.body.style.userSelect = 'none';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isVisibleRef.current || !dragStart.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Track if user has moved more than 3px (indicates drag intent, not click)
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }

      targetOffsetRef.current = {
        x: lastOffset.current.x + dx,
        y: lastOffset.current.y + dy,
      };
      ensureAnimLoop();
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragStart.current = null;
      document.body.style.userSelect = '';
      // Reset hasMoved after a short delay to prevent click
      setTimeout(() => {
        hasMoved.current = false;
      }, 50);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = '';
    };
  }, [ensureAnimLoop]);

  // Wheel - disabled when page not visible
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isVisibleRef.current) return;
      e.preventDefault();

      const deltaX = e.deltaX * 1.1;
      const deltaY = e.deltaY * 1.1;
      targetOffsetRef.current = {
        x: targetOffsetRef.current.x - deltaX,
        y: targetOffsetRef.current.y - deltaY,
      };
      ensureAnimLoop();
    };

    const ref = containerRef.current;
    if (ref) ref.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (ref) ref.removeEventListener('wheel', handleWheel);
    };
  }, [ensureAnimLoop]);

  // Touch - disabled when page not visible
  useEffect(() => {
    let touchStart = { x: 0, y: 0 };
    let touchStartOffset = { x: 0, y: 0 };
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isVisibleRef.current || e.touches.length !== 1) return;
      isTouching = true;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartOffset = { ...offsetRef.current };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isVisibleRef.current || !isTouching || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      targetOffsetRef.current = {
        x: touchStartOffset.x + dx,
        y: touchStartOffset.y + dy,
      };
      ensureAnimLoop();
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener('touchstart', handleTouchStart, { passive: true });
      ref.addEventListener('touchmove', handleTouchMove, { passive: false });
      ref.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (ref) {
        ref.removeEventListener('touchstart', handleTouchStart);
        ref.removeEventListener('touchmove', handleTouchMove);
        ref.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [ensureAnimLoop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Memoized cards - only recalculate when page is visible
  const cards = useMemo(() => {
    // Don't render cards if page is not visible (saves memory and CPU)
    if (!isPageVisible) return [];

    const cardElements: React.ReactNode[] = [];
    const startRow = Math.floor(-offset.y / (CARD_SIZE + GRID_GAP)) - 1;
    const startCol = Math.floor(-offset.x / (CARD_SIZE + GRID_GAP)) - 1;

    const visibleRows = Math.ceil(windowSize.height / (CARD_SIZE + GRID_GAP)) + 2;
    const visibleCols = Math.ceil(windowSize.width / (CARD_SIZE + GRID_GAP)) + 2;

    for (let row = 0; row < visibleRows; row++) {
      for (let col = 0; col < visibleCols; col++) {
        // Use seeded random to get a consistent random project for each grid position
        const gridRow = startRow + row;
        const gridCol = startCol + col;
        const projIdx = getProjectIndex(gridRow, gridCol, projectsArray.length);
        const project = projectsArray[projIdx];
        const baseX = gridCol * (CARD_SIZE + GRID_GAP);
        const baseY = gridRow * (CARD_SIZE + GRID_GAP);

        const gif = getProjectGif(project.id);
        const isContentLoaded = gif ? loadedContent.has(gif) : true;

        cardElements.push(
          <ProjectCard
            key={`${gridRow}-${gridCol}`}
            project={project}
            baseX={baseX}
            baseY={baseY}
            gif={gif}
            isContentLoaded={isContentLoaded}
            isDragging={isDragging}
            isPageVisible={isPageVisible}
            hasMoved={hasMoved.current}
            onNavigate={() => navigate(`/projects/${project.id}`)}
          />
        );
      }
    }

    return cardElements;
  }, [offset.x, offset.y, windowSize, loadedContent, isDragging, isPageVisible, navigate]);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 w-screen h-screen overflow-hidden select-none bg-background z-0'
      style={{
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
      }}
    >
      <div
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          // Only use willChange when page is visible
          willChange: isPageVisible ? 'transform' : 'auto',
        }}
      >
        {cards}
      </div>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          zIndex: 5,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)',
          boxShadow: 'inset 0 0 180px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}

export default function Home() {
  const [loadedContent, setLoadedContent] = useState<Set<string>>(new Set());
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [showLoading, setShowLoading] = useState(true);
  const [hasSeenLoading, setHasSeenLoading] = useState(false);

  // Check if user has already seen the loading screen in this session
  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenHomeLoading');
    if (seen === 'true') {
      setShowLoading(false);
      setHasSeenLoading(true);
    }
  }, []);

  // Track page visibility at the top level too
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Preload images (for cards that appear after loading screen)
  useEffect(() => {
    if (!isPageVisible || hasSeenLoading) return;

    const preload = () => {
      Object.values(gifMap).forEach(src => {
        const img = new Image();
        img.onload = () => {
          setLoadedContent(prev => new Set([...prev, src]));
        };
        img.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload);
    } else {
      setTimeout(preload, 100);
    }
  }, [isPageVisible, hasSeenLoading]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    sessionStorage.setItem('hasSeenHomeLoading', 'true');
  };

  return (
    <div className='bg-background'>
      {showLoading && <LoadingScreenV2 onComplete={handleLoadingComplete} />}{' '}
      <InfinitePlaygroundGrid loadedContent={loadedContent} />
    </div>
  );
}
