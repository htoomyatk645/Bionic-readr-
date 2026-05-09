import { analyzeBlocks, defaultProvider } from "~core/semantic";
import type { SemanticAnalysis, SemanticProvider } from "~core/semantic";
import type { BionicSettings, RadarSettings, SkimLayer } from "~features/settings/types";
import { applyRadar, clearRadar } from "~features/radar";
import { applySkimLayer, clearSkim } from "~features/skim";
import { discoverAndWrapBlocks, unwrapSentences, type DiscoveredBlock } from "./structure";
import { revertAll, transformTextNode } from "./transformer";
import { collectTextNodes } from "./walker";

const BATCH_SIZE = 80;
const OBSERVER_DEBOUNCE_MS = 140;

export interface RendererInputs {
  bionic: BionicSettings;
  radar: RadarSettings;
  skimLayer: SkimLayer;
  provider?: SemanticProvider;
}

export interface RendererHandle {
  stop(): void;
  revert(): void;
  update(next: RendererInputs): Promise<void>;
  getDiscoveredBlocks(): DiscoveredBlock[];
}

const idle: (cb: () => void) => void =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) =>
        (window as unknown as { requestIdleCallback: (fn: () => void) => void }).requestIdleCallback(cb)
    : (cb) => window.setTimeout(cb, 16);

function transformBatch(nodes: Text[], options: BionicSettings): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      const end = Math.min(i + BATCH_SIZE, nodes.length);
      for (; i < end; i++) {
        const n = nodes[i];
        if (!n.isConnected) continue;
        transformTextNode(n, {
          intensity: options.intensity,
          fixationStrength: options.fixationStrength,
          preserveCase: true
        });
      }
      if (i < nodes.length) idle(step);
      else resolve();
    };
    idle(step);
  });
}

export function createRenderer(root: HTMLElement, initial: RendererInputs): RendererHandle {
  let active = true;
  let inputs = initial;
  let discovered: DiscoveredBlock[] = [];
  let analysis: SemanticAnalysis | null = null;

  const restructure = async (target: HTMLElement) => {
    if (!active) return;
    const newBlocks = discoverAndWrapBlocks(target);
    if (newBlocks.length === 0) return;
    discovered = discovered.concat(newBlocks);

    if (inputs.bionic.enabled) {
      const nodes = collectTextNodes(target);
      await transformBatch(nodes, inputs.bionic);
    }

    await refreshOverlays();
  };

  const refreshOverlays = async () => {
    if (!active) return;
    if (inputs.radar.enabled) {
      try {
        analysis = await analyzeBlocks(
          discovered.map((d) => d.block),
          { provider: inputs.provider ?? defaultProvider(), intensity: inputs.radar.intensity }
        );
      } catch {
        analysis = null;
      }
    } else {
      analysis = null;
    }
    applyRadar(inputs.radar, analysis);
    applySkimLayer(inputs.skimLayer, discovered, analysis);
  };

  const fullRevert = () => {
    revertAll(root);
    unwrapSentences(root);
    clearRadar();
    clearSkim();
    discovered = [];
    analysis = null;
  };

  const pendingRoots = new Set<HTMLElement>();
  let observerTimer: number | null = null;

  const flush = () => {
    observerTimer = null;
    const targets = Array.from(pendingRoots);
    pendingRoots.clear();
    for (const t of targets) void restructure(t);
  };

  const observer = new MutationObserver((mutations) => {
    if (!active) return;
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const el = n as HTMLElement;
        if (el.hasAttribute?.("data-bionic-redr-frag")) return;
        if (el.hasAttribute?.("data-bionic-redr-sentence")) return;
        if (el.hasAttribute?.("data-bionic-redr-block")) return;
        pendingRoots.add(el);
      });
    }
    if (pendingRoots.size === 0) return;
    if (observerTimer !== null) return;
    observerTimer = window.setTimeout(flush, OBSERVER_DEBOUNCE_MS);
  });

  void restructure(root).then(() => {
    if (!active) return;
    observer.observe(root, { childList: true, subtree: true });
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
      fullRevert();
    },
    async update(next) {
      const prev = inputs;
      inputs = next;
      const bionicChanged =
        prev.bionic.enabled !== next.bionic.enabled ||
        prev.bionic.intensity !== next.bionic.intensity ||
        prev.bionic.fixationStrength !== next.bionic.fixationStrength;

      if (bionicChanged) {
        revertAll(root);
        if (next.bionic.enabled) {
          const nodes = collectTextNodes(root);
          await transformBatch(nodes, next.bionic);
        }
      }
      await refreshOverlays();
    },
    getDiscoveredBlocks() {
      return discovered;
    }
  };
}
