import type { PlasmoCSConfig } from "plasmo";
import {
  applyOverlay,
  applyRelief,
  clearRelief,
  createBehaviorEngine,
  NEUTRAL_OVERLAY,
  type AdaptiveOverlay,
  type AppliedAdaptation,
  type BehaviorEngineHandle,
  type BehaviorTickContext,
  type FrictionMap,
  type ReliefTarget
} from "~core/behavior";
import { createRenderer, type RendererHandle } from "~core/dom/renderer";
import {
  createLearningEngine,
  predictiveTrust,
  type CognitiveQueryContext,
  type LearningEngineHandle
} from "~core/learning";
import {
  composeOverlays,
  createPredictionEngine,
  type PredictionEngine
} from "~core/prediction";
import { getValue, onValueChanged } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { startTracker, type TrackerHandle } from "~features/memory";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { EffectiveSettings, ReaderSettings } from "~features/settings/types";
import { applyPageStyles, removePageStyles, updateAdaptiveVariables } from "./pageStyles";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
};

const LOG = "[bionic-redr/engine]";
console.info(LOG, "loaded on", window.location.hostname);

let renderer: RendererHandle | null = null;
let tracker: TrackerHandle | null = null;
let engine: BehaviorEngineHandle | null = null;
let learning: LearningEngineHandle | null = null;
let prediction: PredictionEngine = createPredictionEngine();

let lastSettings: ReaderSettings | null = null;
let lastEffective: EffectiveSettings | null = null;
let lastAdaptation: AppliedAdaptation | null = null;
let lastComposedOverlay: AdaptiveOverlay = NEUTRAL_OVERLAY;
let lastExcluded = false;

