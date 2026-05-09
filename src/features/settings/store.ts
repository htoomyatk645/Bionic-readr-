import { create } from "zustand";
import { getValue, onValueChanged, setValue } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "./defaults";
import type {
  BionicSettings,
  EffectiveSettings,
  MemorySettings,
  ModeId,
  ModeOverride,
  RadarSettings,
  ReaderSettings,
  SkimLayer,
  TypographySettings
} from "./types";

interface SettingsState {
  settings: ReaderSettings;
  effective: EffectiveSettings;
  hydrated: boolean;
  hydrate(): Promise<void>;
  setMode(mode: ModeId): Promise<void>;
  patchMode(mode: ModeId, patch: ModeOverride): Promise<void>;
  patchActiveBionic(patch: Partial<BionicSettings>): Promise<void>;
  patchActiveTypography(patch: Partial<TypographySettings>): Promise<void>;
  patchActiveRadar(patch: Partial<RadarSettings>): Promise<void>;
  setActiveSkimLayer(layer: SkimLayer): Promise<void>;
  patchMemory(patch: Partial<MemorySettings>): Promise<void>;
  toggleHostExcluded(host: string): Promise<void>;
  resetActiveMode(): Promise<void>;
  reset(): Promise<void>;
}

let unsubscribe: (() => void) | null = null;

function mergeWithDefaults(stored: Partial<ReaderSettings> | null | undefined): ReaderSettings {
  if (!stored) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    modes: {
      ...DEFAULT_SETTINGS.modes,
      ...(stored.modes ?? {}),
      customizations: {
        ...DEFAULT_SETTINGS.modes.customizations,
        ...((stored.modes ?? {}).customizations ?? {})
      }
    },
    memory: { ...DEFAULT_SETTINGS.memory, ...(stored.memory ?? {}) }
  };
}

async function persist(next: ReaderSettings) {
  await setValue(SETTINGS_KEY, next);
}

export const useSettings = create<SettingsState>((set, get) => {
  const writeOverride = async (mode: ModeId, patch: ModeOverride) => {
    const current = get().settings;
    const existing = current.modes.customizations[mode] ?? {};
    const merged: ModeOverride = {
      ...existing,
      ...patch,
      bionic: { ...(existing.bionic ?? {}), ...(patch.bionic ?? {}) },
      typography: { ...(existing.typography ?? {}), ...(patch.typography ?? {}) },
      radar: { ...(existing.radar ?? {}), ...(patch.radar ?? {}) }
    };
    const next: ReaderSettings = {
      ...current,
      modes: {
        ...current.modes,
        customizations: { ...current.modes.customizations, [mode]: merged }
      }
    };
    set({ settings: next, effective: resolveEffectiveSettings(next) });
    await persist(next);
  };

  return {
    settings: DEFAULT_SETTINGS,
    effective: resolveEffectiveSettings(DEFAULT_SETTINGS),
    hydrated: false,

    async hydrate() {
      const stored = await getValue<ReaderSettings | null>(SETTINGS_KEY, null);
      const merged = mergeWithDefaults(stored);
      set({ settings: merged, effective: resolveEffectiveSettings(merged), hydrated: true });
      if (unsubscribe) unsubscribe();
      unsubscribe = onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
        if (!next) return;
        const remerged = mergeWithDefaults(next);
        set({ settings: remerged, effective: resolveEffectiveSettings(remerged) });
      });
    },

    async setMode(mode) {
      const next: ReaderSettings = {
        ...get().settings,
        modes: { ...get().settings.modes, current: mode }
      };
      set({ settings: next, effective: resolveEffectiveSettings(next) });
      await persist(next);
    },

    patchMode(mode, patch) {
      return writeOverride(mode, patch);
    },

    patchActiveBionic(patch) {
      return writeOverride(get().settings.modes.current, { bionic: patch });
    },

    patchActiveTypography(patch) {
      return writeOverride(get().settings.modes.current, { typography: patch });
    },

    patchActiveRadar(patch) {
      return writeOverride(get().settings.modes.current, { radar: patch });
    },

    setActiveSkimLayer(layer) {
      return writeOverride(get().settings.modes.current, { skimLayer: layer });
    },

    async patchMemory(patch) {
      const next: ReaderSettings = {
        ...get().settings,
        memory: { ...get().settings.memory, ...patch }
      };
      set({ settings: next, effective: resolveEffectiveSettings(next) });
      await persist(next);
    },

    async toggleHostExcluded(host) {
      const current = get().settings.excludedHosts;
      const excludedHosts = current.includes(host)
        ? current.filter((h) => h !== host)
        : [...current, host];
      const next: ReaderSettings = { ...get().settings, excludedHosts };
      set({ settings: next, effective: resolveEffectiveSettings(next) });
      await persist(next);
    },

    async resetActiveMode() {
      const current = get().settings;
      const mode = current.modes.current;
      const { [mode]: _drop, ...rest } = current.modes.customizations;
      void _drop;
      const next: ReaderSettings = {
        ...current,
        modes: { ...current.modes, customizations: rest }
      };
      set({ settings: next, effective: resolveEffectiveSettings(next) });
      await persist(next);
    },

    async reset() {
      set({
        settings: DEFAULT_SETTINGS,
        effective: resolveEffectiveSettings(DEFAULT_SETTINGS)
      });
      await persist(DEFAULT_SETTINGS);
    }
  };
});
