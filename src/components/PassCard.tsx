"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The National Art Pass. Flies in from deep space spinning, then floats with
 * pointer / gyro tilt, a moving glare and a sheen. Tap to flip.
 */
export default function PassCard({ onTap }: { onTap?: (x: number, y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 140, damping: 14 };
  const rotateX = useSpring(useTransform(my, [0, 1], [16, -16]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-20, 20]), spring);
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.3), rgba(255,255,255,0) 50%)`;

  // Phone tilt (Android fires these without a permission prompt)
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      mx.set(clamp01(0.5 + e.gamma / 50));
      my.set(clamp01(0.5 + (e.beta - 50) / 50));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [mx, my]);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(clamp01((e.clientX - r.left) / r.width));
    my.set(clamp01((e.clientY - r.top) / r.height));
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      className="relative w-full"
      style={{ perspective: 1400 }}
      initial={{ opacity: 0, scale: 0.05, rotateY: -1080, rotateZ: -35, y: "60vh", filter: "blur(30px)" }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.6, ease: [0.12, 1.15, 0.3, 1] }}
    >
      {/* Red glow behind */}
      <motion.div
        aria-hidden
        className="absolute inset-[6%] rounded-[2rem] bg-red blur-3xl"
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
      >
        <motion.div
          ref={ref}
          role="button"
          tabIndex={0}
          aria-label="National Art Pass for Adriana Hiromoto. Tap to flip."
          className="relative cursor-pointer select-none"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          onPointerMove={onMove}
          onPointerLeave={reset}
          onClick={(e) => {
            setFlipped((f) => !f);
            onTap?.(e.clientX, e.clientY);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          whileTap={{ scale: 0.96 }}
        >
          <motion.div
            className="relative aspect-[855/543] w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 13 }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[4.2%/6.6%] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/art-pass.png"
                alt="National Art Pass — Adriana Hiromoto, Individual"
                className="h-full w-full object-cover"
                draggable={false}
              />
              <div className="sheen absolute inset-0" />
              <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[4.2%/6.6%] border border-red/60 bg-ink p-[6%]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="flex items-center justify-between font-mono text-[clamp(8px,2.2vw,12px)] uppercase tracking-[0.2em] text-white/60">
                <span>Gift — 2026</span>
                <span className="text-red">● Valid everywhere art lives</span>
              </div>
              <p className="font-display text-[clamp(22px,8vw,48px)] uppercase leading-[0.9] text-white">
                Go see <span className="text-red">all</span> the art.
              </p>
              <p className="font-serif text-[clamp(14px,4.4vw,24px)] italic leading-tight text-white/80">
                Hundreds of museums &amp; galleries. One very deserving Adriana.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
