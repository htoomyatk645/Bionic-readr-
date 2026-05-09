import type { DiscoveredBlock } from "~core/dom/structure";
import { canonicalUrl, readSession, writeSession } from "./store";
import type { ReadingAnchor, ReadingPosition, ReadingSession } from "./types";

const SAVE_INTERVAL_MS = 10_000;
const ANCHOR_OFFSET_RATIO = 0.3;

export interface TrackerHandle {
  stop(): void;
  flush(): Promise<void>;
}

interface TrackerInputs {
  getDiscoveredBlocks: () => DiscoveredBlock[];
}

export function startTracker({ getDiscoveredBlocks }: TrackerInputs): TrackerHandle {
  const url = canonicalUrl(window.location.href);
  const hostname = window.location.hostname;
  const startedAt = Date.now();
  let lastSavedAt = Date.now();
  let totalActiveMs = 0;
  let lastTickAt = Date.now();
  let isVisible = document.visibilityState === "visible";
  let stopped = false;

  let cachedSession: ReadingSession | null = null;
  void readSession(url).then((s) => {
    cachedSession = s;
  });

  const tick = () => {
    if (stopped) return;
    const now = Date.now();
    if (isVisible) totalActiveMs += now - lastTickAt;
    lastTickAt = now;
  };

  const computeAnchor = (): ReadingAnchor | null => {
    const blocks = getDiscoveredBlocks();
    if (blocks.length === 0) return null;
    const yLine = window.innerHeight * ANCHOR_OFFSET_RATIO;
    let best: { block: DiscoveredBlock; distance: number } | null = null;
    for (const b of blocks) {
      const rect = b.element.getBoundingClientRect();
      if (rect.bottom < 0) continue;
      if (rect.top > window.innerHeight) break;
      const distance = Math.abs(rect.top - yLine);
      if (!best || distance < best.distance) best = { block: b, distance };
    }
    if (!best) return null;
    const text = best.block.block.text.slice(0, 220);
    return { blockId: best.block.block.id, blockKind: best.block.block.kind, text };
  };

  const computePosition = (): ReadingPosition => {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0
    );
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollable = Math.max(1, documentHeight - viewportHeight);
    return {
      scrollY,
      scrollRatio: Math.min(1, Math.max(0, scrollY / scrollable)),
      viewportHeight,
      documentHeight
    };
  };

  const persist = async () => {
    tick();
    const previous = cachedSession;
    const session: ReadingSession = {
      url,
      hostname,
      title: document.title,
      position: computePosition(),
      anchor: computeAnchor(),
      totalTimeMs: (previous?.totalTimeMs ?? 0) + (Date.now() - lastSavedAt),
      sessions: previous?.sessions ?? 1,
      firstVisitAt: previous?.firstVisitAt ?? startedAt,
      lastVisitAt: Date.now()
    };
    lastSavedAt = Date.now();
    await writeSession(session);
    cachedSession = session;
  };

  const onVisibility = () => {
    tick();
    isVisible = document.visibilityState === "visible";
    if (!isVisible) void persist();
  };

  const onPageHide = () => {
    void persist();
  };

  const interval = window.setInterval(() => {
    tick();
    if (Date.now() - lastSavedAt >= SAVE_INTERVAL_MS) void persist();
  }, SAVE_INTERVAL_MS / 2);

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide);

  return {
    stop() {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.clearInterval(interval);
    },
    flush: persist
  };
}
