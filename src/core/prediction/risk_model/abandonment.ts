import type { BehaviorSnapshot } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function abandonmentRisk(
  current: BehaviorSnapshot,
  trajectory: SnapshotTrajectory,
  ctx: CognitiveQueryContext
): number {
  const slope = trajectory.trend("abandonmentRisk");
  const susceptibility = ctx.cognitive.frictionSusceptibility;
  const score =
    current.abandonmentRisk * 0.6 +
    slope * 60_000 * 0.25 +
    susceptibility * 0.15 +
    Math.max(0, current.fatigueScore - 0.55) * 0.3;
  return clamp01(sigmoid((score - 0.5) * 5));
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
