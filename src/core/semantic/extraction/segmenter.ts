const ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "st",
  "vs",
  "etc",
  "e.g",
  "i.e",
  "fig",
  "no",
  "vol",
  "ch",
  "pp",
  "ph.d",
  "u.s",
  "u.k",
  "a.m",
  "p.m"
]);

const TERMINATORS = /[.!?…]/;

export interface Segment {
  text: string;
  endsSentence: boolean;
  start: number;
  end: number;
}

export function segmentSentences(text: string): Segment[] {
  const segments: Segment[] = [];
  if (!text) return segments;

  let i = 0;
  let segStart = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    if (TERMINATORS.test(ch)) {
      let j = i + 1;
      while (j < len && /[.!?…)\]"'”’]/.test(text[j])) j++;

      const next = text[j];
      const endsSentence =
        (j === len || /\s/.test(next)) && !isAbbreviation(text, i);

      if (endsSentence) {
        const segText = text.slice(segStart, j);
        if (segText.trim().length > 0) {
          segments.push({
            text: segText,
            endsSentence: true,
            start: segStart,
            end: j
          });
        }
        let k = j;
        while (k < len && /\s/.test(text[k])) k++;
        if (k > j) {
          segments.push({
            text: text.slice(j, k),
            endsSentence: false,
            start: j,
            end: k
          });
        }
        segStart = k;
        i = k;
        continue;
      }
    }
    i++;
  }

  if (segStart < len) {
    segments.push({
      text: text.slice(segStart, len),
      endsSentence: false,
      start: segStart,
      end: len
    });
  }

  return segments;
}

function isAbbreviation(text: string, periodIndex: number): boolean {
  let k = periodIndex - 1;
  while (k >= 0 && /[A-Za-z.]/.test(text[k])) k--;
  const word = text.slice(k + 1, periodIndex).toLowerCase();
  return ABBREVIATIONS.has(word);
}

export function splitParagraphIntoSentences(text: string): string[] {
  return extractSentenceSpans(text).map((s) => s.text.trim()).filter((s) => s.length > 0);
}

export interface SentenceSpan {
  text: string;
  start: number;
  end: number;
}

export function extractSentenceSpans(text: string): SentenceSpan[] {
  if (!text || !text.trim()) return [];
  const spans: SentenceSpan[] = [];
  for (const seg of segmentSentences(text)) {
    if (seg.text.trim().length === 0) continue;
    spans.push({ text: seg.text, start: seg.start, end: seg.end });
  }
  return spans;
}
