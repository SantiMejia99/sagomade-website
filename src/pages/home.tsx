import React, { useEffect, useRef, useState } from 'react';
import projects from '../app/dashboard/data.json';

const CARD_SIZE = 240; // px, including margin/gap
const GRID_GAP = 24; // px
const VISIBLE_ROWS = 5;
const VISIBLE_COLS = 6;
const BLUR_MAX = 3;

const gifMap: Record<number, string> = {
  1: '/gifs/consultation-notice.gif',
  2: '/gifs/espacio-ideal.gif',
  3: '/gifs/wine-bottles.gif',
  4: '/gifs/beer-bottles.gif',
  5: '/gifs/standing-desk.gif',
  6: '/gifs/poss-magazine.gif',
  7: '/gifs/running-shirt.gif',
  8: '/gifs/green-standards-toolkit.gif',
  9: '/gifs/tote-bag.gif',
  10: '/gifs/paradigm-shift.gif',
};

function getProjectGif(id: number) {
  return gifMap[id] || undefined;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function InfinitePlaygroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lastOffset = useRef(offset);
  const [blur, setBlur] = useState(0);
  const lastMove = useRef(Date.now());
  const lastPos = useRef(offset);

  // Enhanced mouse drag-to-pan
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastOffset.current = offset;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging || !dragStart.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      setOffset({
        x: lastOffset.current.x + dx,
        y: lastOffset.current.y + dy,
      });

      // Enhanced motion blur based on mouse speed
      const now = Date.now();
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = now - lastMove.current;
      const speed = dist / (dt || 1);
      setBlur(Math.min(BLUR_MAX, speed * 0.25));
      lastMove.current = now;
      lastPos.current = { x: dx, y: dy };
    }

    function onPointerUp() {
      setIsDragging(false);
      dragStart.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setTimeout(() => setBlur(0), 120);
    }

    // Handle mouse leave to prevent stuck dragging
    function onMouseLeave() {
      if (isDragging) {
        setIsDragging(false);
        dragStart.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setTimeout(() => setBlur(0), 120);
      }
    }

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDragging, offset]);

  // Enhanced wheel-to-pan with smooth scrolling
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault(); // Prevent browser navigation on horizontal swipe

      // Smooth wheel scrolling with momentum
      const deltaX = e.deltaX * 1.2; // Slightly faster horizontal scrolling
      const deltaY = e.deltaY * 1.2;

      setOffset(prev => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY,
      }));

      // Enhanced motion blur based on wheel speed
      const wheelSpeed = Math.abs(deltaX) + Math.abs(deltaY);
      setBlur(Math.min(BLUR_MAX, wheelSpeed * 0.08));
      setTimeout(() => setBlur(0), 100);
    }

    const ref = containerRef.current;
    if (ref) ref.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (ref) ref.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Enhanced touch handling for mobile
  useEffect(() => {
    let touchStart = { x: 0, y: 0 };
    let touchStartOffset = { x: 0, y: 0 };
    let isTouching = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      isTouching = true;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartOffset = { ...offset };
      document.body.style.cursor = 'grabbing';
    }

    function onTouchMove(e: TouchEvent) {
      if (!isTouching || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      setOffset({
        x: touchStartOffset.x + dx,
        y: touchStartOffset.y + dy,
      });

      // Motion blur for touch
      const now = Date.now();
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = now - lastMove.current;
      const speed = dist / (dt || 1);
      setBlur(Math.min(BLUR_MAX, speed * 0.2));
      lastMove.current = now;
      lastPos.current = { x: dx, y: dy };
    }

    function onTouchEnd() {
      isTouching = false;
      document.body.style.cursor = '';
      setTimeout(() => setBlur(0), 100);
    }

    const ref = containerRef.current;
    if (ref) {
      ref.addEventListener('touchstart', onTouchStart, { passive: true });
      ref.addEventListener('touchmove', onTouchMove, { passive: false });
      ref.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    return () => {
      if (ref) {
        ref.removeEventListener('touchstart', onTouchStart);
        ref.removeEventListener('touchmove', onTouchMove);
        ref.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [offset]);

  // Calculate visible grid
  const cards: React.ReactNode[] = [];
  const startRow = Math.floor(-offset.y / (CARD_SIZE + GRID_GAP)) - 2;
  const startCol = Math.floor(-offset.x / (CARD_SIZE + GRID_GAP)) - 2;
  for (let row = 0; row < VISIBLE_ROWS + 4; row++) {
    for (let col = 0; col < VISIBLE_COLS + 4; col++) {
      const projIdx = mod((startRow + row) * VISIBLE_COLS + (startCol + col), projects.length);
      const project = projects[projIdx];
      const x = (startCol + col) * (CARD_SIZE + GRID_GAP) + offset.x;
      const y = (startRow + row) * (CARD_SIZE + GRID_GAP) + offset.y;
      cards.push(
        <div
          key={`${row}-${col}-${project.id}`}
          className='group absolute'
          style={{
            left: x,
            top: y,
            width: CARD_SIZE,
            height: CARD_SIZE,
            transition: 'box-shadow 0.3s, transform 0.3s',
            zIndex: 1,
          }}
          onClick={() => {
            // Only navigate if not dragging and not on touch devices
            if (!isDragging && !('ontouchstart' in window)) {
              window.location.href = `/projects/${project.id}`;
            }
          }}
          onTouchEnd={e => {
            // Handle touch navigation for mobile devices
            if (!isDragging && 'ontouchstart' in window) {
              e.preventDefault();
              window.location.href = `/projects/${project.id}`;
            }
          }}
        >
          {/* Card content */}
          <div className='relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 shadow-md group-hover:scale-110 group-hover:z-10 group-hover:shadow-2xl transition-transform duration-300 cursor-pointer touch-manipulation'>
            {getProjectGif(project.id) ? (
              <div
                className='absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110'
                style={{ backgroundImage: `url(${getProjectGif(project.id)})` }}
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 text-white text-3xl font-bold opacity-60'>
                {project.header?.[0] || '?'}
              </div>
            )}
            <div className='absolute inset-0 group-hover:bg-black/40 transition-all duration-500' />
            <div className='absolute inset-0 flex flex-col justify-center items-center text-white p-6 opacity-0 group-hover:opacity-100 transition-all duration-400'>
              <h3 className='text-xl font-black mb-2 text-center'>{project.header}</h3>
              <p className='text-md text-center opacity-90'>{project.type}</p>
            </div>
            <div className='absolute inset-0 border-transparent group-hover:border-white/30 rounded-xl transition-all duration-500' />
          </div>
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 w-screen h-screen overflow-hidden select-none bg-background z-0'
      style={{
        filter: blur ? `blur(${blur}px)` : undefined,
        touchAction: 'none',
        transition: blur ? 'none' : 'filter 0.2s ease-out',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {cards}
    </div>
  );
}

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <InfinitePlaygroundGrid />
    </div>
  );
}
