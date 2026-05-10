import type { BehaviorSnapshot } from "~core/behavior";
import type { CognitiveQueryContext } from "~core/learning";
import { abandonmentRisk } from "./risk_model/abandonment";
import { engagementDropRisk } from "./risk_model/engagement";
import { fatigueRisk } from "./risk_model/fatigue";
import { pacingMismatchRisk } from "./risk_model/pacing";
import { scoreConfidence } from "./confidence_scoring/confidence";
import { forecastNextState, type ForecastedState } from "./state_forecasting/forecast";
import {
  composeOverlays,
  predictiveOverlay
} from "./overlay/composer";
import {
  createTrajectory,
  type SnapshotTrajectory
} from "./behavior_trajectory/trajectory";
import type {
  PredictionConfidence,
  PredictiveAdaptiveOverlay,
  PredictiveSignal,
  RiskAssessment
} from "./types";

export type {
  PredictionConfidence,
  PredictiveAdaptiveOverlay,
  PredictiveSignal,
  RiskAssessment
} from "./types";
export type { ForecastedState } from "./state_forecasting/forecast";
export { composeOverlays, predictiveOverlay } from "./overlay/composer";

export interface PredictionEngine {
  ingest(snapshot: BehaviorSnapshot): void;
  predict(current: BehaviorSnapshot, ctx: CognitiveQueryContext): PredictiveSignal;
  forecast(current: BehaviorSnapshot, ctx: CognitiveQueryContext): ForecastedState;
  overlay(current: BehaviorSnapshot, ctx: CognitiveQueryContext): {
    signal: PredictiveSignal;
    overlay: PredictiveAdaptiveOverlay;
  };
  size(): number;
}

export function createPredictionEngine(): PredictionEngine {
  const trajectory: SnapshotTrajectory = createTrajectory();

  const computeRisks = (current: BehaviorSnapshot, ctx: CognitiveQueryContext): RiskAssessment => {
    const fatigue = fatigueRisk(current, trajectory, ctx);
    return {
      fatigueRisk: fatigue.risk,
      fatigueRiskHorizonMs: fatigue.horizonMs,
      engagementDropRisk: engagementDropRisk(current, trajectory, ctx),
      abandonmentRisk: abandonmentRisk(current, trajectory, ctx),
      pacingMismatchRisk: pacingMismatchRisk(current, trajectory, ctx)
    };
  };

  const computeConfidence = (ctx: CognitiveQueryContext): PredictionConfidence =>
    scoreConfidence(trajectory, ctx);

  return {
    ingest(snapshot) {
      trajectory.push(snapshot);
    },
    predict(current, ctx) {
      const risks = computeRisks(current, ctx);
      const confidence = computeConfidence(ctx);
      return { risks, confidence, generatedAt: current.generatedAt };
    },
    forecast(current, ctx) {
      const risks = computeRisks(current, ctx);
      return forecastNextState(current, trajectory, risks);
    },
    overlay(current, ctx) {
      const signal = this.predict(current, ctx);
      const overlay = predictiveOverlay(signal, ctx);
      return { signal, overlay };
    },
    size() {
      return trajectory.size();
    }
  };
}
