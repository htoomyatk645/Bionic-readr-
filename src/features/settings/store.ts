import { create } from "zustand";
import { getValue, onValueChanged, setValue } from "~core/storage";
import { resolveEffectiveSettings } from "~features/modes";
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings } from "./defaults";
import type {
  AdaptiveSettings,
  BionicSettings,
  EffectiveSettings,
  MemorySettings,
  ModeId,
  ModeOverride,
  RadarSettings,
  ReaderSettings,
  SkimLayer,
  Theme,
  TypographySettings
} from "./types";

interface SettingsState {
  settings: ReaderSettings;
  effective: EffectiveSettings;
  hydrated: boolean;
  hydrate(): Promise<void>;
  setMode(mode: ModeId): Promise<void>;
  setTheme(theme: Theme): Promise<void>;
  patchMode(mode: ModeId, patch: ModeOverride): Promise<void>;
  patchActiveBionic(patch: Partial<BionicSettings>): Promise<void>;
  patchActiveTypography(patch: Partial<TypographySettings>): Promise<void>;
  patchActiveRadar(patch: Partial<RadarSettings>): Promise<void>;
  setActiveSkimLayer(layer: SkimLayer): Promise<void>;
  patchMemory(patch: Partial<MemorySettings>): Promise<void>;
  patchAdaptive(patch: Partial<AdaptiveSettings>): Promise<void>;
  toggleHostExcluded(host: string): Promise<void>;
  resetActiveMode(): Promise<void>;
  reset(): Promise<void>;
}

let unsubscribe: (() => void) | null = null;

// Writes are debounced; while one is in flight, storage.onChanged can echo an
// *older* value back at us (e.g. mid slider-drag) and snap the UI backwards.
// Ignore change events until our own writes have settled.
let inflightWrites = 0;

async function persist(next: ReaderSettings) {
  inflightWrites++;
  try {
    await setValue(SETTINGS_KEY, next);
  } finally {
    inflightWrites--;
  }
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
      const merged = normalizeSettings(stored);
      set({ settings: merged, effective: resolveEffectiveSettings(merged), hydrated: true });
      if (unsubscribe) unsubscribe();
      unsubscribe = onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
        if (!next || inflightWrites > 0) return;
        const remerged = normalizeSettings(next);
        set({ settings: remerged, effective: resolveEffectiveSettings(remerged) });
      });
    },

    async setMode(mode) {
      const current = get().settings;
      const next: ReaderSettings = {
        ...current,
        // Keep each mode's own tweaks; switching modes is non-destructive.
        modes: { ...current.modes, current: mode }
      };
      set({ settings: next, effective: resolveEffectiveSettings(next) });
      await persist(next);
    },

    async setTheme(theme) {
      const next: ReaderSettings = { ...get().settings, theme };
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

    async patchAdaptive(patch) {
      const next: ReaderSettings = {
        ...get().settings,
        adaptive: { ...get().settings.adaptive, ...patch }
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
