import type { CognitiveQueryContext } from "~core/learning";
import type { PredictionConfidence } from "../types";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";

export function scoreConfidence(
  trajectory: SnapshotTrajectory,
  ctx: CognitiveQueryContext
): PredictionConfidence {
  const dataPoints = trajectory.size();
  const short = clamp01(Math.tanh(dataPoints / 6));
  const medium = clamp01(Math.tanh(ctx.cognitive.observedSessions / 4));
  const long = clamp01(
    Math.tanh(ctx.cognitive.observedSessions / 12) * (0.6 + 0.4 * ctx.cognitive.archetypeStability)
  );
  const trust = ctx.emotional.predictiveTrust;
  const combined = clamp01(short * 0.4 + medium * 0.3 + long * 0.3) * (0.5 + 0.5 * trust);
  return { short, medium, long, combined };
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
