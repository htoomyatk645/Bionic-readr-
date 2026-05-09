export type SignalKind =
  | "topic"
  | "definition"
  | "conclusion"
  | "pivot"
  | "actionable"
  | "evidence"
  | "structural";

export interface SignalHit {
  kind: SignalKind;
  weight: number;
}

export interface Sentence {
  id: string;
  blockId: string;
  text: string;
  index: number;
}

export interface ReadableBlock {
  id: string;
  kind: BlockKind;
  text: string;
  sentences: Sentence[];
}

export type BlockKind =
  | "heading"
  | "paragraph"
  | "list-item"
  | "quote"
  | "caption"
  | "other";

export interface SentenceScore {
  sentenceId: string;
  blockId: string;
  score: number;
  signals: SignalHit[];
}

export interface RankedSentence extends SentenceScore {
  rank: number;
  isImportant: boolean;
}

export interface SemanticAnalysis {
  importantSentenceIds: ReadonlySet<string>;
  scores: ReadonlyMap<string, SentenceScore>;
  ranked: readonly RankedSentence[];
}
