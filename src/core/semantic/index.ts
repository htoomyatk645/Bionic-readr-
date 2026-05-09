import * as cache from "./cache/memory";
import { hashBlocks } from "./cache/contentHash";
import { defaultProvider } from "./providers";
import type { SemanticProvider } from "./providers/types";
import type { RadarIntensity } from "~features/settings/types";
import type { ReadableBlock, SemanticAnalysis } from "./types";

interface AnalyzeOptions {
  provider?: SemanticProvider;
  intensity: RadarIntensity;
  signal?: AbortSignal;
}

export async function analyzeBlocks(
  blocks: ReadableBlock[],
  { provider = defaultProvider(), intensity, signal }: AnalyzeOptions
): Promise<SemanticAnalysis> {
  const key = `${provider.id}:${intensity}:${hashBlocks(blocks)}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const analysis = await provider.analyze({ blocks, intensity, signal });
  cache.set(key, analysis);
  return analysis;
}

export type { SemanticProvider } from "./providers/types";
export type {
  ReadableBlock,
  Sentence,
  SemanticAnalysis,
  SentenceScore,
  RankedSentence,
  BlockKind,
  SignalKind,
  SignalHit
} from "./types";
export { defaultProvider } from "./providers";
