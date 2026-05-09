import type { Intensity } from "~core/bionic/types";

export type Theme = "system" | "light" | "dark";
export type SkimLayer = "headlines" | "key" | "full";
export type ModeId = "focus" | "flow" | "study" | "deep";
export type RadarIntensity = "subtle" | "medium" | "pronounced";

export interface TypographySettings {
  fontScale: number;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
}

export interface BionicSettings {
  enabled: boolean;
  intensity: Intensity;
  fixationStrength: number;
}

export interface RadarSettings {
  enabled: boolean;
  intensity: RadarIntensity;
}

export interface MemorySettings {
  enabled: boolean;
  showWarmup: boolean;
}

export interface AdaptiveSettings {
  enabled: boolean;
  frictionRelief: boolean;
}

export interface ModeOverride {
  bionic?: Partial<BionicSettings>;
  typography?: Partial<TypographySettings>;
  skimLayer?: SkimLayer;
  radar?: Partial<RadarSettings>;
}

export interface ModesState {
  current: ModeId;
  customizations: Partial<Record<ModeId, ModeOverride>>;
}

export interface ReaderSettings {
  theme: Theme;
  excludedHosts: string[];
  modes: ModesState;
  memory: MemorySettings;
  adaptive: AdaptiveSettings;
}

export interface EffectiveSettings {
  mode: ModeId;
  bionic: BionicSettings;
  typography: TypographySettings;
  skimLayer: SkimLayer;
  radar: RadarSettings;
}
