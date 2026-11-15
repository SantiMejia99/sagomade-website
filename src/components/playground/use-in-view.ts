import { useEffect, useState, type RefObject } from 'react';

type Listener = (inView: boolean) => void;

// One shared IntersectionObserver per rootMargin, so a grid of ~60 cards costs one observer instead of 60.
const observers = new Map<string, { observer: IntersectionObserver; listeners: Map<Element, Listener> }>();

function observe(el: Element, rootMargin: string, listener: Listener) {
  let entry = observers.get(rootMargin);
  if (!entry) {
    const listeners = new Map<Element, Listener>();
    const observer = new IntersectionObserver(
      records => {
        for (const record of records) listeners.get(record.target)?.(record.isIntersecting);
      },
      { rootMargin }
    );
    entry = { observer, listeners };
    observers.set(rootMargin, entry);
  }
  entry.listeners.set(el, listener);
  entry.observer.observe(el);

  return () => {
    const current = observers.get(rootMargin);
    if (!current) return;
    current.observer.unobserve(el);
    current.listeners.delete(el);
    if (current.listeners.size === 0) {
      current.observer.disconnect();
      observers.delete(rootMargin);
    }
  };
}

/**
 * Tracks whether the element in `ref` is within `rootMargin` of the viewport. Unlike a one-shot lazy loader this
 * flips back to false when the element leaves, so callers can pause work that is off screen.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    return observe(el, rootMargin, setInView);
  }, [ref, rootMargin]);

  return inView;
}

// Module-level cache so the infinite grid can unmount and remount cards without refetching still images.
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

/** Starts loading `src` the first time `active` is true; returns true once the image is ready to display. */
export function useImageReady(src: string | undefined, active: boolean): boolean {
  const [isLoaded, setIsLoaded] = useState(() => !!src && loadedSrcs.has(src));

  useEffect(() => {
    if (!src || !active || isLoaded) return;
    let cancelled = false;
    loadImage(src).then(ok => {
      if (!cancelled && ok) setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [src, active, isLoaded]);

  return isLoaded;
}
