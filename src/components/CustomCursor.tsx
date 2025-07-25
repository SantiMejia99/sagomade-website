import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide the default cursor globally
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = originalCursor;
    };
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // Listen for hover on interactive elements
  useEffect(() => {
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
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: hovering ? 56 : 36,
        height: hovering ? 56 : 36,
        background: 'white',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        mixBlendMode: 'exclusion',
        transition: 'width 0.2s, height 0.2s, background 0.2s',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)',
        opacity: 0.95,
      }}
    />
  );
};

export default CustomCursor; 