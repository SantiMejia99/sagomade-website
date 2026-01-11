import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TypingAnimation } from '@/components/ui/typing-animation';

interface LoadingScreenV2Props {
  onComplete: () => void;
}

const TOTAL_DURATION = 4800;
const FADE_OUT_DURATION = 0.6;

const LoadingScreenV2: React.FC<LoadingScreenV2Props> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fade out and complete
  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      if (!containerRef.current) return;

      gsap.to(containerRef.current, {
        opacity: 0,
        duration: FADE_OUT_DURATION,
        ease: 'power2.inOut',
        onComplete,
      });
    }, TOTAL_DURATION);

    return () => clearTimeout(fadeTimeout);
  }, [onComplete]);

  return (
    <div ref={containerRef} className='fixed inset-0 z-50 flex items-center justify-center bg-black text-white'>
      <div className='text-center'>
        <TypingAnimation
          words={['Welcome! 👋', 'Move, drag or scroll anywhere.']}
          cursorStyle='block'
          typeSpeed={60}
          deleteSpeed={50}
          pauseDelay={400}
          className='font-mono text-[28px] md:text-[16px]'
        />
      </div>
    </div>
  );
};

export default LoadingScreenV2;
