import type {
  EffectiveSettings,
  ModeOverride,
  ReaderSettings
} from "~features/settings/types";
import { MODE_PRESETS } from "./presets";

export function resolveEffectiveSettings(settings: ReaderSettings): EffectiveSettings {
  const modeId = settings.modes.current;
  const preset = MODE_PRESETS[modeId];
  const override: ModeOverride = settings.modes.customizations[modeId] ?? {};

  return {
    mode: modeId,
    bionic: { ...preset.bionic, ...(override.bionic ?? {}) },
    typography: { ...preset.typography, ...(override.typography ?? {}) },
    skimLayer: override.skimLayer ?? preset.skimLayer,
    radar: { ...preset.radar, ...(override.radar ?? {}) }
  };
}
