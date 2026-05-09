import { LENGTH_SWEET_SPOT } from "../heuristics/weights";
import type { Sentence, SignalHit, SentenceScore } from "../types";

export function scoreSentence(sentence: Sentence, signals: SignalHit[]): SentenceScore {
  const wordCount = sentence.text.trim().split(/\s+/).length;

  let score = 0;
  for (const signal of signals) score += signal.weight;

  if (wordCount >= LENGTH_SWEET_SPOT.min && wordCount <= LENGTH_SWEET_SPOT.max) {
    score += 0.4;
  } else if (wordCount < 4) {
    score -= 0.6;
  } else if (wordCount > 60) {
    score -= 0.3;
  }

  if (/[?:]$/.test(sentence.text.trim())) score += 0.3;

  return {
    sentenceId: sentence.id,
    blockId: sentence.blockId,
    score,
    signals
  };
}
