import { useSyncExternalStore } from 'react';

// Which grid cell is "active" (hovered, focused, or tapped once on touch), as a "row:col" key. Kept outside React so
// that activating a card re-renders only the card that gains and the card that loses the state, never the grid.

let activeKey: string | null = null;
const listeners = new Set<() => void>();

export function setActiveCard(key: string | null) {
  if (key === activeKey) return;
  activeKey = key;
  listeners.forEach(listener => listener());
}

export function getActiveCard() {
  return activeKey;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// True while this card is the active one. Each card's snapshot is a boolean, so only cards whose answer changes
// re-render.
export function useIsActiveCard(key: string) {
  return useSyncExternalStore(subscribe, () => activeKey === key);
}
