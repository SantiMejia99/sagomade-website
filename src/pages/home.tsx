import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import projects from "../app/dashboard/data.json";

const CARD_SIZE = 240; // px, including margin/gap
const GRID_GAP = 24; // px
const VISIBLE_ROWS = 5;
const VISIBLE_COLS = 6;
const BLUR_MAX = 8;

const gifMap: Record<number, string> = {
  1: "/gifs/consultation-notice.gif",
  2: "/gifs/espacio-ideal.gif",
  3: "/gifs/wine-bottles.gif",
  4: "/gifs/beer-bottles.gif",
  5: "/gifs/standing-desk.gif",
  6: "/gifs/poss-magazine.gif",
  7: "/gifs/running-shirt.gif",
  8: "/gifs/green-standards-toolkit.gif",
  9: "/gifs/tote-bag.gif",
};

function getProjectGif(id: number) {
  return gifMap[id] || undefined;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function InfinitePlaygroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const lastOffset = useRef(offset);
  const [blur, setBlur] = useState(0);
  const lastMove = useRef(Date.now());
  const lastPos = useRef(offset);

  // Handle drag-to-pan
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastOffset.current = offset;
      document.body.style.cursor = "grabbing";
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({
        x: lastOffset.current.x + dx,
        y: lastOffset.current.y + dy,
      });
      // Blur based on speed
      const now = Date.now();
      const dist = Math.sqrt(
        Math.pow(offset.x - lastPos.current.x, 2) +
          Math.pow(offset.y - lastPos.current.y, 2)
      );
      const dt = now - lastMove.current;
      const speed = dist / (dt || 1);
      setBlur(Math.min(BLUR_MAX, speed * 0.7));
      lastMove.current = now;
      lastPos.current = offset;
    }
    function onPointerUp() {
      setIsDragging(false);
      dragStart.current = null;
      document.body.style.cursor = "";
      setTimeout(() => setBlur(0), 120);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, offset]);

  // Handle wheel-to-pan and prevent browser navigation
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      e.preventDefault(); // Prevent browser navigation on horizontal swipe
      setOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
      // Blur based on speed
      setBlur(Math.min(BLUR_MAX, Math.abs(e.deltaX) + Math.abs(e.deltaY)));
      setTimeout(() => setBlur(0), 120);
    }
    const ref = containerRef.current;
    if (ref) ref.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      if (ref) ref.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Prevent browser navigation on touch events (for mobile)
  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
    }
    const ref = containerRef.current;
    if (ref) ref.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      if (ref) ref.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Calculate visible grid
  const cards: React.ReactNode[] = [];
  const startRow = Math.floor(-offset.y / (CARD_SIZE + GRID_GAP)) - 2;
  const startCol = Math.floor(-offset.x / (CARD_SIZE + GRID_GAP)) - 2;
  for (let row = 0; row < VISIBLE_ROWS + 4; row++) {
    for (let col = 0; col < VISIBLE_COLS + 4; col++) {
      const projIdx = mod((startRow + row) * VISIBLE_COLS + (startCol + col), projects.length);
      const project = projects[projIdx];
      const x = (startCol + col) * (CARD_SIZE + GRID_GAP) + offset.x;
      const y = (startRow + row) * (CARD_SIZE + GRID_GAP) + offset.y;
      cards.push(
        <Link
          key={`${row}-${col}-${project.id}`}
          to={`/projects/${project.id}`}
          className="group absolute"
          style={{
            left: x,
            top: y,
            width: CARD_SIZE,
            height: CARD_SIZE,
            transition: "box-shadow 0.3s, transform 0.3s",
            zIndex: 1,
          }}
        >
          {/* Card content */}
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 shadow-md group-hover:scale-110 group-hover:z-10 group-hover:shadow-2xl transition-transform duration-300 cursor-pointer">
            {getProjectGif(project.id) ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${getProjectGif(project.id)})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 text-white text-3xl font-bold opacity-60">
                {project.header?.[0] || "?"}
              </div>
            )}
            <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-500" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 opacity-0 group-hover:opacity-100 transition-all duration-400">
              <h3 className="text-xl font-black mb-2 text-center">
                {project.header}
              </h3>
              <p className="text-md text-center opacity-90">{project.type}</p>
            </div>
            <div className="absolute inset-0 border-transparent group-hover:border-white/30 rounded-xl transition-all duration-500" />
          </div>
        </Link>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-background z-0"
      style={{ filter: blur ? `blur(${blur}px)` : undefined, touchAction: "none" }}
    >
      {cards}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <InfinitePlaygroundGrid />
    </div>
  );
}
