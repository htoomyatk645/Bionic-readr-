import {
  PROFILE_VERSION,
  TRAJECTORY_VERSION,
  type EmotionalCalibrationProfile,
  type TrajectoryRecord,
  type UserCognitiveProfile
} from "../types";

export function migrateCognitive(input: unknown): UserCognitiveProfile | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<UserCognitiveProfile> & { version?: number };
  const version = typeof raw.version === "number" ? raw.version : 0;
  if (version > PROFILE_VERSION) return null;
  return { ...defaultCognitive(), ...raw, version: PROFILE_VERSION };
}

export function migrateEmotional(input: unknown): EmotionalCalibrationProfile | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<EmotionalCalibrationProfile> & { version?: number };
  const version = typeof raw.version === "number" ? raw.version : 0;
  if (version > PROFILE_VERSION) return null;
  return {
    ...defaultEmotional(),
    ...raw,
    comfortCurve: { ...defaultEmotional().comfortCurve, ...(raw.comfortCurve ?? {}) },
    version: PROFILE_VERSION
  };
}

export function migrateTrajectory(input: unknown): TrajectoryRecord | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<TrajectoryRecord> & { version?: number };
  const version = typeof raw.version === "number" ? raw.version : 0;
  if (version > TRAJECTORY_VERSION) return null;
  return {
    version: TRAJECTORY_VERSION,
    recent: Array.isArray(raw.recent) ? raw.recent : []
  };
}

export function defaultCognitive(): UserCognitiveProfile {
  const now = Date.now();
  return {
    version: PROFILE_VERSION,
    baselineAttentionCapacity: 0.55,
    fatigueSensitivityCurve: 0.5,
    optimalDensity: 0.5,
    semanticTolerance: 0.5,
    pacingPreference: 0.5,
    frictionSusceptibility: 0.4,
    engagementDepthTendency: 0.5,
    modalityPreference: 0.5,
    archetypeMembership: { scanner: 0.25, "deep-reader": 0.25, fragile: 0.25, balanced: 0.25 },
    archetypeStability: 0,
    observedSessions: 0,
    totalActiveMs: 0,
    updatedAt: now,
    createdAt: now
  };
}

export function defaultEmotional(): EmotionalCalibrationProfile {
  return {
    version: PROFILE_VERSION,
    comfortCurve: { densityComfort: 0.5, paceComfort: 0.5, emphasisComfort: 0.5 },
    cognitiveSmoothnessPreference: 0.5,
    toleranceToDensity: 0.5,
    transitionSensitivity: 0.5,
    attentionFragilityIndex: 0.4,
    predictiveTrust: 0.2,
    updatedAt: Date.now()
  };
}
