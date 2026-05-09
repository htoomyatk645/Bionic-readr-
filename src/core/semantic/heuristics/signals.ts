import type { Sentence, SignalHit, SignalKind } from "../types";
import { SIGNAL_WEIGHTS } from "./weights";

interface PatternRule {
  kind: SignalKind;
  test: RegExp;
  weight?: number;
}

const PATTERN_RULES: PatternRule[] = [
  { kind: "definition", test: /\b(is|are)\s+defined\s+as\b/i },
  { kind: "definition", test: /\bmeans?\s+that\b/i },
  { kind: "definition", test: /\brefers?\s+to\b/i },
  { kind: "definition", test: /\b(known\s+as|called)\b/i },
  { kind: "conclusion", test: /^(therefore|thus|in\s+conclusion|in\s+summary|to\s+sum\s+up|overall|ultimately|in\s+short)\b/i },
  { kind: "conclusion", test: /\b(therefore|thus|hence|consequently|as\s+a\s+result)\b/i, weight: 0.7 },
  { kind: "pivot", test: /^(however|but|yet|although|nevertheless|on\s+the\s+other\s+hand|in\s+contrast|conversely)\b/i },
  { kind: "pivot", test: /\b(however|whereas|whilst)\b/i, weight: 0.7 },
  { kind: "actionable", test: /^(do|don't|use|avoid|consider|remember|note|ensure|prefer|never|always|try|start|stop|build|write|run)\b/i },
  { kind: "actionable", test: /\b(must|should|need\s+to|recommend(?:ed)?)\b/i, weight: 0.7 },
  { kind: "evidence", test: /\b(\d+(?:\.\d+)?\s*%|\d{4})\b/ },
  { kind: "evidence", test: /\b(according\s+to|study|research|data\s+shows?|found\s+that)\b/i },
  { kind: "structural", test: /^(first|second|third|finally|next|then)\b/i }
];

export function detectSignals(sentence: Sentence, isFirstInBlock: boolean): SignalHit[] {
  const hits: SignalHit[] = [];
  const text = sentence.text.trim();

  if (isFirstInBlock && text.length > 0) {
    hits.push({ kind: "topic", weight: SIGNAL_WEIGHTS.topic });
  }

  for (const rule of PATTERN_RULES) {
    if (rule.test.test(text)) {
      hits.push({
        kind: rule.kind,
        weight: rule.weight ?? SIGNAL_WEIGHTS[rule.kind]
      });
    }
  }

  return hits;
}
