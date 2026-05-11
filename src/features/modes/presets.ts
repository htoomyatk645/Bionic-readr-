import type { ModeId } from "~features/settings/types";
import type { ModeMeta, ModePreset } from "./types";

export const MODE_PRESETS: Record<ModeId, ModePreset> = {
  focus: {
    id: "focus",
    label: "Focus",
    tagline: "Calm anchors, undistracted reading.",
    bionic: { enabled: true, intensity: "medium", fixationStrength: 0.85 },
    typography: { fontScale: 1, lineHeight: 1.5, letterSpacing: 0, paragraphSpacing: 1 },
    skimLayer: "full",
    radar: { enabled: true, intensity: "subtle" }
  },
  flow: {
    id: "flow",
    label: "Flow",
    tagline: "Smooth rhythm, natural progression.",
    bionic: { enabled: true, intensity: "low", fixationStrength: 0.7 },
    typography: { fontScale: 1, lineHeight: 1.6, letterSpacing: 0, paragraphSpacing: 1 },
    skimLayer: "key",
    radar: { enabled: true, intensity: "subtle" }
  },
  study: {
    id: "study",
    label: "Study",
    tagline: "Active retention, careful comprehension.",
    bionic: { enabled: true, intensity: "high", fixationStrength: 0.95 },
    typography: { fontScale: 1, lineHeight: 1.7, letterSpacing: 0, paragraphSpacing: 1 },
    skimLayer: "headlines",
    radar: { enabled: true, intensity: "medium" }
  },
  deep: {
    id: "deep",
    label: "Deep Read",
    tagline: "Maximum immersion, full analysis.",
    bionic: { enabled: true, intensity: "max", fixationStrength: 1.0 },
    typography: { fontScale: 1, lineHeight: 1.8, letterSpacing: 0, paragraphSpacing: 1 },
    skimLayer: "full",
    radar: { enabled: true, intensity: "subtle" }
  }
};

export const MODE_META: ModeMeta[] = (Object.keys(MODE_PRESETS) as ModeId[]).map((id) => ({
  id,
  label: MODE_PRESETS[id].label,
  tagline: MODE_PRESETS[id].tagline
}));
