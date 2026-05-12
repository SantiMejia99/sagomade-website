import { useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PixelPageTransition, { type PixelPageTransitionHandle } from './PixelPageTransition';
import { transitionRef } from './transitionRef';
import SagoNavigation from './NavigationMenu';

export default function Layout() {
  const ref = useRef<PixelPageTransitionHandle>(null);

  useEffect(() => {
    transitionRef.current = ref.current;
  }, []);

  return (
    <PixelPageTransition ref={ref} gridSize={12} animationStepDuration={0.6} pixelColor='#2F2F2F'>
      <SagoNavigation />
      <Outlet />
    </PixelPageTransition>
  );
}