function isExcluded(settings: ReaderSettings): boolean {
  const host = window.location.hostname;
  return settings.excludedHosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function deepEqual<T>(a: T | null, b: T): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function discoveredAsBlocks(): { blockId: string; element: HTMLElement }[] {
  if (!renderer) return [];
  return renderer.getDiscoveredBlocks().map((d) => ({
    blockId: d.block.id,
    element: d.element
  }));
}

function discoveredAsReliefTargets(): ReliefTarget[] {
  if (!renderer) return [];
  return renderer.getDiscoveredBlocks().map((d) => ({
    blockId: d.block.id,
    element: d.element
  }));
}

function adaptationFromEffective(effective: EffectiveSettings): AppliedAdaptation {
  return applyOverlay(effective, NEUTRAL_OVERLAY);
}

async function pushAdaptationToRenderer(
  effective: EffectiveSettings,
  adaptation: AppliedAdaptation
): Promise<void> {
  if (!renderer) return;
  updateAdaptiveVariables(adaptation);
  await renderer.update({
    bionic: {
      enabled: effective.bionic.enabled,
      intensity: adaptation.bionicIntensity,
      fixationStrength: adaptation.bionicFixationStrength
    },
    radar: {
      enabled: effective.radar.enabled,
      intensity: adaptation.radarIntensity
    },
    skimLayer: adaptation.skimLayer
  });
}

function buildCognitiveContext(): CognitiveQueryContext | null {
  if (!learning) return null;
  const view = learning.view();
  return { cognitive: view.cognitive, emotional: view.emotional, patterns: view.patterns };
}

function handleTick(ctx: BehaviorTickContext): void {
  prediction.ingest(ctx.snapshot);
  if (learning) {
    learning.ingestBehaviorSnapshot(ctx.snapshot);
    if (engine) learning.noteActiveTime(engine.current().activeMs);
  }

  if (!ctx.significant || !lastEffective) return;

  const cognitiveCtx = buildCognitiveContext();
  let composed: AdaptiveOverlay = ctx.reactiveOverlay;

  if (cognitiveCtx) {
    const { signal, overlay: predictive } = prediction.overlay(ctx.snapshot, cognitiveCtx);
    const trust = predictiveTrust(cognitiveCtx, cognitiveCtx.cognitive.observedSessions);
    const effectiveTrust = Math.min(signal.confidence.combined, trust);
    composed = composeOverlays(ctx.reactiveOverlay, predictive, effectiveTrust);
  }

  lastComposedOverlay = composed;
  const adaptation = applyOverlay(lastEffective, composed);
  lastAdaptation = adaptation;
  void pushAdaptationToRenderer(lastEffective, adaptation);
}

function startBehaviorEngine(settings: ReaderSettings) {
  if (engine) return;
  if (!settings.adaptive.enabled) return;

  engine = createBehaviorEngine({
    getBlocks: () => discoveredAsBlocks(),
    getEffective: () => lastEffective ?? resolveEffectiveSettings(settings),
    onTick: handleTick,
    onSignalEvent: (event) => learning?.ingestSignalEvent(event),
    onFrictionChange: (friction: FrictionMap) => {
      if (!lastSettings?.adaptive.frictionRelief) return;
      applyRelief(discoveredAsReliefTargets(), friction);
    }
  });
}

async function stopBehaviorEngine() {
  if (!engine) return;
  const handle = engine;
  engine = null;
  await handle.stop();
  clearRelief();
}

async function startLearning() {
  if (learning) return;
  learning = await createLearningEngine();
}

async function stopLearning() {
  if (!learning) return;
  const handle = learning;
  learning = null;
  await handle.stop();
}

async function startAll(settings: ReaderSettings, effective: EffectiveSettings) {
  applyPageStyles(true);
  if (renderer) renderer.revert();
  if (!document.body) return;

  const adaptation = adaptationFromEffective(effective);
  lastAdaptation = adaptation;
  lastComposedOverlay = NEUTRAL_OVERLAY;
  updateAdaptiveVariables(adaptation);

  renderer = createRenderer(document.body, {
    bionic: {
      enabled: effective.bionic.enabled,
      intensity: adaptation.bionicIntensity,
      fixationStrength: adaptation.bionicFixationStrength
    },
    radar: { enabled: effective.radar.enabled, intensity: adaptation.radarIntensity },
    skimLayer: adaptation.skimLayer
  });

  if (!tracker) {
    tracker = startTracker({
      getDiscoveredBlocks: () => renderer?.getDiscoveredBlocks() ?? []
    });
  }

  prediction = createPredictionEngine();
  await startLearning();
  startBehaviorEngine(settings);
}

async function stopAll() {
  await stopBehaviorEngine();
  await stopLearning();
  if (renderer) {
    renderer.revert();
    renderer = null;
  }
  if (tracker) {
    void tracker.flush();
    tracker.stop();
    tracker = null;
  }
  removePageStyles();
  lastAdaptation = null;
  lastComposedOverlay = NEUTRAL_OVERLAY;
}

async function apply(settings: ReaderSettings) {
  const excluded = isExcluded(settings);
  const effective = resolveEffectiveSettings(settings);

  if (excluded) {
    if (!lastExcluded) {
      await stopAll();
      lastEffective = null;
      lastSettings = null;
      lastExcluded = true;
    }
    return;
  }

  if (lastExcluded || !renderer) {
    lastSettings = settings;
    lastEffective = effective;
    lastExcluded = false;
    await startAll(settings, effective);
    return;
  }

  const adaptiveToggleChanged =
    lastSettings?.adaptive.enabled !== settings.adaptive.enabled;
  const reliefToggleChanged =
    lastSettings?.adaptive.frictionRelief !== settings.adaptive.frictionRelief;

  if (deepEqual(lastEffective, effective) && !adaptiveToggleChanged && !reliefToggleChanged) {
    lastSettings = settings;
    return;
  }

  lastSettings = settings;
  lastEffective = effective;

  const overlay = settings.adaptive.enabled ? lastComposedOverlay : NEUTRAL_OVERLAY;
  const adaptation = applyOverlay(effective, overlay);
  lastAdaptation = adaptation;

  await pushAdaptationToRenderer(effective, adaptation);
  engine?.noteEffectiveSettingsChanged();

  if (adaptiveToggleChanged) {
    if (settings.adaptive.enabled) startBehaviorEngine(settings);
    else await stopBehaviorEngine();
  }
  if (!settings.adaptive.frictionRelief) clearRelief();
}

(async function init() {
  try {
    const stored = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
    const settings: ReaderSettings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      memory: { ...DEFAULT_SETTINGS.memory, ...(stored.memory ?? {}) },
      adaptive: { ...DEFAULT_SETTINGS.adaptive, ...(stored.adaptive ?? {}) }
    };
    console.info(LOG, "init", { excluded: isExcluded(settings), mode: settings.modes.current });
    await apply(settings);
    console.info(LOG, "renderer ready");

    onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
      if (!next) return;
      void apply({
        ...DEFAULT_SETTINGS,
        ...next,
        memory: { ...DEFAULT_SETTINGS.memory, ...(next.memory ?? {}) },
        adaptive: { ...DEFAULT_SETTINGS.adaptive, ...(next.adaptive ?? {}) }
      });
    });

    window.addEventListener("pagehide", () => {
      void learning?.flush();
    });
  } catch (err) {
    console.error(LOG, "init failed", err);
  }
})();
