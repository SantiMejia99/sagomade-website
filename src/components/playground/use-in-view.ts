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
