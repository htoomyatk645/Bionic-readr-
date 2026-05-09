import type { Intensity } from "~core/bionic/types";

export type Theme = "system" | "light" | "dark";
export type SkimLayer = "headlines" | "key" | "full";

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

export interface ReaderSettings {
  bionic: BionicSettings;
  typography: TypographySettings;
  skimLayer: SkimLayer;
  theme: Theme;
  excludedHosts: string[];
}

export interface SiteOverride {
  host: string;
  enabled: boolean;
}
