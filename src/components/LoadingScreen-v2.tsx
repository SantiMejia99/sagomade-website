import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TypingAnimation } from '@/components/ui/typing-animation';

interface LoadingScreenV2Props {
  onComplete: () => void;
}

const TOTAL_DURATION = 2900;
const FADE_OUT_DURATION = 0.8;

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
    <div
      ref={containerRef}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black text-white'
      style={{ height: '100dvh' }}
    >
      {' '}
      <div className='text-center'>
        <TypingAnimation
          words={['MOVE, DRAG OR SCROLL ANYWHERE.']}
          cursorStyle='block'
          typeSpeed={60}
          pauseDelay={400}
          className='font-semibold text-[14px] md:text-[16px]'
        />
      </div>
    </div>
  );
};

export default LoadingScreenV2;
