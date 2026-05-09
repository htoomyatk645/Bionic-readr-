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
