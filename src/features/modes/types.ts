import type {
  BionicSettings,
  ModeId,
  RadarSettings,
  SkimLayer,
  TypographySettings
} from "~features/settings/types";

export interface ModePreset {
  id: ModeId;
  label: string;
  tagline: string;
  bionic: BionicSettings;
  typography: TypographySettings;
  skimLayer: SkimLayer;
  radar: RadarSettings;
}

export interface ModeMeta {
  id: ModeId;
  label: string;
  tagline: string;
}
