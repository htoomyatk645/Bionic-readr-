import type { BehaviorSnapshot, EngagementState } from "~core/behavior";
import type { SnapshotTrajectory } from "../behavior_trajectory/trajectory";
import type { RiskAssessment } from "../types";

export interface ForecastedState {
  state: EngagementState;
  expectedAtMs: number;
  certainty: number;
}

export function forecastNextState(
  current: BehaviorSnapshot,
  _trajectory: SnapshotTrajectory,
  risks: RiskAssessment
): ForecastedState {
  void _trajectory;
  if (risks.fatigueRisk > 0.6) {
    return { state: "fatigued", expectedAtMs: risks.fatigueRiskHorizonMs, certainty: risks.fatigueRisk };
  }
  if (risks.abandonmentRisk > 0.6) {
    return { state: "drifting", expectedAtMs: 30_000, certainty: risks.abandonmentRisk };
  }
  if (risks.engagementDropRisk > 0.6) {
    return { state: "scanning", expectedAtMs: 30_000, certainty: risks.engagementDropRisk };
  }
  return { state: current.state, expectedAtMs: 0, certainty: 1 - risks.fatigueRisk };
}
