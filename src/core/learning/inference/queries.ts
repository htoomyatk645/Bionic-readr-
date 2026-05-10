import type { PatternSummary } from "../patterns/detect";
import type { EmotionalCalibrationProfile, UserCognitiveProfile } from "../types";

export interface CognitiveQueryContext {
  cognitive: UserCognitiveProfile;
  emotional: EmotionalCalibrationProfile;
  patterns: PatternSummary;
}

export function expectedFatigueAt(ctx: CognitiveQueryContext, futureMs: number): number {
  const onset = ctx.patterns.fatigueOnsetMs;
  const sensitivity = ctx.cognitive.fatigueSensitivityCurve;
  if (onset === null) return clamp01(sensitivity * (futureMs / (15 * 60_000)));
  const ratio = futureMs / onset;
  return clamp01(sensitivity * Math.tanh(ratio * 1.4));
}

export function predictiveTrust(ctx: CognitiveQueryContext, observedSessions: number): number {
  const dataConfidence = clamp01(observedSessions / 8);
  return clamp01(
    ctx.emotional.predictiveTrust * 0.7 + dataConfidence * 0.3 + ctx.cognitive.archetypeStability * 0.2
  );
}

export function preferredAnimationScale(ctx: CognitiveQueryContext): number {
  const fragility = ctx.emotional.attentionFragilityIndex;
  const smoothness = ctx.emotional.cognitiveSmoothnessPreference;
  return 1 + fragility * 0.4 + (1 - smoothness) * 0.2;
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
