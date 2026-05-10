import type { BehaviorSnapshot } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import { expectedFatigueAt } from "~core/learning";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";

const HORIZON_MS = 60_000;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function fatigueRisk(
  current: BehaviorSnapshot,
  trajectory: SnapshotTrajectory,
  ctx: CognitiveQueryContext
): { risk: number; horizonMs: number } {
  const slope = trajectory.trend("fatigueScore");
  const projected = current.fatigueScore + slope * HORIZON_MS;
  const longHorizon = expectedFatigueAt(ctx, HORIZON_MS);
  const sensitivity = ctx.cognitive.fatigueSensitivityCurve;

  const score =
    projected * 0.55 + current.cognitiveLoadEstimate * 0.25 + longHorizon * sensitivity * 0.2;
  const risk = clamp01(sigmoid((score - 0.55) * 6));
  return { risk, horizonMs: HORIZON_MS };
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
