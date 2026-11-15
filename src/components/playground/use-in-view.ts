import { useEffect, useState, type RefObject } from 'react';

type Listener = (inView: boolean) => void;

// One shared IntersectionObserver per root and rootMargin, so a grid of ~60 cards costs one observer instead of 60.
type Entry = { observer: IntersectionObserver; listeners: Map<Element, Listener> };
const observers = new Map<Element | null, Map<string, Entry>>();

function observe(el: Element, root: Element | null, rootMargin: string, listener: Listener) {
  let byMargin = observers.get(root);
  if (!byMargin) {
    byMargin = new Map();
    observers.set(root, byMargin);
  }
  let entry = byMargin.get(rootMargin);
  if (!entry) {
    const listeners = new Map<Element, Listener>();
    const observer = new IntersectionObserver(
      records => {
        for (const record of records) listeners.get(record.target)?.(record.isIntersecting);
      },
      { root, rootMargin }
    );
    entry = { observer, listeners };
    byMargin.set(rootMargin, entry);
  }
  entry.listeners.set(el, listener);
  entry.observer.observe(el);

  return () => {
    const current = byMargin.get(rootMargin);
    if (!current) return;
    current.observer.unobserve(el);
    current.listeners.delete(el);
    if (current.listeners.size === 0) {
      current.observer.disconnect();
      byMargin.delete(rootMargin);
      if (byMargin.size === 0) observers.delete(root);
    }
  };
}

/**
 * Tracks whether the element in `ref` is within `rootMargin` of the viewport, or of its closest `rootSelector`
 * ancestor. Unlike a one-shot lazy loader this flips back to false when the element leaves, so callers can pause work
 * that is off screen.
 *
 * Pass the clipping container as the root when the element sits inside one (e.g. an overflow: hidden grid): with the
 * viewport as root, the container's clip is applied first and rootMargin never takes effect.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin: string, rootSelector?: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const root = rootSelector ? el.closest(rootSelector) : null;
    return observe(el, root, rootMargin, setInView);
  }, [ref, rootMargin, rootSelector]);

  return inView;
}
