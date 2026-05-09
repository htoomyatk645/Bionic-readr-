import type { SignalBus } from "./bus";

const IDLE_THRESHOLD_MS = 8_000;
const TICK_MS = 1_500;

export interface IdleSignalHandle {
  stop(): void;
}

export function startIdleSignal(bus: SignalBus): IdleSignalHandle {
  let lastActivity = Date.now();
  let isIdle = false;

  const markActive = () => {
    lastActivity = Date.now();
    if (isIdle) {
      isIdle = false;
      bus.emit({ kind: "user-active", at: lastActivity });
    }
  };

  const events: (keyof DocumentEventMap)[] = [
    "mousemove",
    "keydown",
    "scroll",
    "wheel",
    "touchstart",
    "click",
    "selectionchange"
  ];
  for (const e of events) document.addEventListener(e, markActive, { passive: true });

  const interval = window.setInterval(() => {
    const idleMs = Date.now() - lastActivity;
    if (!isIdle && idleMs >= IDLE_THRESHOLD_MS) {
      isIdle = true;
      bus.emit({ kind: "user-idle", idleMs, at: Date.now() });
    }
  }, TICK_MS);

  return {
    stop() {
      for (const e of events) document.removeEventListener(e, markActive);
      window.clearInterval(interval);
    }
  };
}
