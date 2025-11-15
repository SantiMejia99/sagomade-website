import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [hovering, setHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

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

    const style = document.createElement('style');
    style.id = 'custom-cursor-styles';
    style.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('custom-cursor-styles');
      if (existingStyle) document.head.removeChild(existingStyle);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop || !cursorRef.current) return;

    const cursor = cursorRef.current;
    let currentHovering = false;

    // Direct DOM updates for position - bypasses React entirely
    const move = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      // Check hover on every move - but only update state if changed
      const el = e.target as HTMLElement;
      const isInteractive = !!el.closest('a,button,[role="button"],.menu-item');

      if (isInteractive !== currentHovering) {
        currentHovering = isInteractive;
        setHovering(isInteractive);
      }
    };

    window.addEventListener('mousemove', move, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: hovering ? 100 : 20,
        height: hovering ? 100 : 20,
        background: 'white',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        mixBlendMode: 'exclusion',
        transition: 'width 0.3s ease-out, height 0.3s ease-out, transform 0s',
        willChange: 'transform',
        opacity: 0.95,
      }}
    />
  );
};

export default CustomCursor;
