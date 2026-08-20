"use client";

import { useEffect, useRef } from "react";

/**
 * DavidDots — an interactive, dot-matrix bust of David (classical profile),
 * rendered in blues. The silhouette is authored as an SVG path, rasterised to
 * an offscreen canvas, then sampled on a grid: every filled cell becomes a
 * particle that springs to its home position and scatters away from the
 * pointer. The statue motif of the brief, made of the atlas's own blue.
 */

// Classical bust in profile, facing left. Design box ~ 410 x 588.
const PATH =
  "M 152 66 C 150 44, 172 30, 188 42 C 196 26, 220 26, 226 46 C 244 32, 268 40, 268 62 C 292 56, 314 84, 320 128 C 328 176, 320 236, 310 272 C 304 322, 299 352, 300 394 C 338 402, 360 432, 372 482 L 382 560 L 28 560 L 45 484 C 60 450, 112 442, 150 430 C 150 400, 146 372, 138 350 C 128 330, 110 322, 99 300 C 92 286, 97 279, 86 268 C 77 261, 78 257, 85 249 C 93 241, 88 235, 97 231 C 79 223, 64 219, 67 207 C 75 189, 97 175, 112 167 C 121 149, 116 118, 132 96 C 138 84, 144 74, 152 66 Z";
const DESIGN_W = 410;
const DESIGN_H = 588;

type Dot = {
  hx: number; // home x
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  phase: number;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Front (lit) → back (shadow) shading, plus occasional cyan sparkle.
function dotColor(t: number, rnd: number) {
  // t: 0 = front/face (lit), 1 = back of head (shadow)
  const stops: [number, [number, number, number]][] = [
    [0, [150, 220, 246]], // #96DCF6 highlight
    [0.45, [30, 111, 224]], // #1E6FE0 atlas
    [1, [10, 26, 47]], // #0A1A2F navy
  ];
  let c: [number, number, number] = stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (t >= p0 && t <= p1) {
      const k = (t - p0) / (p1 - p0);
      c = [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)];
      break;
    }
  }
  // brightness jitter
  const j = 0.85 + rnd * 0.3;
  let [r, g, b] = [c[0] * j, c[1] * j, c[2] * j];
  // sparkle: a few bright cyan dots
  if (rnd > 0.93) {
    r = 120;
    g = 214;
    b = 245;
  }
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
}

export default function DavidDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let dots: Dot[] = [];
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    let t0 = performance.now();

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      cssW = Math.max(1, Math.floor(rect.width));
      cssH = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fit the figure into the box.
      const figH = Math.min(cssH * 0.54, cssW * (DESIGN_H / DESIGN_W) * 0.66);
      const scale = figH / DESIGN_H;
      const figW = DESIGN_W * scale;
      const offX = (cssW - figW) / 2 + figW * 0.04;
      const offY = (cssH - figH) / 2;

      // Rasterise silhouette to an offscreen canvas at CSS resolution.
      const off = document.createElement("canvas");
      off.width = cssW;
      off.height = cssH;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.save();
      octx.translate(offX, offY);
      octx.scale(scale, scale);
      octx.fillStyle = "#000";
      octx.fill(new Path2D(PATH));
      octx.restore();
      const data = octx.getImageData(0, 0, cssW, cssH).data;

      // Sample on a grid.
      const step = cssW < 420 ? 6 : 7;
      const next: Dot[] = [];
      const minX = offX;
      const maxX = offX + figW;
      for (let y = 0; y < cssH; y += step) {
        for (let x = 0; x < cssW; x += step) {
          const alpha = data[(y * cssW + x) * 4 + 3];
          if (alpha > 128) {
            const rnd = Math.random();
            const tShade = Math.min(1, Math.max(0, (x - minX) / (maxX - minX)));
            next.push({
              hx: x,
              hy: y,
              x: reduce ? x : x + (Math.random() - 0.5) * 40,
              y: reduce ? y : y + (Math.random() - 0.5) * 40,
              vx: 0,
              vy: 0,
              r: step > 6 ? 1.7 : 1.5,
              color: dotColor(tShade, rnd),
              phase: rnd * Math.PI * 2,
            });
          }
        }
      }
      dots = next;
    };

    const draw = () => {
      const now = performance.now();
      const time = (now - t0) / 1000;
      ctx.clearRect(0, 0, cssW, cssH);

      for (const d of dots) {
        // gentle idle breathing
        const bx = Math.sin(time * 0.6 + d.phase) * 0.6;
        const by = Math.cos(time * 0.5 + d.phase) * 0.6;
        const homeX = d.hx + bx;
        const homeY = d.hy + by;

        // pointer repulsion
        if (pointer.active) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          const R = 95;
          if (dist2 < R * R) {
            const dist = Math.sqrt(dist2) || 0.0001;
            const force = (1 - dist / R) * 5.5;
            d.vx += (dx / dist) * force;
            d.vy += (dy / dist) * force;
          }
        }

        // spring home
        d.vx += (homeX - d.x) * 0.11;
        d.vy += (homeY - d.y) * 0.11;
        d.vx *= 0.78;
        d.vy *= 0.78;
        d.x += d.vx;
        d.y += d.vy;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.hx, d.hy, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();
    if (reduce) {
      drawStatic();
    } else {
      t0 = performance.now();
      raf = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      wrap.addEventListener("pointerleave", onLeave);
    }

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) drawStatic();
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {/* soft glow behind the figure */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/20 blur-3xl" />
      <canvas ref={canvasRef} className="relative h-full w-full" />
    </div>
  );
}
