/** Default colour of the pixel-cover page transition. */
export const TRANSITION_COLOR = '#0d0d0d';

export interface PixelPageTransitionHandle {
  navigate: (fn: () => void | Promise<void>, pixelColor?: string) => void;
}

/**
 * Module-level handle to the mounted PixelPageTransition (set by Layout), so any
 * component can trigger a transition without prop drilling or context re-renders.
 */
export const transitionRef = {
  current: null as PixelPageTransitionHandle | null,
};

/** Run `go` behind the pixel transition, or immediately if no transition host is mounted. */
export function navigateWithTransition(go: () => void, color: string = TRANSITION_COLOR) {
  if (transitionRef.current) transitionRef.current.navigate(go, color);
  else go();
}
