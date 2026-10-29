"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import WarpField, { type WarpMode } from "./WarpField";
import DecryptedText from "./DecryptedText";
import SplitText from "./SplitText";
import PassCard from "./PassCard";
import { bigBang, burstAt, randomFirework, sideCannons } from "@/lib/confetti";

type Phase = "gate" | "countdown" | "boom" | "reveal";

const BEAT = 850;

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
};

const warpFor: Record<Phase, WarpMode> = {
  gate: "idle",
  countdown: "warp",
  boom: "warp",
  reveal: "calm",
};

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [count, setCount] = useState(3);
  const [run, setRun] = useState(0);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const shake = useCallback(
    (k: number) => {
      if (!scope.current) return;
      animate(
        scope.current,
        {
          x: [0, -18, 16, -12, 9, -5, 2, 0].map((v) => v * k),
          y: [0, 10, -12, 8, -5, 3, -1, 0].map((v) => v * k),
          rotate: [0, -1.2, 1, -0.6, 0.4, -0.2, 0, 0].map((v) => v * k),
        },
        { duration: 0.55, ease: "easeOut" },
      );
    },
    [animate, scope],
  );

  const start = () => {
    setCount(3);
    setPhase("countdown");
    setRun((r) => r + 1);
  };

  // 3… 2… 1…
  useEffect(() => {
    if (phase !== "countdown") return;
    const timers = [3, 2, 1].map((n, i) =>
      window.setTimeout(() => {
        setCount(n);
        shake(0.5 + i * 0.4);
        vibrate(40 + i * 30);
      }, i * BEAT),
    );
    timers.push(window.setTimeout(() => setPhase("boom"), 3 * BEAT));
    return () => timers.forEach(clearTimeout);
  }, [phase, run, shake]);

  // BOOM
  useEffect(() => {
    if (phase !== "boom") return;
    shake(2.4);
    bigBang();
    vibrate([120, 60, 260]);
    const t = window.setTimeout(() => setPhase("reveal"), 700);
    return () => clearTimeout(t);
  }, [phase, run, shake]);

  // Keep the party going
  useEffect(() => {
    if (phase !== "reveal") return;
    const stop = sideCannons(3800);
    const iv = window.setInterval(randomFirework, 3200);
    return () => {
      stop();
      clearInterval(iv);
    };
  }, [phase, run]);

  const showCard = phase === "boom" || phase === "reveal";

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-ink">
      <WarpField mode={warpFor[phase]} />
      <div className="grain" aria-hidden />

      <div ref={scope} className="relative z-10 min-h-[100svh]">
        <AnimatePresence mode="wait">
          {phase === "gate" && <Gate key="gate" onOpen={start} />}
        </AnimatePresence>

        {/* Countdown */}
        <AnimatePresence>
          {phase === "countdown" && (
            <motion.div
              key={`count-${run}-${count}`}
              className="pointer-events-none fixed inset-0 flex items-center justify-center"
              initial={{ scale: 3.2, opacity: 0, filter: "blur(30px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.2, opacity: 0, filter: "blur(20px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <span className="font-display text-[min(70vh,90vw)] leading-none text-red drop-shadow-[0_0_60px_rgba(255,26,26,0.7)]">
                {count}
              </span>
              <motion.span
                className="absolute aspect-square w-[60vmin] rounded-full border-2 border-white"
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash + shockwaves on impact */}
        {phase === "boom" && <Impact key={`impact-${run}`} />}

        {showCard && <Reveal key={`reveal-${run}`} showText={phase === "reveal"} onReplay={start} />}
      </div>
    </main>
  );
}

function Gate({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.section
      className="flex min-h-[100svh] flex-col items-center justify-between px-6 py-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.6, filter: "blur(24px)", transition: { duration: 0.5 } }}
    >
      <div className="flex w-full max-w-xl items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
        <span className="flex items-center gap-2">
          <span className="blink inline-block h-2 w-2 rounded-full bg-red" />
          Incoming
        </span>
        <span>NFC / 001</span>
      </div>

      <div className="flex flex-col items-center gap-5">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-red">Classified delivery for</p>
        <h1 className="font-display text-[clamp(64px,20vw,180px)] uppercase leading-[0.85] tracking-tight">
          <DecryptedText text="ADRIANA" duration={1400} delay={300} />
          <br />
          <DecryptedText text="HIROMOTO" duration={1400} delay={700} className="text-white/25" />
        </h1>
        <motion.p
          className="max-w-xs font-serif text-xl italic text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          A little something before you go.
        </motion.p>
      </div>

      <motion.button
        type="button"
        onClick={onOpen}
        className="group relative flex aspect-square w-36 items-center justify-center rounded-full bg-red font-display text-xl uppercase tracking-wider text-white"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2.1, type: "spring", stiffness: 200, damping: 12 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-red"
            animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
          />
        ))}
        <span className="relative leading-none">
          Tap to
          <br />
          open
        </span>
      </motion.button>

      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        ⚠ Contains excessive celebration
      </p>
    </motion.section>
  );
}

