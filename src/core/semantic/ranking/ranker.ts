import type { RadarIntensity } from "~features/settings/types";
import type { RankedSentence, SemanticAnalysis, SentenceScore } from "../types";

const INTENSITY_QUOTA: Record<RadarIntensity, number> = {
  subtle: 0.08,
  medium: 0.14,
  pronounced: 0.22
};

const INTENSITY_FLOOR: Record<RadarIntensity, number> = {
  subtle: 1.6,
  medium: 1.2,
  pronounced: 0.9
};

export function buildAnalysis(
  scores: SentenceScore[],
  intensity: RadarIntensity
): SemanticAnalysis {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const ranked: RankedSentence[] = sorted.map((s, i) => ({
    ...s,
    rank: i,
    isImportant: false
  }));

  const quotaRatio = INTENSITY_QUOTA[intensity];
  const floor = INTENSITY_FLOOR[intensity];
  const quota = Math.max(1, Math.ceil(ranked.length * quotaRatio));

  for (let i = 0; i < ranked.length; i++) {
    const r = ranked[i];
    if (i < quota && r.score >= floor) r.isImportant = true;
  }

  const importantSentenceIds = new Set(
    ranked.filter((r) => r.isImportant).map((r) => r.sentenceId)
  );
  const scoreMap = new Map(scores.map((s) => [s.sentenceId, s]));

  return {
    importantSentenceIds,
    scores: scoreMap,
    ranked
  };
}
