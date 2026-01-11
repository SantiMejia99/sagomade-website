import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Terminal, TypingAnimation, AnimatedSpan } from '@/components/ui/terminal';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay the appearance of the loading bar to sync with terminal sequence
    const startDelay = setTimeout(() => {
      setVisible(true);

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 30);

      return () => clearInterval(interval);
    }, 4000); // Adjust this delay to match when it should appear in sequence

    return () => clearTimeout(startDelay);
  }, []);

  if (!visible) return null;

  return <AnimatedSpan className='text-[#98ce81] font-mono'>&gt; Loading... [{progress}%]</AnimatedSpan>;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const TYPING_SPEED = 20;
  const TERMINAL_DURATION = 5200;
  const FADE_OUT_DURATION = 0.8;

  useEffect(() => {
    const fadeTimeout = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: FADE_OUT_DURATION,
          ease: 'power2.inOut',
          onComplete,
        });
      }
    }, TERMINAL_DURATION);

    return () => clearTimeout(fadeTimeout);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 z-50 bg-[#0d0d0d]/100 p-4 flex items-center justify-center overflow-auto text-mono'
      style={{ pointerEvents: 'auto' }}
    >
      <Terminal className='w-full max-w-3xl font-mono text-left flex flex-col'>
        <TypingAnimation duration={TYPING_SPEED}>&gt; Initializing system...</TypingAnimation>
        <AnimatedSpan className='text-[#999999] pl-2'>✔ Calibrating thoughts.</AnimatedSpan>
        <AnimatedSpan className='text-[#999999] pl-2'>✔ Rendering memories.</AnimatedSpan>

        <TypingAnimation duration={TYPING_SPEED}>$ cd sago-website</TypingAnimation>

        {/* Home Module */}
        <TypingAnimation duration={TYPING_SPEED}>$ loading module Home (/) & About (/about)...</TypingAnimation>
        <AnimatedSpan className='text-[#999999] pl-2'>📁 Home loaded</AnimatedSpan>

        {/* About Module */}
        <AnimatedSpan className='text-[#999999] pl-6'>📁 About loaded</AnimatedSpan>

        <TypingAnimation className='text-[#98ce81] font-bold' duration={TYPING_SPEED}>
          ℹ Move, drag, scroll anywhere you like. For as long as you'd like.
        </TypingAnimation>

        <LoadingBar />
      </Terminal>
    </div>
  );
};

export default LoadingScreen;
