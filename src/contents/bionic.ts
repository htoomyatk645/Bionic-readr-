import type { PlasmoCSConfig } from "plasmo";
import { createRenderer, type RendererHandle } from "~core/dom/renderer";
import { getValue, onValueChanged } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { startTracker, type TrackerHandle } from "~features/memory";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { EffectiveSettings, ReaderSettings } from "~features/settings/types";
import { applyPageStyles, removePageStyles } from "./pageStyles";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
};

let renderer: RendererHandle | null = null;
let tracker: TrackerHandle | null = null;
let lastEffective: EffectiveSettings | null = null;
let lastExcluded = false;

function isExcluded(settings: ReaderSettings): boolean {
  const host = window.location.hostname;
  return settings.excludedHosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function effectiveEqual(a: EffectiveSettings | null, b: EffectiveSettings): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function startAll(effective: EffectiveSettings) {
  applyPageStyles(effective, true);
  if (!document.body) return;
  if (renderer) renderer.revert();
  renderer = createRenderer(document.body, {
    bionic: effective.bionic,
    radar: effective.radar,
    skimLayer: effective.skimLayer
  });
  if (!tracker) {
    tracker = startTracker({
      getDiscoveredBlocks: () => renderer?.getDiscoveredBlocks() ?? []
    });
  }
}

function stopAll() {
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
}

async function apply(settings: ReaderSettings) {
  const excluded = isExcluded(settings);
  const effective = resolveEffectiveSettings(settings);

  if (excluded) {
    if (!lastExcluded) {
      stopAll();
      lastEffective = null;
      lastExcluded = true;
    }
    return;
  }

  if (effectiveEqual(lastEffective, effective) && !lastExcluded) return;

  if (!renderer) {
    startAll(effective);
  } else {
    applyPageStyles(effective, true);
    await renderer.update({
      bionic: effective.bionic,
      radar: effective.radar,
      skimLayer: effective.skimLayer
    });
  }

  lastEffective = effective;
  lastExcluded = false;
}

(async function init() {
  const stored = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  await apply(settings);

  onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
    if (!next) return;
    void apply({ ...DEFAULT_SETTINGS, ...next });
  });
})();
