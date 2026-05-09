import { canonicalUrl, readSession } from "./store";
import type { ReadingSession, WarmupSuggestion } from "./types";

const REVISIT_MIN_GAP_MS = 5 * 60 * 1000;
const REVISIT_MAX_GAP_MS = 30 * 24 * 60 * 60 * 1000;

export async function computeWarmup(
  url: string = window.location.href
): Promise<WarmupSuggestion | null> {
  const session = await readSession(canonicalUrl(url));
  if (!session) return null;

  const gap = Date.now() - session.lastVisitAt;
  if (gap < REVISIT_MIN_GAP_MS) return null;
  if (gap > REVISIT_MAX_GAP_MS) return null;

  if (session.position.scrollRatio < 0.04) return null;
  if (session.position.scrollRatio > 0.96) return null;

  return { message: composeMessage(session), scrollY: session.position.scrollY };
}

function composeMessage(session: ReadingSession): string {
  const pct = Math.round(session.position.scrollRatio * 100);
  const anchor = session.anchor;

  if (anchor && anchor.text) {
    const phrase = leadingPhrase(anchor.text);
    if (phrase) {
      return `You stopped near "${phrase}…"`;
    }
  }
  if (pct < 25) return `Picking up near the start — about ${pct}% in.`;
  if (pct < 60) return `Continuing where you paused, around ${pct}% through.`;
  return `Resuming near the end — about ${pct}% in.`;
}

function leadingPhrase(text: string): string | null {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  const words = cleaned.split(" ");
  const phrase = words.slice(0, Math.min(8, words.length)).join(" ");
  return phrase.length > 12 ? phrase : null;
}
