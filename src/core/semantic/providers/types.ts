import type { RadarIntensity } from "~features/settings/types";
import type { ReadableBlock, SemanticAnalysis } from "../types";

export interface AnalysisRequest {
  blocks: ReadableBlock[];
  intensity: RadarIntensity;
  signal?: AbortSignal;
}

export interface SemanticProvider {
  readonly id: string;
  analyze(request: AnalysisRequest): Promise<SemanticAnalysis>;
}
