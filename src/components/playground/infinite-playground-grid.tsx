import React, { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { transitionRef } from '@/components/transitionRef';
import { setActiveCard } from '@/components/playground/active-card';
import ProjectCard from '@/components/playground/project-card';
import { VOID } from '@/components/playground/void-config';
import '@/components/playground/playground.css';
import {
  CARD_SIZE,
  GRID_GAP,
  colorMap,
  getProjectMedia,
  getProjectIndex,
  projectsArray,
} from '@/components/playground/grid-data';

type Offset = { x: number; y: number };
type CellWindow = { startRow: number; startCol: number; rows: number; cols: number };

const CELL = CARD_SIZE + GRID_GAP;

// The halo's padding on the side facing the project stops at the lifted media's rim, so it can reach the media's
// transparent feather but never darken the lit project.
const HALO_NEAR = Math.max(
  0,
  Math.min(VOID.readout.haloPadding, VOID.readout.offset * CARD_SIZE - (CARD_SIZE / 2) * VOID.hover.liftScale)
);

// Hover and readout tunables (void-config.ts) as CSS custom properties for playground.css.
const HOVER_VARS = {
  '--pg-lift-scale': VOID.hover.liftScale,
  '--pg-lift-brightness': VOID.hover.liftBrightness,
  '--pg-dim-opacity': VOID.hover.dimOpacity,
  '--pg-hover-ms': `${VOID.hover.durationMs}ms`,
  '--pg-hover-ease': VOID.hover.easing,
  '--pg-readout-max-width': `${VOID.readout.maxWidth}px`,
  '--pg-readout-size': `${VOID.readout.fontSize}px`,
  '--pg-readout-tracking': VOID.readout.letterSpacing,
  '--pg-readout-leading': VOID.readout.lineHeight,
  '--pg-readout-bright': VOID.readout.bright,
  '--pg-readout-dim': VOID.readout.dim,
  '--pg-readout-fade-ms': `${VOID.readout.fadeOutMs}ms`,
  '--pg-cursor-ms': `${VOID.readout.cursorBlinkMs}ms`,
  '--pg-scan-period': `${VOID.crt.scanlinePeriod}px`,
  '--pg-scan-opacity': VOID.crt.scanlineOpacity,
  '--pg-crt-radius': `${VOID.crt.cornerRadius}px`,
  '--pg-crt-radius-phone': `${VOID.crt.cornerRadiusPhone}px`,
  '--pg-vignette': VOID.crt.vignette,
  '--pg-vignette-inset': VOID.crt.vignetteInset,
  '--pg-glass-opacity': VOID.crt.highlightOpacity,
  '--pg-halo-pad': `${VOID.readout.haloPadding}px`,
  '--pg-halo-near': `${HALO_NEAR}px`,
  '--pg-halo-opacity': VOID.readout.haloOpacity,
  '--pg-halo-falloff': VOID.readout.haloFalloff,
  '--pg-halo-in-ms': `${VOID.readout.haloFadeInMs}ms`,
} as React.CSSProperties;

// The CRT barrel draws cells up to k * r^3 * R closer to the centre than their grid position (R the half-diagonal,
// r up to ~1.15 for anything that can land on screen), so cells that far outside the viewport can be on screen. Mount
// them too, or they pop in visibly inside the edge as the window shifts.
function barrelMargin(width: number, height: number) {
  return Math.ceil(VOID.crt.k * 1.5 * Math.hypot(width / 2, height / 2));
}

// Inverse of the CRT barrel for a point on screen: where it sits in the undistorted plane (grid position + pan
// offset). Fixed-point iteration of q = c + (p - c)(1 - k r^2); converges in a few steps for small k.
function unbarrel(x: number, y: number, width: number, height: number): Offset {
  const cx = width / 2;
  const cy = height / 2;
  const r2Scale = 1 / (cx * cx + cy * cy);
  let px = x - cx;
  let py = y - cy;
  for (let i = 0; i < 4; i++) {
    const pull = 1 - VOID.crt.k * (px * px + py * py) * r2Scale;
    px = (x - cx) / pull;
    py = (y - cy) / pull;
  }
  return { x: px + cx, y: py + cy };
}

// The block of grid cells that covers the viewport at a given pan offset, with a one-cell buffer on each side plus
// the barrel margin.
function computeCellWindow(offset: Offset, width: number, height: number): CellWindow {
  const m = barrelMargin(width, height);
  const startRow = Math.floor((-offset.y - m) / CELL) - 1;
  const startCol = Math.floor((-offset.x - m) / CELL) - 1;
  const endRow = Math.floor((-offset.y + height + m) / CELL) + 1;
  const endCol = Math.floor((-offset.x + width + m) / CELL) + 1;
  return { startRow, startCol, rows: endRow - startRow + 1, cols: endCol - startCol + 1 };
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
  // The grid point (undistorted) under the pointer when a drag starts; see anchoredOffset.
  const grabPoint = useRef<Offset>({ x: 0, y: 0 });

  // Drag anchoring: remember which undistorted grid point is under the pointer at the start, then pan so that point
  // stays under the pointer (VOID.crt.anchorDrag). Without anchoring, the pan follows the raw pointer delta.
  const grabAt = (x: number, y: number): Offset => {
    const u = unbarrel(x, y, windowSizeRef.current.width, windowSizeRef.current.height);
    return { x: u.x - offsetRef.current.x, y: u.y - offsetRef.current.y };
  };
  const dragOffset = (start: Offset, grab: Offset, x: number, y: number, dx: number, dy: number): Offset => {
    if (!VOID.crt.anchorDrag) return { x: start.x + dx, y: start.y + dy };
    const u = unbarrel(x, y, windowSizeRef.current.width, windowSizeRef.current.height);
    return { x: u.x - grab.x, y: u.y - grab.y };
  };
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

  // CRT barrel: each mounted card's .pg-crt wrapper, with its card's undistorted centre in grid space. Refreshed
  // whenever the mounted cards change; applied whenever the pan offset or viewport changes.
  const crtCardsRef = useRef<{ el: HTMLElement; cx: number; cy: number }[]>([]);

  const applyCrt = useCallback(() => {
    const { k, k2 } = VOID.crt;
    const w = windowSizeRef.current.width;
    const h = windowSizeRef.current.height;
    const halfDiagonal = Math.hypot(w / 2, h / 2);
    const { x: ox, y: oy } = offsetRef.current;
    for (const { el, cx, cy } of crtCardsRef.current) {
      // Undistorted on-screen centre, relative to the viewport centre.
      const px = cx + ox - w / 2;
      const py = cy + oy - h / 2;
      const r2 = (px * px + py * py) / (halfDiagonal * halfDiagonal);
      const pull = 1 - k * r2; // centre moves to p * pull
      const scale = pull * (1 - k2 * r2);
      // 2D on purpose: translate3d would force a compositor layer per wrapper; the drift layers inside suffice.
      el.style.transform = `translate(${(px * (pull - 1)).toFixed(2)}px, ${(py * (pull - 1)).toFixed(2)}px) scale(${scale.toFixed(4)})`;
    }
  }, []);

  const applyTransform = useCallback(() => {
    if (innerRef.current) innerRef.current.style.transform = toTransform(offsetRef.current);
    applyCrt();
  }, [applyCrt]);

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

  // Hover effects pause while the grid is dragged (data-dragging, once a press passes the drag threshold) or still
  // gliding after a drag or wheel (data-moving, until the animation settles). Starting either clears the active card.
  const setMotionFlag = useCallback((flag: 'data-dragging' | 'data-moving', on: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    if (on) {
      el.setAttribute(flag, '');
      setActiveCard(null);
    } else {
      el.removeAttribute(flag);
    }
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
        setMotionFlag('data-dragging', false);
        setMotionFlag('data-moving', false);
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
  }, [applyTransform, syncCellWindow, setDragging, setMotionFlag]);

  // Debounced resize - only when visible
  useEffect(() => {
    if (!isPageVisible) return;

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
        syncCellWindow();
        applyCrt();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isPageVisible, syncCellWindow, applyCrt]);

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
        setMotionFlag('data-moving', false);
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
        if (!isDraggingRef.current) setMotionFlag('data-moving', false);
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
  }, [applyTransform, syncCellWindow, setMotionFlag]);

  // Pointer events - disabled when page not visible
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!isVisibleRef.current || e.button !== 0) return;
      setDragging(true);
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastOffset.current = offsetRef.current;
      grabPoint.current = grabAt(e.clientX, e.clientY);
      document.body.style.userSelect = 'none';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isVisibleRef.current || !dragStart.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Track if user has moved more than 3px (indicates drag intent, not click)
      if (!hasMoved.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        hasMoved.current = true;
        setMotionFlag('data-dragging', true);
        setMotionFlag('data-moving', true);
      }

      targetOffsetRef.current = dragOffset(lastOffset.current, grabPoint.current, e.clientX, e.clientY, dx, dy);
      ensureAnimLoop();
    };

    const handlePointerUp = (e: PointerEvent) => {
      // A tap or click on the empty void (not a drag) clears the active card.
      const target = e.target as Element | null;
      if (
        dragStart.current &&
        !hasMoved.current &&
        target &&
        containerRef.current?.contains(target) &&
        !target.closest('.pg-card')
      ) {
        setActiveCard(null);
      }
      setDragging(false);
      setMotionFlag('data-dragging', false);
      // If the grid is already still, hover can resume now; otherwise the animation clears data-moving on settling.
      if (!animatingRef.current) setMotionFlag('data-moving', false);
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
  }, [ensureAnimLoop, setDragging, setMotionFlag]);

  // Wheel - disabled when page not visible
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isVisibleRef.current) return;
      e.preventDefault();

      setMotionFlag('data-moving', true);
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
  }, [ensureAnimLoop, setMotionFlag]);

  // Touch - disabled when page not visible
  useEffect(() => {
    let touchStart = { x: 0, y: 0 };
    let touchStartOffset = { x: 0, y: 0 };
    let touchGrab = { x: 0, y: 0 };
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isVisibleRef.current || e.touches.length !== 1) return;
      isTouching = true;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartOffset = { ...offsetRef.current };
      touchGrab = grabAt(touchStart.x, touchStart.y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isVisibleRef.current || !isTouching || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      targetOffsetRef.current = dragOffset(touchStartOffset, touchGrab, touch.clientX, touch.clientY, dx, dy);
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

  // Keyboard focus: bring a focused card that is off-screen into view, and undo the scroll the browser applies to
  // this overflow-hidden container when focusing (panning is done with transforms, never scrolling).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleFocusIn = (e: FocusEvent) => {
      const card = (e.target as Element | null)?.closest?.('.pg-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const margin = CARD_SIZE / 2;
      const { innerWidth: w, innerHeight: h } = window;
      if (rect.left >= margin && rect.right <= w - margin && rect.top >= margin && rect.bottom <= h - margin) return;
      targetOffsetRef.current = {
        x: targetOffsetRef.current.x + (w / 2 - (rect.left + rect.width / 2)),
        y: targetOffsetRef.current.y + (h / 2 - (rect.top + rect.height / 2)),
      };
      ensureAnimLoop();
    };
    const handleScroll = () => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    };
    el.addEventListener('focusin', handleFocusIn);
    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('focusin', handleFocusIn);
      el.removeEventListener('scroll', handleScroll);
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
            cellRow={gridRow}
            cellCol={gridCol}
            header={project.header}
            type={project.type}
            baseX={gridCol * CELL}
            baseY={gridRow * CELL}
            media={getProjectMedia(project.id)}
            isPageVisible={isPageVisible}
            hasMoved={hasMoved}
            onNavigate={handleNavigate}
          />
        );
      }
    }

    return cardElements;
  }, [cellWindow, isPageVisible, handleNavigate]);

  // New cards mounted (or the window shifted): re-cache their CRT wrappers and curve them before paint.
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    crtCardsRef.current = Array.from(inner.querySelectorAll<HTMLElement>('.pg-crt')).map(el => {
      const card = el.parentElement as HTMLElement;
      return { el, cx: card.offsetLeft + CARD_SIZE / 2, cy: card.offsetTop + CARD_SIZE / 2 };
    });
    applyCrt();
  }, [cards, applyCrt]);

  return (
    <div
      ref={containerRef}
      className='pg-grid fixed inset-0 w-screen h-screen overflow-hidden select-none z-0'
      style={{
        // Explicit, so the void matches the videos' baked background exactly.
        backgroundColor: VOID.background,
        ...HOVER_VARS,
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
        // The glass: scanlines, a faint highlight, edge shading and rounded corners, all on one static element
        // (playground.css). Above the grid, below the nav.
        aria-hidden='true'
        className='pg-screen'
      />
    </div>
  );
}