function Impact() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {[
        { c: "border-red", d: 0, w: "border-[14px]" },
        { c: "border-white", d: 0.08, w: "border-4" },
        { c: "border-red", d: 0.18, w: "border-2" },
      ].map((r, i) => (
        <motion.span
          key={i}
          className={`absolute aspect-square w-[40vmin] rounded-full ${r.c} ${r.w}`}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 7, opacity: 0 }}
          transition={{ duration: 1.1, delay: r.d, ease: [0.1, 0.8, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

function Marquee({ text, reverse, className }: { text: string; reverse?: boolean; className: string }) {
  const chunk = Array.from({ length: 6 }, () => text).join("");
  return (
    <div className={`overflow-hidden whitespace-nowrap py-2 ${className}`}>
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        <span className="pr-0">{chunk}</span>
        <span className="pr-0">{chunk}</span>
      </div>
    </div>
  );
}

function Reveal({ showText, onReplay }: { showText: boolean; onReplay: () => void }) {
  const moreConfetti = (e: React.MouseEvent) => {
    burstAt(e.clientX, e.clientY, true);
    bigBang();
    vibrate([60, 40, 120]);
  };

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-10 pt-16">
      {/* Spinning red rays behind everything */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[180vmax] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <div className="rays h-full w-full rounded-full" />
      </motion.div>

      {/* Marquee bands */}
      {showText && (
        <>
          <motion.div
            className="pointer-events-none absolute left-[-10%] right-[-10%] top-[9%] -z-[5] -rotate-6"
            initial={{ x: "-110%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <Marquee
              text="CONGRATS ADRIANA ✦ "
              className="bg-red font-display text-2xl uppercase tracking-wide text-ink"
            />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute bottom-[7%] left-[-10%] right-[-10%] -z-[5] rotate-[4deg]"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            <Marquee
              text="YOU WILL BE MISSED ✦ VML → NEXT CHAPTER ✦ "
              reverse
              className="bg-white font-display text-2xl uppercase tracking-wide text-ink"
            />
          </motion.div>
        </>
      )}

      {/* Corner labels */}
      {showText && (
        <div className="absolute left-0 right-0 top-0 mx-auto flex max-w-2xl items-center justify-between px-5 pt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
          <DecryptedText text="VML / FAREWELL EDITION" duration={900} />
          <DecryptedText text="N°001 — 2026" duration={900} delay={200} />
        </div>
      )}

      <div className="relative flex w-full max-w-[520px] flex-col items-center">
        <h2 className="relative z-0 -mb-[0.18em] h-[clamp(64px,min(22vw,17vh),170px)] whitespace-nowrap font-display text-[clamp(64px,min(22vw,17vh),170px)] uppercase leading-[0.9] tracking-tight">
          {showText && <SplitText text="CONGRATS" stagger={0.05} />}
        </h2>

        <div className="relative z-10 w-[min(92vw,520px,72vh)]">
          <PassCard onTap={(x, y) => burstAt(x, y)} />
        </div>

        <h1 className="relative z-20 -mt-[0.12em] h-[clamp(76px,min(27vw,20vh),200px)] whitespace-nowrap font-display text-[clamp(76px,min(27vw,20vh),200px)] uppercase leading-[0.9] tracking-tight text-red drop-shadow-[0_0_40px_rgba(255,26,26,0.55)]">
          {showText && <SplitText text="ADRIANA" from="bottom" delay={0.45} stagger={0.07} />}
        </h1>

        <div className="mt-2 h-12 text-center">
          {showText && (
            <p className="font-serif text-[clamp(28px,8.5vw,48px)] leading-none">
              {["You", "will", "be"].map((w, i) => (
                <motion.span
                  key={w}
                  className="mr-[0.25em] inline-block"
                  initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 1.3 + i * 0.15, duration: 0.6 }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                className="relative inline-block italic text-red"
                initial={{ opacity: 0, scale: 2.5, rotate: -8, filter: "blur(16px)" }}
                animate={{ opacity: 1, scale: 1, rotate: -3, filter: "blur(0px)" }}
                transition={{ delay: 1.85, type: "spring", stiffness: 260, damping: 12 }}
              >
                missed.
                <motion.span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.span>
            </p>
          )}
        </div>

        {showText && (
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <motion.button
              type="button"
              onClick={moreConfetti}
              className="rounded-full bg-red px-6 py-3 font-display text-lg uppercase tracking-wider text-white shadow-[0_0_30px_rgba(255,26,26,0.5)]"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9, rotate: -3 }}
            >
              More confetti
            </motion.button>
            <motion.button
              type="button"
              onClick={onReplay}
              className="rounded-full border border-white/40 bg-ink/60 px-6 py-3 font-display text-lg uppercase tracking-wider text-white backdrop-blur"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
            >
              Replay
            </motion.button>
          </motion.div>
        )}

        {showText && (
          <motion.p
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            Tap the card ↺
          </motion.p>
        )}
      </div>
    </section>
  );
}
