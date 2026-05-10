import type { AdaptiveOverlay } from "~core/behavior";

export interface RiskAssessment {
  fatigueRisk: number;
  fatigueRiskHorizonMs: number;
  engagementDropRisk: number;
  abandonmentRisk: number;
  pacingMismatchRisk: number;
}

export interface PredictionConfidence {
  short: number;
  medium: number;
  long: number;
  combined: number;
}

export interface PredictiveSignal {
  risks: RiskAssessment;
  confidence: PredictionConfidence;
  generatedAt: number;
}

export type PredictiveAdaptiveOverlay = AdaptiveOverlay & {
  predictive: true;
};
