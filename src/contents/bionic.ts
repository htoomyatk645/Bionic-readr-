import type { PlasmoCSConfig } from "plasmo";
import { renderBionic, type RenderHandle } from "~core/dom/renderer";
import { getValue, onValueChanged } from "~core/storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "~features/settings/defaults";
import type { ReaderSettings } from "~features/settings/types";
import { applyTypography, removeTypography } from "./typography";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  run_at: "document_idle"
};

let handle: RenderHandle | null = null;
let lastSettings: ReaderSettings | null = null;

function isExcluded(settings: ReaderSettings): boolean {
  const host = window.location.hostname;
  return settings.excludedHosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function start(settings: ReaderSettings) {
  if (handle) handle.revert();
  handle = null;

  applyTypography(settings.typography, settings.bionic.enabled);

  if (!settings.bionic.enabled) return;
  if (isExcluded(settings)) return;
  if (!document.body) return;

  handle = renderBionic(document.body, {
    intensity: settings.bionic.intensity,
    fixationStrength: settings.bionic.fixationStrength,
    preserveCase: true
  });
}

function stop() {
  if (handle) {
    handle.revert();
    handle = null;
  }
  removeTypography();
}

function settingsChanged(prev: ReaderSettings | null, next: ReaderSettings): boolean {
  if (!prev) return true;
  return JSON.stringify(prev) !== JSON.stringify(next);
}

function apply(settings: ReaderSettings) {
  if (!settingsChanged(lastSettings, settings)) return;
  lastSettings = settings;
  if (settings.bionic.enabled && !isExcluded(settings)) {
    start(settings);
  } else {
    stop();
  }
}

(async function init() {
  const settings = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  apply(merged);

  onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
    if (!next) return;
    apply({ ...DEFAULT_SETTINGS, ...next });
  });
})();
