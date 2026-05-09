import type { SignalBus } from "./bus";

export interface VisibilitySignalHandle {
  stop(): void;
}

export function startVisibilitySignal(bus: SignalBus): VisibilitySignalHandle {
  let hiddenAt: number | null = null;

  const onChange = () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = Date.now();
      bus.emit({ kind: "tab-hidden", at: hiddenAt });
    } else if (document.visibilityState === "visible") {
      const awayMs = hiddenAt ? Date.now() - hiddenAt : 0;
      hiddenAt = null;
      bus.emit({ kind: "tab-visible", awayMs, at: Date.now() });
    }
  };

  document.addEventListener("visibilitychange", onChange);
  return {
    stop() {
      document.removeEventListener("visibilitychange", onChange);
    }
  };
}
