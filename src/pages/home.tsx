import React, { useEffect, useRef, useState, useMemo } from 'react';
import projects from '../app/dashboard/data.json';

const CARD_SIZE = 240; // px, including margin/gap
const GRID_GAP = 24; // px
const VISIBLE_COLS = 6;

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
};


function getProjectGif(id: number) {
  return gifMap[id] || undefined;
}


function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function InfinitePlaygroundGrid({ loadedContent }: { loadedContent: Set<string> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lastOffset = useRef(offset);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Debounced window resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Optimized mouse drag-to-pan
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
    }

    function onPointerUp() {
      setIsDragging(false);
      dragStart.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    function onMouseLeave() {
      if (isDragging) {
        setIsDragging(false);
        dragStart.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
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

  // Optimized wheel scrolling
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault();

      // Smooth wheel scrolling with higher sensitivity
      const deltaX = e.deltaX * 3.0;
      const deltaY = e.deltaY * 3.0;

      setOffset(prev => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY,
      }));
    }

    const ref = containerRef.current;
    if (ref) ref.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (ref) ref.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Optimized touch handling
  useEffect(() => {
    let touchStart = { x: 0, y: 0 };
    let touchStartOffset = { x: 0, y: 0 };
    let isTouching = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      isTouching = true;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartOffset = { ...offset };
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
    }

    function onTouchEnd() {
      isTouching = false;
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

  // Memoized card rendering for better performance
  const cards = useMemo(() => {
    const cardElements: React.ReactNode[] = [];
    const startRow = Math.floor(-offset.y / (CARD_SIZE + GRID_GAP)) - 2; // Reduced preload area
    const startCol = Math.floor(-offset.x / (CARD_SIZE + GRID_GAP)) - 2;
    
    // Render fewer cards for better performance
    const visibleRows = Math.ceil(windowSize.height / (CARD_SIZE + GRID_GAP)) + 4; // Reduced buffer
    const visibleCols = Math.ceil(windowSize.width / (CARD_SIZE + GRID_GAP)) + 4;
    
    for (let row = 0; row < visibleRows; row++) {
      for (let col = 0; col < visibleCols; col++) {
        const projIdx = mod((startRow + row) * VISIBLE_COLS + (startCol + col), projects.length);
        const project = projects[projIdx];
        const x = (startCol + col) * (CARD_SIZE + GRID_GAP) + offset.x;
        const y = (startRow + row) * (CARD_SIZE + GRID_GAP) + offset.y;
        
        // Smaller visibility bounds for better performance
        const isVisible =
          x > -CARD_SIZE * 2 && x < windowSize.width + CARD_SIZE * 2 && 
          y > -CARD_SIZE * 2 && y < windowSize.height + CARD_SIZE * 2;
        
        if (isVisible) {
          const gif = getProjectGif(project.id);
          const isContentLoaded = gif ? loadedContent.has(gif) : true;

          cardElements.push(
            <div
              key={`${row}-${col}-${project.id}`}
              className='group absolute'
              style={{
                left: x,
                top: y,
                width: CARD_SIZE,
                height: CARD_SIZE,
                zIndex: 1,
              }}
              onClick={() => {
                if (!isDragging && !('ontouchstart' in window)) {
                  window.location.href = `/projects/${project.id}`;
                }
              }}
              onTouchEnd={e => {
                if (!isDragging && 'ontouchstart' in window) {
                  e.preventDefault();
                  window.location.href = `/projects/${project.id}`;
                }
              }}
            >
              {/* Card content */}
              <div className='relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 shadow-md group-hover:scale-105 group-hover:z-10 transition-transform duration-200 cursor-pointer touch-manipulation'>
                {(() => {
                  // Use simple image backgrounds for better performance
                  if (gif && isContentLoaded) {
                    return (
                      <div
                        className='absolute inset-0 bg-cover bg-center'
                        style={{
                          backgroundImage: `url(${gif})`,
                          aspectRatio: '1/1',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    );
                  } else {
                    return (
                      <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 text-white text-3xl font-bold opacity-60'>
                        {project.header?.[0] || '?'}
                      </div>
                    );
                  }
                })()}
                <div className='absolute inset-0 group-hover:bg-black/30 transition-all duration-200' />
                <div className='absolute inset-0 flex flex-col justify-center items-center text-white p-6 opacity-0 group-hover:opacity-100 transition-all duration-200'>
                  <h3 className='text-xl font-black mb-2 text-center'>{project.header}</h3>
                  <p className='text-md text-center opacity-90'>{project.type}</p>
                </div>
              </div>
            </div>
          );
        }
      }
    }
    
    return cardElements;
  }, [offset, windowSize, loadedContent, isDragging]);

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
      {cards}
    </div>
  );
}

export default function Home() {
  const [loadedContent, setLoadedContent] = useState<Set<string>>(new Set());

  // Simple background preloading
  useEffect(() => {
    // Preload optimized images in background
    Object.values(gifMap).forEach(src => {
      const img = new Image();
      img.onload = () => {
        setLoadedContent(prev => new Set([...prev, src]));
      };
      img.src = src;
    });
  }, []);

  return (
    <div className='min-h-screen bg-background'>
      <InfinitePlaygroundGrid loadedContent={loadedContent} />
    </div>
  );
}
