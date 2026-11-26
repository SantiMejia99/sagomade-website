import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '@/components/home/ProjectCard';
import homeProjects from '@/data/homeProjects.json';
import { homeProjectImages } from '@/data/homeProjectImages';
import { CELL_SIZE, getProjectIndex } from '@/lib/home-grid';
import { navigateWithTransition } from '@/lib/page-transition';
import type { HomeProject } from '@/types';

const projects: HomeProject[] = homeProjects;

/**
 * Full-screen, endlessly pannable grid of project tiles (drag, wheel or touch).
 * Only the tiles intersecting the viewport (plus a 1-tile margin) are rendered.
 */
export default function InfiniteProjectGrid({ loadedContent }: { loadedContent: Set<string> }) {
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

    let timeoutId: ReturnType<typeof setTimeout>;
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
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Memoized cards - only recalculate when page is visible
  const cards = useMemo(() => {
    // Don't render cards if page is not visible (saves memory and CPU)
    if (!isPageVisible) return [];

    const cardElements: React.ReactNode[] = [];
    const startRow = Math.floor(-offset.y / CELL_SIZE) - 1;
    const startCol = Math.floor(-offset.x / CELL_SIZE) - 1;

    const visibleRows = Math.ceil(windowSize.height / CELL_SIZE) + 2;
    const visibleCols = Math.ceil(windowSize.width / CELL_SIZE) + 2;

    for (let row = 0; row < visibleRows; row++) {
      for (let col = 0; col < visibleCols; col++) {
        // Use seeded random to get a consistent random project for each grid position
        const gridRow = startRow + row;
        const gridCol = startCol + col;
        const project = projects[getProjectIndex(gridRow, gridCol, projects.length)];
        const baseX = gridCol * CELL_SIZE;
        const baseY = gridRow * CELL_SIZE;

        const image = homeProjectImages[project.id];
        const isContentLoaded = image ? loadedContent.has(image) : true;

        cardElements.push(
          <ProjectCard
            key={`${gridRow}-${gridCol}`}
            project={project}
            baseX={baseX}
            baseY={baseY}
            image={image}
            isContentLoaded={isContentLoaded}
            isPageVisible={isPageVisible}
            hasMovedRef={hasMoved}
            onNavigate={() => navigateWithTransition(() => navigate(`/projects/${project.id}`))}
          />
        );
      }
    }

    return cardElements;
  }, [offset.x, offset.y, windowSize, loadedContent, isPageVisible, navigate]);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 w-screen h-screen overflow-hidden select-none bg-background z-0'
      style={{
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
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
