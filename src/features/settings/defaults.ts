import type { ReaderSettings } from "./types";

export const DEFAULT_SETTINGS: ReaderSettings = {
  bionic: {
    enabled: true,
    intensity: "medium",
    fixationStrength: 1
  },
  typography: {
    fontScale: 1,
    lineHeight: 1.6,
    letterSpacing: 0,
    paragraphSpacing: 1
  },
  skimLayer: "full",
  theme: "system",
  excludedHosts: []
};

export const SETTINGS_KEY = "bionic-redr.settings.v1";
