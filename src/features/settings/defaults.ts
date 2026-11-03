import type { ReaderSettings } from "./types";

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "system",
  excludedHosts: [],
  modes: {
    current: "focus",
    customizations: {}
  },
  memory: {
    enabled: true,
    showWarmup: true
  },
  adaptive: {
    enabled: true,
    frictionRelief: true
  }
};

export const SETTINGS_KEY = "bionic-redr.settings.v1";

/** Fill any missing/older fields from defaults so every consumer sees a full shape. */
export function normalizeSettings(stored: Partial<ReaderSettings> | null | undefined): ReaderSettings {
  if (!stored || typeof stored !== "object") return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    excludedHosts: Array.isArray(stored.excludedHosts) ? stored.excludedHosts : [],
    modes: {
      ...DEFAULT_SETTINGS.modes,
      ...(stored.modes ?? {}),
      customizations: {
        ...DEFAULT_SETTINGS.modes.customizations,
        ...(stored.modes?.customizations ?? {})
      }
    },
    memory: { ...DEFAULT_SETTINGS.memory, ...(stored.memory ?? {}) },
    adaptive: { ...DEFAULT_SETTINGS.adaptive, ...(stored.adaptive ?? {}) }
  };
}

/** True when `host` (or one of its parent domains) is on the pause list. */
export function isHostExcluded(settings: ReaderSettings, host: string): boolean {
  return settings.excludedHosts.some((h) => host === h || host.endsWith(`.${h}`));
}
