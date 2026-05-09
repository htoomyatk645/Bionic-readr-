export interface ReadingPosition {
  scrollY: number;
  scrollRatio: number;
  viewportHeight: number;
  documentHeight: number;
}

export interface ReadingAnchor {
  blockId: string;
  blockKind: string;
  text: string;
}

export interface ReadingSession {
  url: string;
  hostname: string;
  title: string;
  position: ReadingPosition;
  anchor: ReadingAnchor | null;
  totalTimeMs: number;
  sessions: number;
  firstVisitAt: number;
  lastVisitAt: number;
}

export interface WarmupSuggestion {
  message: string;
  scrollY: number | null;
}
