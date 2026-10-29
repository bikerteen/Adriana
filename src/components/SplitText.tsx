"use client";

import { motion } from "motion/react";

/** Letters slam in one by one with a 3D flip and blur. */
export default function SplitText({
  text,
  delay = 0,
  stagger = 0.06,
  from = "top",
  className,
  letterClassName,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  from?: "top" | "bottom";
  className?: string;
  letterClassName?: string;
}) {
  const dir = from === "top" ? -1 : 1;
  return (
    <span className={className} aria-label={text} style={{ perspective: 800 }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block ${letterClassName ?? ""}`}
          initial={{ y: `${dir * 140}%`, rotateX: dir * -100, scale: 1.8, opacity: 0, filter: "blur(14px)" }}
          animate={{ y: "0%", rotateX: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * stagger,
            type: "spring",
            stiffness: 260,
            damping: 14,
            mass: 0.9,
            filter: { duration: 0.35, delay: delay + i * stagger },
            opacity: { duration: 0.2, delay: delay + i * stagger },
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}
