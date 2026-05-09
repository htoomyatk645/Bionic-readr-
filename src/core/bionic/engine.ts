import type { BionicOptions, FixationSplit, Intensity } from "./types";

const INTENSITY_RATIO: Record<Intensity, number> = {
  low: 0.35,
  medium: 0.45,
  high: 0.55,
  max: 0.7
};

const SHORT_WORD_FIXATION: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2
};

export function fixationFor(word: string, options: BionicOptions): FixationSplit {
  if (!word) return { emphasis: "", rest: "" };

  const len = word.length;

  if (len in SHORT_WORD_FIXATION) {
    const cut = SHORT_WORD_FIXATION[len as 1 | 2 | 3 | 4];
    return { emphasis: word.slice(0, cut), rest: word.slice(cut) };
  }

  const ratio = INTENSITY_RATIO[options.intensity] * options.fixationStrength;
  const cut = Math.max(1, Math.min(len - 1, Math.round(len * ratio)));
  return { emphasis: word.slice(0, cut), rest: word.slice(cut) };
}

const TOKEN_RE = /([\p{L}\p{N}'’\-]+)|([^\p{L}\p{N}'’\-]+)/gu;

export interface Token {
  kind: "word" | "gap";
  value: string;
}

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    if (match[1]) tokens.push({ kind: "word", value: match[1] });
    else if (match[2]) tokens.push({ kind: "gap", value: match[2] });
  }
  return tokens;
}

export function shouldEmphasize(word: string): boolean {
  if (word.length === 0) return false;
  if (/^\d+$/.test(word)) return false;
  if (/^[A-Z]{2,}$/.test(word)) return false;
  return true;
}

export const defaultBionicOptions: BionicOptions = {
  intensity: "medium",
  fixationStrength: 1,
  preserveCase: true
};
