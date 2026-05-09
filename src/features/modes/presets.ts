import type { ModeId } from "~features/settings/types";
import type { ModeMeta, ModePreset } from "./types";

export const MODE_PRESETS: Record<ModeId, ModePreset> = {
  focus: {
    id: "focus",
    label: "Focus",
    tagline: "Calm anchors, undistracted reading.",
    bionic: { enabled: true, intensity: "medium", fixationStrength: 1 },
    typography: { fontScale: 1, lineHeight: 1.6, letterSpacing: 0, paragraphSpacing: 1 },
    skimLayer: "full",
    radar: { enabled: true, intensity: "subtle" }
  },
  flow: {
    id: "flow",
    label: "Flow",
    tagline: "Light touch, easy momentum.",
    bionic: { enabled: true, intensity: "low", fixationStrength: 0.9 },
    typography: { fontScale: 1, lineHeight: 1.75, letterSpacing: 0.005, paragraphSpacing: 1.1 },
    skimLayer: "full",
    radar: { enabled: false, intensity: "subtle" }
  },
  study: {
    id: "study",
    label: "Study",
    tagline: "Strong anchors, structure surfaced.",
    bionic: { enabled: true, intensity: "high", fixationStrength: 1.05 },
    typography: { fontScale: 1, lineHeight: 1.55, letterSpacing: 0, paragraphSpacing: 0.9 },
    skimLayer: "full",
    radar: { enabled: true, intensity: "medium" }
  },
  deep: {
    id: "deep",
    label: "Deep Read",
    tagline: "Spacious, immersive, contemplative.",
    bionic: { enabled: true, intensity: "medium", fixationStrength: 0.95 },
    typography: { fontScale: 1.05, lineHeight: 1.85, letterSpacing: 0.01, paragraphSpacing: 1.25 },
    skimLayer: "full",
    radar: { enabled: true, intensity: "subtle" }
  }
};

export const MODE_META: ModeMeta[] = (Object.keys(MODE_PRESETS) as ModeId[]).map((id) => ({
  id,
  label: MODE_PRESETS[id].label,
  tagline: MODE_PRESETS[id].tagline
}));
