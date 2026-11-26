import { Suspense, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { TRANSITION_COLOR, transitionRef, type PixelPageTransitionHandle } from '@/lib/page-transition';
import PixelPageTransition from '@/components/layout/PixelPageTransition';
import SiteNavigation from '@/components/layout/SiteNavigation';

export default function Layout() {
  const ref = useRef<PixelPageTransitionHandle>(null);

  useEffect(() => {
    transitionRef.current = ref.current;
    return () => {
      transitionRef.current = null;
    };
  }, []);

  return (
    <PixelPageTransition ref={ref} gridSize={12} animationStepDuration={0.6} pixelColor={TRANSITION_COLOR}>
      <SiteNavigation />
      {/* Lazy route chunks resolve here, so the nav and transition overlay stay mounted */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </PixelPageTransition>
  );
}
