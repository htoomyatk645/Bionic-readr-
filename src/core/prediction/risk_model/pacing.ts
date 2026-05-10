import type { BehaviorSnapshot } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function pacingMismatchRisk(
  current: BehaviorSnapshot,
  trajectory: SnapshotTrajectory,
  ctx: CognitiveQueryContext
): number {
  const slope = trajectory.trend("pacingStability");
  const preference = ctx.cognitive.pacingPreference;
  const gap = preference - current.pacingStability;
  const score = gap * 0.55 - slope * 60_000 * 0.4 + (1 - ctx.emotional.cognitiveSmoothnessPreference) * 0.2;
  return clamp01(sigmoid(score * 5));
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
