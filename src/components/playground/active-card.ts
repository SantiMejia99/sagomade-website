import { useSyncExternalStore } from 'react';
import { VOID } from '@/components/playground/void-config';

// Grid hover state, kept outside React so that changes re-render only the cards whose answer changes, never the grid.
// Cells are identified by a "row:col" key.
//
// Pointer (mouse / pen) devices go through three states:
// - moving: the grid is dragged, wheeled or gliding, or settled less than gridIdleMs ago. Nothing shows.
// - passing over: the grid is idle; the project under the pointer (hoverKey) gets only a faint brighten (CSS).
// - resting: the grid is idle AND the pointer has stayed on the same project for dwellMs. That project becomes
//   active: lift, others dimmed, readout. Both conditions are timers; whichever finishes last activates.
// Keyboard focus and touch taps activate directly (setActiveCard), since they are deliberate.

const H = VOID.hover;

let activeKey: string | null = null;
let hoverKey: string | null = null;
let gridIdle = true;
let dwellDone = false;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let dwellTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(listener => listener());

export function setActiveCard(key: string | null) {
  if (key === activeKey) return;
  activeKey = key;
  notify();
}

export function getActiveCard() {
  return activeKey;
}

function restIfReady() {
  if (gridIdle && dwellDone && hoverKey) setActiveCard(hoverKey);
}

// The pointer entered a project's drawn disc. Moving within the same disc changes nothing, so jitter never resets
// the dwell.
export function pointerEnterCard(key: string) {
  if (key === hoverKey) return;
  if (activeKey && activeKey !== key) activeKey = null; // leaving a resting project for another one
  hoverKey = key;
  dwellDone = false;
  clearTimeout(dwellTimer);
  dwellTimer = setTimeout(() => {
    dwellDone = true;
    restIfReady();
  }, H.dwellMs);
  notify();
}

export function pointerLeaveCard(key: string) {
  if (key !== hoverKey && key !== activeKey) return;
  if (key === hoverKey) {
    hoverKey = null;
    dwellDone = false;
    clearTimeout(dwellTimer);
  }
  if (key === activeKey) activeKey = null;
  notify();
}

// The grid started being dragged, wheeled or gliding: end resting at once (CSS hides the hint while moving).
export function gridMotionStarted() {
  clearTimeout(idleTimer);
  gridIdle = false;
  setActiveCard(null);
}

// The grid came to rest. It counts as idle after gridIdleMs; the dwell keeps running meanwhile.
export function gridMotionEnded() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    gridIdle = true;
    restIfReady();
  }, H.gridIdleMs);
}

// Clear everything (tab hidden, grid unmounted).
export function resetCardState() {
  clearTimeout(idleTimer);
  clearTimeout(dwellTimer);
  gridIdle = true;
  dwellDone = false;
  hoverKey = null;
  activeKey = null;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// True while this card is the active (resting / focused / tapped) one.
export function useIsActiveCard(key: string) {
  return useSyncExternalStore(subscribe, () => activeKey === key);
}

// True while the pointer is over this card (the "passing over" hint).
export function useIsHoveredCard(key: string) {
  return useSyncExternalStore(subscribe, () => hoverKey === key);
}
