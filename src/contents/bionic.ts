import type { PlasmoCSConfig } from "plasmo";
import {
  applyOverlay,
  applyRelief,
  clearRelief,
  createBehaviorEngine,
  NEUTRAL_OVERLAY,
  type AppliedAdaptation,
  type BehaviorEngineHandle,
  type BehaviorSnapshot,
  type FrictionMap,
  type ReliefTarget
} from "~core/behavior";
import { createRenderer, type RendererHandle } from "~core/dom/renderer";
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

let renderer: RendererHandle | null = null;
let tracker: TrackerHandle | null = null;
let engine: BehaviorEngineHandle | null = null;
let lastSettings: ReaderSettings | null = null;
let lastEffective: EffectiveSettings | null = null;
let lastAdaptation: AppliedAdaptation | null = null;
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

function startBehaviorEngine(settings: ReaderSettings) {
  if (engine) return;
  if (!settings.adaptive.enabled) return;

  engine = createBehaviorEngine({
    getBlocks: () => discoveredAsBlocks(),
    getEffective: () => lastEffective ?? resolveEffectiveSettings(settings),
    onAdaptation: (adaptation: AppliedAdaptation, _snapshot: BehaviorSnapshot) => {
      void _snapshot;
      lastAdaptation = adaptation;
      if (lastEffective) void pushAdaptationToRenderer(lastEffective, adaptation);
    },
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

function startAll(settings: ReaderSettings, effective: EffectiveSettings) {
  applyPageStyles(true);
  if (renderer) renderer.revert();
  if (!document.body) return;

  const adaptation = adaptationFromEffective(effective);
  lastAdaptation = adaptation;
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

  startBehaviorEngine(settings);
}

async function stopAll() {
  await stopBehaviorEngine();
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
    startAll(settings, effective);
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

  const overlay =
    settings.adaptive.enabled && engine ? engine.current().overlay ?? NEUTRAL_OVERLAY : NEUTRAL_OVERLAY;
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
  const stored = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const settings: ReaderSettings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    memory: { ...DEFAULT_SETTINGS.memory, ...(stored.memory ?? {}) },
    adaptive: { ...DEFAULT_SETTINGS.adaptive, ...(stored.adaptive ?? {}) }
  };
  await apply(settings);

  onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
    if (!next) return;
    void apply({
      ...DEFAULT_SETTINGS,
      ...next,
      memory: { ...DEFAULT_SETTINGS.memory, ...(next.memory ?? {}) },
      adaptive: { ...DEFAULT_SETTINGS.adaptive, ...(next.adaptive ?? {}) }
    });
  });
})();
