// Shared helpers for the grid animation scenes.
//
// Coordinates: scenes are authored in the pixel space of the original 3000x2351 artwork, so measurements
// taken from the originals can be used directly. toOutput() maps that space onto the 480x376 frame
// (uniform scale 0.16, centred vertically; the aspect ratios differ by 0.05%).

export const FPS = 30;
export const W = 480;
export const H = 376;
export const ORIG_W = 3000;
export const ORIG_H = 2351;
export const BG = '#0d0d0d';
export const K = W / ORIG_W; // CSS px per original px
export const OFFSET_Y = (H - ORIG_H * K) / 2;

export const params = new URLSearchParams(location.search);
export const SCALE = Number(params.get('scale') || 2);

// Seeded PRNG (mulberry32) — never Math.random, so every frame renders identically.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// Fraction of the way through [a, b] at time t, clamped to 0..1.
export const phase = (t, a, b) => clamp((t - a) / (b - a));

// A canvas sized for the output frame at the render scale. With `orig` the context draws in original-artwork
// pixels.
export function makeCanvas({ attach = false, orig = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * SCALE);
  canvas.height = Math.round(H * SCALE);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const ctx = canvas.getContext('2d');
  resetTransform(ctx, orig);
  if (attach) document.body.appendChild(canvas);
  return { canvas, ctx };
}

export function resetTransform(ctx, orig = true) {
  if (orig) ctx.setTransform(SCALE * K, 0, 0, SCALE * K, 0, SCALE * OFFSET_Y);
  else ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });
}

export async function loadJSON(url) {
  const res = await fetch(url);
  return res.json();
}

// The originals carry a print texture: sparse short vertical #0d0d0d streaks over every fill, fixed in screen
// space. assets/grain.png is a real patch of it (alpha = streak), cut from the cube's white face. Drawing it
// "source-atop" over a layer streaks only the layer's painted pixels, like the originals.
export function applyGrain(ctx, grainImg) {
  ctx.save();
  resetTransform(ctx, true);
  ctx.globalCompositeOperation = 'source-atop';
  const tw = grainImg.width;
  const th = grainImg.height;
  for (let y = 0; y < ORIG_H; y += th) {
    for (let x = 0; x < ORIG_W; x += tw) ctx.drawImage(grainImg, x, y);
  }
  ctx.restore();
}

export function fillBackground(ctx) {
  ctx.save();
  resetTransform(ctx, false);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

// Registers the scene with the renderer (render.cjs).
export function defineScene({ frames, setup, render }) {
  const scene = { frames, ready: null, render: null };
  scene.ready = (async () => {
    await setup();
  })();
  scene.render = async frame => {
    await render(frame % frames, (frame % frames) / FPS);
  };
  window.SCENE = scene;
}
