"use client";

import { useEffect, useRef } from "react";

export type WarpMode = "idle" | "warp" | "calm";

const SPEED: Record<WarpMode, number> = { idle: 0.35, warp: 26, calm: 1.1 };

type Star = { x: number; y: number; z: number; red: boolean };

const spawn = (anyDepth: boolean): Star => ({
  x: (Math.random() - 0.5) * 2.4,
  y: (Math.random() - 0.5) * 2.4,
  z: anyDepth ? Math.random() * 0.95 + 0.05 : 1,
  red: Math.random() < 0.2,
});

/** Starfield that streaks into hyperspace when mode = "warp". */
export default function WarpField({ mode }: { mode: WarpMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(SPEED[mode]);

  useEffect(() => {
    target.current = SPEED[mode];
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let speed = target.current;
    let raf = 0;
    const stars = Array.from({ length: 480 }, () => spawn(true));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      speed += (target.current - speed) * 0.045;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.max(w, h) * 0.5;

      // Leave trails when moving fast
      ctx.fillStyle = speed > 4 ? "rgba(5,5,5,0.32)" : "rgba(5,5,5,1)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const pz = s.z;
        s.z -= speed * 0.0016;
        if (s.z <= 0.02) {
          stars[i] = spawn(false);
          continue;
        }
        const x = cx + (s.x / s.z) * scale;
        const y = cy + (s.y / s.z) * scale;
        const px = cx + (s.x / pz) * scale;
        const py = cy + (s.y / pz) * scale;
        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) {
          stars[i] = spawn(false);
          continue;
        }
        const depth = 1 - s.z;
        const alpha = Math.min(1, depth * 1.4);
        ctx.strokeStyle = s.red ? `rgba(255,26,26,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = Math.max(0.6, depth * 2.6);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x + 0.1, y + 0.1);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" aria-hidden />;
}
