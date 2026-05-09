import { create } from "zustand";
import { getValue, onValueChanged, setValue } from "~core/storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "./defaults";
import type { ReaderSettings } from "./types";

interface SettingsState {
  settings: ReaderSettings;
  hydrated: boolean;
  hydrate(): Promise<void>;
  update<K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]): Promise<void>;
  patchBionic(patch: Partial<ReaderSettings["bionic"]>): Promise<void>;
  patchTypography(patch: Partial<ReaderSettings["typography"]>): Promise<void>;
  toggleHostExcluded(host: string): Promise<void>;
  reset(): Promise<void>;
}

let unsubscribe: (() => void) | null = null;

export const useSettings = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  async hydrate() {
    const stored = await getValue<ReaderSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
    set({ settings: { ...DEFAULT_SETTINGS, ...stored }, hydrated: true });
    if (unsubscribe) unsubscribe();
    unsubscribe = onValueChanged<ReaderSettings>(SETTINGS_KEY, (next) => {
      if (next) set({ settings: { ...DEFAULT_SETTINGS, ...next } });
    });
  },
  async update(key, value) {
    const next = { ...get().settings, [key]: value };
    set({ settings: next });
    await setValue(SETTINGS_KEY, next);
  },
  async patchBionic(patch) {
    const next = { ...get().settings, bionic: { ...get().settings.bionic, ...patch } };
    set({ settings: next });
    await setValue(SETTINGS_KEY, next);
  },
  async patchTypography(patch) {
    const next = {
      ...get().settings,
      typography: { ...get().settings.typography, ...patch }
    };
    set({ settings: next });
    await setValue(SETTINGS_KEY, next);
  },
  async toggleHostExcluded(host) {
    const current = get().settings.excludedHosts;
    const excludedHosts = current.includes(host)
      ? current.filter((h) => h !== host)
      : [...current, host];
    const next = { ...get().settings, excludedHosts };
    set({ settings: next });
    await setValue(SETTINGS_KEY, next);
  },
  async reset() {
    set({ settings: DEFAULT_SETTINGS });
    await setValue(SETTINGS_KEY, DEFAULT_SETTINGS);
  }
}));
