import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { transitionRef } from '@/components/transitionRef';
import ProjectCard from '@/components/playground/project-card';
import {
  CARD_SIZE,
  GRID_GAP,
  colorMap,
  getProjectGif,
  getProjectIndex,
  projectsArray,
} from '@/components/playground/grid-data';

type Offset = { x: number; y: number };
type CellWindow = { startRow: number; startCol: number; rows: number; cols: number };

const CELL = CARD_SIZE + GRID_GAP;

// The block of grid cells that covers the viewport at a given pan offset, with a one-cell buffer on each side.
function computeCellWindow(offset: Offset, width: number, height: number): CellWindow {
  return {
    startRow: Math.floor(-offset.y / CELL) - 1,
    startCol: Math.floor(-offset.x / CELL) - 1,
    rows: Math.ceil(height / CELL) + 2,
    cols: Math.ceil(width / CELL) + 2,
  };
}

function sameCellWindow(a: CellWindow, b: CellWindow) {
  return a.startRow === b.startRow && a.startCol === b.startCol && a.rows === b.rows && a.cols === b.cols;
}

function toTransform(offset: Offset) {
  return `translate3d(${offset.x}px, ${offset.y}px, 0)`;
}

export default function InfinitePlaygroundGrid() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  // The pan offset lives in refs only; the rAF loop writes it straight to the DOM.
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });
  const lastOffset = useRef<Offset>(offsetRef.current);
  const targetOffsetRef = useRef<Offset>(offsetRef.current);
  const rafIdRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const windowSizeRef = useRef({ width: window.innerWidth, height: window.innerHeight });
  const isVisibleRef = useRef(!document.hidden);
  const isDraggingRef = useRef(false);
  const hasMoved = useRef(false);

  // React state only tracks which cells are mounted, so it changes only when a row or column crosses an edge.
  const [cellWindow, setCellWindow] = useState<CellWindow>(() =>
    computeCellWindow(offsetRef.current, windowSizeRef.current.width, windowSizeRef.current.height)
  );
  const cellWindowRef = useRef(cellWindow);

  const applyTransform = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = toTransform(offsetRef.current);
  }, []);

  // Recompute the visible cell window and re-render only if it changed. From the animation loop, `sync`
  // flushes the render inside the current frame so newly exposed cells appear together with the transform.
  const syncCellWindow = useCallback((sync = false) => {
    const next = computeCellWindow(offsetRef.current, windowSizeRef.current.width, windowSizeRef.current.height);
    if (sameCellWindow(next, cellWindowRef.current)) return;
    cellWindowRef.current = next;
    if (sync) flushSync(() => setCellWindow(next));
    else setCellWindow(next);
  }, []);

  const setDragging = useCallback((dragging: boolean) => {
    isDraggingRef.current = dragging;
    if (containerRef.current) containerRef.current.style.cursor = dragging ? 'grabbing' : 'grab';
  }, []);

  // Set the initial transform before the first paint.
  useLayoutEffect(() => {
    applyTransform();
  }, [applyTransform]);

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
        setDragging(false);
        dragStart.current = null;
        document.body.style.userSelect = '';

        // Snap to target position immediately (no animation)
        offsetRef.current = targetOffsetRef.current;
        applyTransform();
        syncCellWindow();
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
  }, [applyTransform, syncCellWindow, setDragging]);

  // Debounced resize - only when visible
  useEffect(() => {
    if (!isPageVisible) return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
        syncCellWindow();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isPageVisible, syncCellWindow]);

  const ensureAnimLoop = useCallback(() => {
    // Don't start animation if page is not visible
    if (animatingRef.current || !isVisibleRef.current) return;
    animatingRef.current = true;

    // Move the grid and, only when a row or column crosses an edge, mount the new cells in the same frame.
    const commit = (next: Offset) => {
      offsetRef.current = next;
      applyTransform();
      syncCellWindow(true);
    };

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
          commit({ x: target.x, y: target.y });
        }
        animatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const alpha = isDraggingRef.current ? 0.3 : 0.15;
      commit({
        x: current.x + dx * alpha,
        y: current.y + dy * alpha,
      });
      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [applyTransform, syncCellWindow]);

  // Pointer events - disabled when page not visible
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!isVisibleRef.current || e.button !== 0) return;
      setDragging(true);
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
      setDragging(false);
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
  }, [ensureAnimLoop, setDragging]);

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

  // One stable navigate callback shared by every card, so React.memo on ProjectCard holds.
  const handleNavigate = useCallback(
    (projectId: number) => {
      transitionRef.current?.navigate(() => navigate(`/projects/${projectId}`), colorMap[projectId] ?? '#0d0d0d');
    },
    [navigate]
  );

  // Memoized cards - rebuilt only when the visible cell window changes
  const cards = useMemo(() => {
    // Don't render cards if page is not visible (saves memory and CPU)
    if (!isPageVisible) return [];

    const cardElements: React.ReactNode[] = [];
    const { startRow, startCol, rows, cols } = cellWindow;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Use seeded random to get a consistent random project for each grid position
        const gridRow = startRow + row;
        const gridCol = startCol + col;
        const projIdx = getProjectIndex(gridRow, gridCol, projectsArray.length);
        const project = projectsArray[projIdx];

        cardElements.push(
          <ProjectCard
            key={`${gridRow}-${gridCol}`}
            projectId={project.id}
            header={project.header}
            type={project.type}
            baseX={gridCol * CELL}
            baseY={gridRow * CELL}
            gif={getProjectGif(project.id)}
            isPageVisible={isPageVisible}
            hasMoved={hasMoved}
            onNavigate={handleNavigate}
          />
        );
      }
    }

    return cardElements;
  }, [cellWindow, isPageVisible, handleNavigate]);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 w-screen h-screen overflow-hidden select-none bg-background z-0'
      style={{
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        // Updated imperatively while dragging; see setDragging.
        cursor: 'grab',
      }}
    >
      <div
        ref={innerRef}
        style={{
          // transform is written directly by the animation loop, not through React.
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
