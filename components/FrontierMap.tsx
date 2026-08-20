"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/**
 * FrontierMap — the signature of Atlas Alt.
 *
 * A topographic "map of the unknown": concentric contour rings describe the
 * territory of the known at the centre, dissolving into sparse question-nodes
 * at the frontier — the 未知の縁 (edge of the unknown). Everything is derived
 * from a fixed seed so the server and client render the exact same geometry.
 */

// Small deterministic PRNG so SSR and hydration agree.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A closed, gently irregular contour path (a topographic ring).
function contourPath(
  cx: number,
  cy: number,
  radius: number,
  wobble: number,
  rand: () => number,
  points = 26
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = radius * (1 + (rand() - 0.5) * wobble);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.82]);
  }
  // Catmull-Rom → cubic bezier for a smooth closed loop.
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(
      1
    )}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + "Z";
}

export default function FrontierMap() {
  const reduce = useReducedMotion();

  const { rings, knownNodes, edgeNodes } = useMemo(() => {
    const rand = mulberry32(20260805);
    const cx = 500;
    const cy = 360;
    const rings = Array.from({ length: 7 }, (_, i) =>
      contourPath(cx, cy, 60 + i * 52, 0.05 + i * 0.02, rand)
    );

    // Dense, connected "known" nodes near the centre.
    const knownNodes = Array.from({ length: 9 }, () => {
      const a = rand() * Math.PI * 2;
      const r = rand() * 130;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.8 };
    });

    // Sparse "?" nodes drifting at the frontier.
    const edgeNodes = Array.from({ length: 7 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 300 + rand() * 130;
      return {
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r * 0.72,
        delay: rand() * 4,
      };
    });

    return { rings, knownNodes, edgeNodes };
  }, []);

  return (
    <svg
      viewBox="0 0 1000 720"
      className="h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="known" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.20" />
          <stop offset="55%" stopColor="#1E6FE0" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#1E6FE0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ringStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E6FE0" />
          <stop offset="100%" stopColor="#4CC9F0" />
        </linearGradient>
        <radialGradient id="fade" cx="50%" cy="50%" r="60%">
          <stop offset="60%" stopColor="#FAFCFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FAFCFF" stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Glow of the known territory */}
      <ellipse cx="500" cy="360" rx="260" ry="210" fill="url(#known)" />

      {/* Topographic contour rings, drawn from the inside out */}
      {rings.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="url(#ringStroke)"
          strokeWidth={i === 0 ? 1.4 : 1}
          strokeOpacity={0.5 - i * 0.055}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={reduce ? {} : { pathLength: 1, opacity: 1 }}
          transition={{
            duration: 2,
            delay: 0.15 * i,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Connective mesh between known nodes */}
      {knownNodes.map((n, i) =>
        knownNodes.slice(i + 1).map((m, j) => {
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist > 150) return null;
          return (
            <motion.line
              key={`${i}-${j}`}
              x1={n.x}
              y1={n.y}
              x2={m.x}
              y2={m.y}
              stroke="#1E6FE0"
              strokeOpacity={0.16}
              strokeWidth={0.8}
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? {} : { opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
            />
          );
        })
      )}

      {/* Known nodes — solid, answered */}
      {knownNodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={3}
          fill="#1E6FE0"
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={reduce ? {} : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 + i * 0.05 }}
        />
      ))}

      {/* Frontier nodes — open questions dissolving into the white */}
      {edgeNodes.map((n, i) => (
        <motion.g
          key={i}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? {} : { opacity: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 1, delay: 1.4 + i * 0.08 },
            y: {
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: n.delay,
            },
          }}
        >
          <circle
            cx={n.x}
            cy={n.y}
            r={11}
            fill="none"
            stroke="#4CC9F0"
            strokeOpacity={0.55}
            strokeDasharray="2 3"
          />
          <text
            x={n.x}
            y={n.y + 4.5}
            textAnchor="middle"
            fontSize="13"
            fontFamily="var(--font-mono)"
            fill="#1E6FE0"
            fillOpacity={0.8}
          >
            ?
          </text>
        </motion.g>
      ))}

      {/* Vignette so the map dissolves into the paper */}
      <rect x="0" y="0" width="1000" height="720" fill="url(#fade)" />
    </svg>
  );
}
