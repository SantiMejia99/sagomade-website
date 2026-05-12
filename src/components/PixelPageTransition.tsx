import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

/* ── Types ───────────────────────────────────────────────────────────────── */

export interface PixelPageTransitionHandle {
  navigate: (fn: () => void | Promise<void>, pixelColor?: string) => void;
}

interface PixelPageTransitionProps {
  children: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
}

/* ── Component ───────────────────────────────────────────────────────────── */

const PixelPageTransition = forwardRef<PixelPageTransitionHandle, PixelPageTransitionProps>(
  function PixelPageTransition({ children, gridSize = 7, pixelColor = '#ffffff', animationStepDuration = 0.6 }, ref) {
    const pixelGridRef = useRef<HTMLDivElement>(null);
    const delayedCallRef = useRef<gsap.core.Tween | null>(null);
    const busyRef = useRef(false);

    /* Build pixel grid */
    useEffect(() => {
      const grid = pixelGridRef.current;
      if (!grid) return;

      grid.innerHTML = '';
      const size = 100 / gridSize;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const pixel = document.createElement('div');
          pixel.style.cssText = `
          position: absolute;
          display: none;
          background-color: ${pixelColor};
          width: ${size}%;
          height: ${size}%;
          left: ${col * size}%;
          top: ${row * size}%;
        `;
          grid.appendChild(pixel);
        }
      }
    }, [gridSize, pixelColor]);

    useImperativeHandle(ref, () => ({
      navigate(fn, color) {
        if (busyRef.current) return;
        busyRef.current = true;

        const grid = pixelGridRef.current;
        if (!grid) return;

        const pixels = grid.querySelectorAll<HTMLDivElement>('div');
        if (!pixels.length) return;

        if (color) {
          pixels.forEach(px => (px.style.backgroundColor = color));
        }

        gsap.killTweensOf(pixels);
        delayedCallRef.current?.kill();

        gsap.set(pixels, { display: 'none' });

        const staggerEach = animationStepDuration / pixels.length;

        // Cover — pixels snap in
        gsap.to(pixels, {
          display: 'block',
          duration: 0,
          stagger: { each: staggerEach, from: 'random' },
        });

        // Swap page at midpoint
        delayedCallRef.current = gsap.delayedCall(animationStepDuration, async () => {
          await Promise.resolve(fn?.());
          busyRef.current = false;
        });

        // Uncover — pixels snap out
        gsap.to(pixels, {
          display: 'none',
          duration: 0,
          delay: animationStepDuration,
          stagger: { each: staggerEach, from: 'random' },
        });
      },
    }));

    return (
      <div className='relative w-full h-full'>
        {children}

        {/* Full-screen pixel overlay */}
        <div ref={pixelGridRef} aria-hidden='true' className='fixed inset-0 z-[9999] pointer-events-none' />
      </div>
    );
  }
);

export default PixelPageTransition;
