import { useEffect, useState, type RefObject } from 'react';

// Module-level cache so the infinite grid can unmount and remount cards without refetching images.
const loadedSrcs = new Set<string>();
const pendingLoads = new Map<string, Promise<boolean>>();

function loadImage(src: string): Promise<boolean> {
  if (loadedSrcs.has(src)) return Promise.resolve(true);
  const pending = pendingLoads.get(src);
  if (pending) return pending;

  const promise = new Promise<boolean>(resolve => {
    const img = new Image();
    img.onload = () => {
      loadedSrcs.add(src);
      pendingLoads.delete(src);
      resolve(true);
    };
    img.onerror = () => {
      // Drop the failed attempt so a later card can retry.
      pendingLoads.delete(src);
      resolve(false);
    };
    img.src = src;
  });
  pendingLoads.set(src, promise);
  return promise;
}

/**
 * Loads `src` once the element in `ref` comes within `rootMargin` of the viewport.
 * Returns true when the image is ready to display.
 */
export function useLazyImage(src: string | undefined, ref: RefObject<Element | null>, rootMargin: string): boolean {
  const [isLoaded, setIsLoaded] = useState(() => !src || loadedSrcs.has(src));

  useEffect(() => {
    if (!src || loadedSrcs.has(src)) return;

    let cancelled = false;
    const start = () => {
      loadImage(src).then(ok => {
        if (!cancelled && ok) setIsLoaded(true);
      });
    };

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src, ref, rootMargin]);

  return isLoaded;
}
