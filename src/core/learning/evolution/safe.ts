import type { BehaviorSnapshot } from "~core/behavior";
import { archetypeStability, blendMembership } from "../clustering/drift";
import { detectPatterns } from "../patterns/detect";
import type { SessionDigest, UserCognitiveProfile } from "../types";

const SNAPSHOT_ALPHA = 0.012;
const SESSION_ALPHA = 0.06;
const ARCHETYPE_ALPHA = 0.18;

const MAX_DELTA_PER_TICK = 0.015;
const MAX_SESSION_DELTA = 0.06;

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function softStep(prev: number, target: number, alpha: number, maxDelta: number): number {
  const desired = prev + alpha * (target - prev);
  const delta = desired - prev;
  const limited = Math.max(-maxDelta, Math.min(maxDelta, delta));
  return clamp01(prev + limited);
}

export function integrateSnapshot(
  profile: UserCognitiveProfile,
  snapshot: BehaviorSnapshot
): UserCognitiveProfile {
  return {
    ...profile,
    baselineAttentionCapacity: softStep(
      profile.baselineAttentionCapacity,
      snapshot.focusScore,
      SNAPSHOT_ALPHA,
      MAX_DELTA_PER_TICK
    ),
    fatigueSensitivityCurve: softStep(
      profile.fatigueSensitivityCurve,
      snapshot.fatigueScore,
      SNAPSHOT_ALPHA,
      MAX_DELTA_PER_TICK
    ),
    engagementDepthTendency: softStep(
      profile.engagementDepthTendency,
      snapshot.engagementDepth,
      SNAPSHOT_ALPHA,
      MAX_DELTA_PER_TICK
    ),
    pacingPreference: softStep(
      profile.pacingPreference,
      snapshot.pacingStability,
      SNAPSHOT_ALPHA,
      MAX_DELTA_PER_TICK
    ),
    frictionSusceptibility: softStep(
      profile.frictionSusceptibility,
      Math.max(0, snapshot.cognitiveLoadEstimate - 0.4) / 0.6,
      SNAPSHOT_ALPHA,
      MAX_DELTA_PER_TICK
    ),
    updatedAt: snapshot.generatedAt
  };
}

export function integrateSessionDigest(
  profile: UserCognitiveProfile,
  digest: SessionDigest,
  recentDigests: readonly SessionDigest[]
): UserCognitiveProfile {
  const next: UserCognitiveProfile = {
    ...profile,
    optimalDensity: softStep(
      profile.optimalDensity,
      clamp01(digest.meanEngagement * 0.6 + (1 - digest.meanFatigue) * 0.4),
      SESSION_ALPHA,
      MAX_SESSION_DELTA
    ),
    semanticTolerance: softStep(
      profile.semanticTolerance,
      clamp01(1 - digest.abandonmentSpikes / 10),
      SESSION_ALPHA,
      MAX_SESSION_DELTA
    ),
    modalityPreference: softStep(
      profile.modalityPreference,
      modalityFromDigest(digest),
      SESSION_ALPHA,
      MAX_SESSION_DELTA
    ),
    archetypeMembership: blendMembership(
      profile.archetypeMembership,
      [...recentDigests, digest],
      ARCHETYPE_ALPHA
    ),
    archetypeStability: archetypeStability([...recentDigests, digest]),
    observedSessions: profile.observedSessions + 1,
    totalActiveMs: profile.totalActiveMs + digest.durationMs,
    updatedAt: Date.now()
  };

  const patterns = detectPatterns([...recentDigests, digest]);
  if (patterns.fragileAttention) {
    next.fatigueSensitivityCurve = softStep(
      next.fatigueSensitivityCurve,
      Math.max(next.fatigueSensitivityCurve, 0.6),
      SESSION_ALPHA,
      MAX_SESSION_DELTA
    );
  }
  if (patterns.stableEngagement) {
    next.baselineAttentionCapacity = softStep(
      next.baselineAttentionCapacity,
      Math.max(next.baselineAttentionCapacity, 0.6),
      SESSION_ALPHA,
      MAX_SESSION_DELTA
    );
  }

  return next;
}

function modalityFromDigest(d: SessionDigest): number {
  const studyish = d.studyEpisodes;
  const scanish = d.scanningEpisodes;
  if (studyish + scanish === 0) return 0.5;
  return clamp01(studyish / (studyish + scanish));
}
