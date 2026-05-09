import type { FrictionEntry, FrictionMap, SignalEvent } from "../types";

const HIGH_RELIEF_THRESHOLD = 1.6;
const SCORE_DECAY_PER_MIN = 0.25;

interface MutableEntry {
  blockId: string;
  score: number;
  visits: number;
  lastObservedAt: number;
}

export class FrictionTracker {
  private entries = new Map<string, MutableEntry>();
  private listeners = new Set<(map: FrictionMap) => void>();

  ingest(event: SignalEvent): void {
    switch (event.kind) {
      case "dwell-enter":
        this.bump(event.blockId, 0, event.at);
        break;
      case "dwell-exit":
        if (event.durationMs >= 8000) this.bump(event.blockId, 0.25, event.at);
        else if (event.durationMs < 1200) this.bump(event.blockId, 0.18, event.at);
        break;
      case "block-revisit":
        this.bump(event.blockId, 0.55, event.at);
        break;
      case "scroll-direction-flip":
        // not block-scoped; ignored here
        break;
      default:
        break;
    }
  }

  private bump(blockId: string, delta: number, at: number): void {
    const decayed = this.decayedEntry(blockId, at);
    decayed.score = Math.min(3, decayed.score + delta);
    decayed.visits += delta > 0 ? 1 : 0;
    decayed.lastObservedAt = at;
    this.entries.set(blockId, decayed);
    this.notify();
  }

  private decayedEntry(blockId: string, now: number): MutableEntry {
    const existing = this.entries.get(blockId);
    if (!existing) return { blockId, score: 0, visits: 0, lastObservedAt: now };
    const minutes = Math.max(0, (now - existing.lastObservedAt) / 60_000);
    const decayed = Math.max(0, existing.score - SCORE_DECAY_PER_MIN * minutes);
    return { ...existing, score: decayed };
  }

  subscribe(listener: (map: FrictionMap) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  current(): FrictionMap {
    const now = Date.now();
    const out = new Map<string, FrictionEntry>();
    const high = new Set<string>();
    for (const [id, e] of this.entries) {
      const decayed = this.decayedEntry(id, now);
      if (decayed.score < 0.05 && decayed.visits === 0) continue;
      out.set(id, {
        blockId: decayed.blockId,
        score: decayed.score,
        visits: decayed.visits,
        lastObservedAt: decayed.lastObservedAt
      });
      if (decayed.score >= HIGH_RELIEF_THRESHOLD) high.add(id);
    }
    return { entries: out, highRelief: high };
  }

  private notify(): void {
    if (this.listeners.size === 0) return;
    const snap = this.current();
    for (const listener of this.listeners) listener(snap);
  }

  clear(): void {
    this.entries.clear();
    this.notify();
  }
}
