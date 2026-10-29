"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*@!?/<>";

/** Scrambles random glyphs, then resolves left-to-right into the real text. */
export default function DecryptedText({
  text,
  duration = 1200,
  delay = 0,
  className,
}: {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(() => text.replace(/\S/g, " "));

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const timer = window.setTimeout(() => {
      const tick = (t: number) => {
        if (!start) start = t;
        const progress = Math.min(1, (t - start) / duration);
        const revealed = Math.floor(progress * text.length);
        setShown(
          text
            .split("")
            .map((ch, i) =>
              ch === " " || i < revealed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(""),
        );
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, duration, delay]);

  return (
    <span className={className} aria-label={text}>
      {shown}
    </span>
  );
}
