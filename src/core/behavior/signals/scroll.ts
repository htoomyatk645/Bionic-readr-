import type { SignalBus } from "./bus";

const VELOCITY_WINDOW_MS = 220;
const FLIP_DEBOUNCE_MS = 120;

export interface ScrollSignalHandle {
  stop(): void;
}

export function startScrollSignal(bus: SignalBus): ScrollSignalHandle {
  let lastY = window.scrollY;
  let lastAt = performance.now();
  let lastDirection = 0;
  let lastFlipAt = 0;

  const onScroll = () => {
    const now = performance.now();
    const y = window.scrollY;
    const dt = Math.max(1, now - lastAt);
    if (dt < VELOCITY_WINDOW_MS && Math.abs(y - lastY) < 2) return;

    const deltaY = y - lastY;
    const velocity = deltaY / dt;
    bus.emit({ kind: "scroll", deltaY, velocity, at: Date.now() });

    const direction = Math.sign(deltaY);
    if (direction !== 0 && lastDirection !== 0 && direction !== lastDirection) {
      if (now - lastFlipAt >= FLIP_DEBOUNCE_MS) {
        bus.emit({ kind: "scroll-direction-flip", at: Date.now() });
        lastFlipAt = now;
      }
    }
    if (direction !== 0) lastDirection = direction;

    lastY = y;
    lastAt = now;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return {
    stop() {
      window.removeEventListener("scroll", onScroll);
    }
  };
}
