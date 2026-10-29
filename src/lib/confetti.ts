import confetti from "canvas-confetti";

const Z = 60;

/** The big one: layered burst from the centre plus corner cannons. */
export function bigBang() {
  const origin = { x: 0.5, y: 0.45 };
  const total = 420;
  const fire = (ratio: number, opts: confetti.Options) =>
    confetti({ origin, zIndex: Z, ...opts, particleCount: Math.floor(total * ratio) });

  fire(0.25, { spread: 26, startVelocity: 70 });
  fire(0.2, { spread: 60, startVelocity: 60 });
  fire(0.35, { spread: 110, decay: 0.91, scalar: 0.9, startVelocity: 55 });
  fire(0.15, { spread: 140, startVelocity: 30, decay: 0.92, scalar: 1.3 });
  confetti({
    particleCount: 180,
    spread: 360,
    startVelocity: 55,
    ticks: 320,
    origin,
    zIndex: Z,
    shapes: ["star", "circle", "square"],
    scalar: 1.1,
  });

  window.setTimeout(() => {
    confetti({ particleCount: 140, angle: 60, spread: 70, startVelocity: 85, origin: { x: 0, y: 1 }, zIndex: Z });
    confetti({ particleCount: 140, angle: 120, spread: 70, startVelocity: 85, origin: { x: 1, y: 1 }, zIndex: Z });
  }, 250);

  window.setTimeout(() => {
    confetti({ particleCount: 120, spread: 180, startVelocity: 40, origin: { x: 0.5, y: 0 }, angle: 270, zIndex: Z, ticks: 400 });
  }, 600);
}

/** Continuous streams from both sides. Returns a stop function. */
export function sideCannons(durationMs: number) {
  const end = Date.now() + durationMs;
  let raf = 0;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, startVelocity: 70, origin: { x: 0, y: 0.75 }, zIndex: Z });
    confetti({ particleCount: 4, angle: 120, spread: 55, startVelocity: 70, origin: { x: 1, y: 0.75 }, zIndex: Z });
    if (Date.now() < end) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

/** Burst at a viewport position in pixels. */
export function burstAt(x: number, y: number, big = false) {
  confetti({
    particleCount: big ? 220 : 90,
    spread: big ? 360 : 100,
    startVelocity: big ? 50 : 38,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    shapes: ["star", "circle", "square"],
    zIndex: Z,
  });
}

/** A random firework somewhere on screen, for the idle loop. */
export function randomFirework() {
  confetti({
    particleCount: 70,
    spread: 360,
    startVelocity: 28,
    ticks: 120,
    gravity: 0.6,
    origin: { x: 0.15 + Math.random() * 0.7, y: 0.1 + Math.random() * 0.35 },
    zIndex: Z,
  });
}
