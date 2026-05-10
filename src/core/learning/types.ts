import type { EngagementState } from "~core/behavior";

export type Archetype = "scanner" | "deep-reader" | "fragile" | "balanced";

export interface ArchetypeMembership {
  scanner: number;
  "deep-reader": number;
  fragile: number;
  balanced: number;
}

export interface ComfortCurve {
  densityComfort: number;
  paceComfort: number;
  emphasisComfort: number;
}

export interface UserCognitiveProfile {
  version: number;
  baselineAttentionCapacity: number;
  fatigueSensitivityCurve: number;
  optimalDensity: number;
  semanticTolerance: number;
  pacingPreference: number;
  frictionSusceptibility: number;
  engagementDepthTendency: number;
  modalityPreference: number;
  archetypeMembership: ArchetypeMembership;
  archetypeStability: number;
  observedSessions: number;
  totalActiveMs: number;
  updatedAt: number;
  createdAt: number;
}

export interface EmotionalCalibrationProfile {
  version: number;
  comfortCurve: ComfortCurve;
  cognitiveSmoothnessPreference: number;
  toleranceToDensity: number;
  transitionSensitivity: number;
  attentionFragilityIndex: number;
  predictiveTrust: number;
  updatedAt: number;
}

export interface SessionDigest {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  meanFocus: number;
  meanFatigue: number;
  meanEngagement: number;
  meanPacing: number;
  meanLoad: number;
  abandonmentSpikes: number;
  driftEpisodes: number;
  fatigueEpisodes: number;
  studyEpisodes: number;
  scanningEpisodes: number;
  dominantState: EngagementState;
  features: SessionFeatureVector;
  archetypeMembership: ArchetypeMembership;
}

export interface SessionFeatureVector {
  velocityMean: number;
  fatigueMean: number;
  engagementMean: number;
  focusMean: number;
  abandonmentMean: number;
  loadMean: number;
}

export interface TrajectoryRecord {
  version: number;
  recent: SessionDigest[];
}

export const PROFILE_VERSION = 1;
export const TRAJECTORY_VERSION = 1;
export const TRAJECTORY_MAX_SESSIONS = 30;
