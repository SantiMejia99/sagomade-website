import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const checkDesktop = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isDesktopSize = window.innerWidth > 768;
      setIsDesktop(!isTouchDevice && isDesktopSize);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Single style injection
    const style = document.createElement('style');
    style.id = 'custom-cursor-styles';
    style.textContent = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('custom-cursor-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    // Use RAF for smooth cursor movement
    const move = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    // Throttled hover check
    let timeoutId: number | undefined;
    const checkHover = (e: MouseEvent) => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        const el = e.target as HTMLElement;
        const isInteractive = el.closest('a,button,[role="button"],.menu-item');
        setHovering(!!isInteractive);
      }, 50);
    };

    window.addEventListener('mousemove', checkHover, { passive: true });
    return () => {
      window.removeEventListener('mousemove', checkHover);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [isDesktop]);

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
        transition: 'width 0.3s ease-out, height 0.3s ease-out',
        willChange: 'transform',
        opacity: 0.95,
      }}
    />
  );
};

export default CustomCursor;