import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device is desktop (not touch device)
    const checkDesktop = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isDesktopSize = window.innerWidth > 768; // md breakpoint
      setIsDesktop(!isTouchDevice && isDesktopSize);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Add global CSS to hide cursor
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
      *:hover {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDesktop]);

  useEffect(() => {
    // Only hide cursor on desktop
    if (!isDesktop) return;

    // Show cursor when leaving the window
    const showCursor = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          cursor: auto !important;
        }
      `;
      style.id = 'cursor-restore';
      document.head.appendChild(style);
    };

    // Hide cursor when entering the window
    const hideCursor = () => {
      const existingStyle = document.getElementById('cursor-restore');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };

    // Show cursor when leaving the window
    document.addEventListener('mouseleave', showCursor);
    // Hide cursor when entering the window
    document.addEventListener('mouseenter', hideCursor);

    return () => {
      showCursor();
      document.removeEventListener('mouseenter', hideCursor);
      document.removeEventListener('mouseleave', showCursor);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [isDesktop]);

  // Listen for hover on interactive elements
  useEffect(() => {
    if (!isDesktop) return;

    const checkHover = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('a,button,[role="button"],.menu-item')) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };
    window.addEventListener('mousemove', checkHover);
    return () => window.removeEventListener('mousemove', checkHover);
  }, [isDesktop]);

  // Override any cursor styles set by other components
  useEffect(() => {
    if (!isDesktop) return;

    const overrideCursorStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          cursor: none !important;
        }
        *:hover {
          cursor: none !important;
        }
        body {
          cursor: none !important;
        }
        body:hover {
          cursor: none !important;
        }
      `;
      style.id = 'custom-cursor-override';
      document.head.appendChild(style);
    };

    // Apply the override
    overrideCursorStyles();

    // Re-apply the override periodically to ensure it stays active
    const interval = setInterval(overrideCursorStyles, 100);

    return () => {
      clearInterval(interval);
      const existingStyle = document.getElementById('custom-cursor-override');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [isDesktop]);

  // Don't render on mobile/tablet
  if (!isDesktop) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: hovering ? 100 : 20,
        height: hovering ? 100 : 20,
        background: 'white',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        mixBlendMode: 'exclusion',
        transition: 'width 0.3s ease-out, height 0.3s ease-out, background 0.2s',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)',
        opacity: 0.95,
      }}
    />
  );
};

export default CustomCursor;
