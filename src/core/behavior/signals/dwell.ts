import type { SignalBus } from "./bus";

const ROOT_MARGIN = "-30% 0px -30% 0px";
const DWELL_REPORT_MS = 1_500;

export interface DwellTarget {
  blockId: string;
  element: Element;
}

export interface DwellSignalHandle {
  attach(targets: DwellTarget[]): void;
  detach(blockId: string): void;
  stop(): void;
}

interface DwellState {
  blockId: string;
  enteredAt: number | null;
  visits: number;
  totalDwellMs: number;
}

export function startDwellSignal(bus: SignalBus): DwellSignalHandle {
  const states = new Map<string, DwellState>();
  const elementToId = new WeakMap<Element, string>();

  const observer = new IntersectionObserver(
    (entries) => {
      const now = Date.now();
      for (const entry of entries) {
        const id = elementToId.get(entry.target);
        if (!id) continue;
        const state = states.get(id);
        if (!state) continue;
        if (entry.isIntersecting) {
          if (state.enteredAt === null) {
            state.enteredAt = now;
            state.visits += 1;
            bus.emit({ kind: "dwell-enter", blockId: id, at: now });
            if (state.visits >= 2) {
              bus.emit({ kind: "block-revisit", blockId: id, visit: state.visits, at: now });
            }
          }
        } else if (state.enteredAt !== null) {
          const durationMs = now - state.enteredAt;
          state.totalDwellMs += durationMs;
          state.enteredAt = null;
          if (durationMs >= DWELL_REPORT_MS) {
            bus.emit({ kind: "dwell-exit", blockId: id, durationMs, at: now });
          }
        }
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: [0, 0.25, 0.6] }
  );

  return {
    attach(targets) {
      for (const t of targets) {
        if (states.has(t.blockId)) continue;
        states.set(t.blockId, { blockId: t.blockId, enteredAt: null, visits: 0, totalDwellMs: 0 });
        elementToId.set(t.element, t.blockId);
        observer.observe(t.element);
      }
    },
    detach(blockId) {
      states.delete(blockId);
    },
    stop() {
      observer.disconnect();
      states.clear();
    }
  };
}
