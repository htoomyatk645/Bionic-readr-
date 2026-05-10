import type { BehaviorSnapshot } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function engagementDropRisk(
  current: BehaviorSnapshot,
  trajectory: SnapshotTrajectory,
  ctx: CognitiveQueryContext
): number {
  const slope = trajectory.trend("engagementDepth");
  const baseline = ctx.cognitive.engagementDepthTendency;
  const gap = baseline - current.engagementDepth;
  const score = -slope * 60_000 * 0.55 + gap * 0.4 + current.abandonmentRisk * 0.15;
  return clamp01(sigmoid(score * 5));
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
