export interface PersonalizationProfile {
  preferredFixationStrength: number;
  preferredLineHeight: number;
  preferredParagraphSpacing: number;
  radarSensitivity: number;
  pacingTolerance: number;
  fatigueThreshold: number;
  averageSessionMs: number;
  observedSessions: number;
}

export const DEFAULT_PROFILE: PersonalizationProfile = {
  preferredFixationStrength: 1,
  preferredLineHeight: 1.6,
  preferredParagraphSpacing: 1,
  radarSensitivity: 0.5,
  pacingTolerance: 0.5,
  fatigueThreshold: 0.6,
  averageSessionMs: 0,
  observedSessions: 0
};

export const PROFILE_KEY = "bionic-redr.profile.v1";
