import type { BionicOptions } from "../bionic/types";
import { collectTextNodes } from "./walker";
import { revertAll, transformTextNode } from "./transformer";

interface RenderHandle {
  stop(): void;
  revert(): void;
  retransform(options: BionicOptions): void;
}

const BATCH_SIZE = 80;
const OBSERVER_DEBOUNCE_MS = 120;

type IdleCallback = (cb: () => void) => void;

const scheduleIdle: IdleCallback =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) => (window as unknown as { requestIdleCallback: (fn: () => void) => void }).requestIdleCallback(cb)
    : (cb) => window.setTimeout(cb, 16);

function transformInBatches(nodes: Text[], options: BionicOptions): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      const end = Math.min(i + BATCH_SIZE, nodes.length);
      for (; i < end; i++) {
        const node = nodes[i];
        if (!node.isConnected) continue;
        transformTextNode(node, options);
      }
      if (i < nodes.length) {
        scheduleIdle(step);
      } else {
        resolve();
      }
    };
    scheduleIdle(step);
  });
}

export function renderBionic(root: HTMLElement, options: BionicOptions): RenderHandle {
  let active = true;
  let currentOptions = options;

  const apply = async (target: Node = root) => {
    if (!active) return;
    const nodes = collectTextNodes(target);
    if (nodes.length === 0) return;
    await transformInBatches(nodes, currentOptions);
  };

  const pendingRoots = new Set<Node>();
  let observerTimer: number | null = null;

  const flush = () => {
    observerTimer = null;
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    for (const r of roots) apply(r);
  };

  const observer = new MutationObserver((mutations) => {
    if (!active) return;
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE) {
          pendingRoots.add(n);
        }
      });
    }
    if (pendingRoots.size === 0) return;
    if (observerTimer !== null) return;
    observerTimer = window.setTimeout(flush, OBSERVER_DEBOUNCE_MS);
  });

  apply(root).then(() => {
    if (!active) return;
    observer.observe(root, { childList: true, subtree: true, characterData: false });
  });

  return {
    stop() {
      active = false;
      observer.disconnect();
      if (observerTimer !== null) {
        window.clearTimeout(observerTimer);
        observerTimer = null;
      }
    },
    revert() {
      active = false;
      observer.disconnect();
      revertAll(root);
    },
    retransform(next) {
      currentOptions = next;
      revertAll(root);
      apply(root);
    }
  };
}

export type { RenderHandle };
