import { detectSignals } from "../heuristics/signals";
import { buildAnalysis } from "../ranking/ranker";
import { scoreSentence } from "../scoring/scorer";
import type { SentenceScore } from "../types";
import type { AnalysisRequest, SemanticProvider } from "./types";

export const localHeuristicProvider: SemanticProvider = {
  id: "local-heuristic-v1",
  async analyze({ blocks, intensity }: AnalysisRequest) {
    const scores: SentenceScore[] = [];
    for (const block of blocks) {
      if (block.kind === "heading") continue;
      block.sentences.forEach((sentence, idx) => {
        const signals = detectSignals(sentence, idx === 0);
        scores.push(scoreSentence(sentence, signals));
      });
    }
    return buildAnalysis(scores, intensity);
  }
};
